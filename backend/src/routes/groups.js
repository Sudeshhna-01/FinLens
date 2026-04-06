const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function displayUser(member) {
  if (member.user) {
    return {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      isGuest: false
    };
  }
  return {
    id: member.id,
    name: member.guestName || 'Guest',
    email: null,
    isGuest: true
  };
}

/** Persist creator as a member so splits always use real GroupMember rows. */
async function ensureCreatorMember(groupId, creatorId) {
  const exists = await prisma.groupMember.findFirst({
    where: { groupId, userId: creatorId }
  });
  if (exists) return;
  await prisma.groupMember.create({
    data: { groupId, userId: creatorId }
  });
}

function resolveSplitGroupMemberId(split, members) {
  if (split.groupMemberId) return split.groupMemberId;
  if (split.userId) {
    const m = members.find((x) => x.userId === split.userId);
    return m ? m.id : null;
  }
  return null;
}

/**
 * Some legacy groups may not have the creator in GroupMember; expense splits need every participant.
 */
async function withCreatorInMembers(group) {
  if (!group?.members) return group;
  const hasCreator = group.members.some((m) => m.userId === group.creatorId);
  if (hasCreator) return group;

  const creatorUser = await prisma.user.findUnique({
    where: { id: group.creatorId },
    select: { id: true, name: true, email: true }
  });
  if (!creatorUser) return group;

  return {
    ...group,
    members: [
      {
        id: `creator-${group.creatorId}`,
        groupId: group.id,
        userId: creatorUser.id,
        joinedAt: group.createdAt,
        user: creatorUser
      },
      ...group.members
    ]
  };
}

// List groups — register before GET /:groupId
router.get('/', async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      where: {
        OR: [
          { creatorId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { joinedAt: 'asc' }
        },
        _count: {
          select: { groupExpenses: true }
        }
      }
    });

    const enriched = await Promise.all(groups.map((g) => withCreatorInMembers(g)));
    res.json(enriched);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Search users — before GET /:groupId so path /users/search/... is not captured as groupId
router.get('/users/search/:query', async (req, res) => {
  try {
    const { query } = req.params;

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } }
            ]
          },
          { id: { not: req.user.id } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 10
    });

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Single group with full member list (fresh for expense modal)
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        OR: [
          { creatorId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { joinedAt: 'asc' }
        },
        _count: {
          select: { groupExpenses: true }
        }
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found or access denied' });
    }

    await ensureCreatorMember(group.id, group.creatorId);
    const refreshed = await prisma.group.findFirst({
      where: {
        id: groupId,
        OR: [
          { creatorId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { joinedAt: 'asc' }
        },
        _count: {
          select: { groupExpenses: true }
        }
      }
    });

    const enriched = await withCreatorInMembers(refreshed);
    res.json(enriched);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Create group
router.post('/',
  [
    body('name').trim().notEmpty(),
    body('description').optional().trim(),
    body('members').optional().isArray()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, members = [] } = req.body;

      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { email: true }
      });

      const creatorEmail = normalizeEmail(currentUser.email);
      const memberCreates = [{ userId: req.user.id }];

      const addRegisteredUser = (userId) => {
        if (userId === req.user.id) return;
        if (memberCreates.some((c) => c.userId === userId)) return;
        memberCreates.push({ userId });
      };

      const addGuest = (rawName) => {
        const label = String(rawName || '').trim();
        if (!label) return;
        memberCreates.push({ guestName: label });
      };

      for (const member of members) {
        const guestName = String(member.guestName || member.name || '').trim();
        const em = member.email ? normalizeEmail(member.email) : '';

        if (em) {
          if (em === creatorEmail) continue;
          const found = await prisma.user.findUnique({ where: { email: em } });
          if (found) addRegisteredUser(found.id);
          else addGuest(guestName || em.split('@')[0] || 'Guest');
        } else if (guestName) {
          addGuest(guestName);
        }
      }

      const group = await prisma.group.create({
        data: {
          name,
          description,
          creatorId: req.user.id,
          members: {
            create: memberCreates
          }
        },
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      res.status(201).json(group);
    } catch (error) {
      console.error('Error creating group:', error);
      
      // Provide more specific error messages
      if (error.code === 'P2002') {
        return res.status(400).json({ 
          error: 'Group creation failed', 
          details: 'Duplicate member or constraint violation' 
        });
      }
      
      if (error.code === 'P2025') {
        return res.status(400).json({ 
          error: 'Group creation failed', 
          details: 'User not found for one of the member emails' 
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to create group',
        details: error.message 
      });
    }
  }
);

// Add member to group (registered email or name-only guest)
router.post('/:groupId/members',
  [
    body('email').optional({ values: 'falsy' }).trim().isEmail(),
    body('guestName').optional({ values: 'falsy' }).trim().isLength({ min: 1, max: 120 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { groupId } = req.params;
      const emailRaw = req.body.email ? String(req.body.email).trim() : '';
      const guestNameRaw = req.body.guestName ? String(req.body.guestName).trim() : '';

      if (!emailRaw && !guestNameRaw) {
        return res.status(400).json({ error: 'Provide a registered user email or a guest name' });
      }

      const group = await prisma.group.findFirst({
        where: {
          id: groupId,
          OR: [
            { creatorId: req.user.id },
            { members: { some: { userId: req.user.id } } }
          ]
        }
      });

      if (!group) {
        return res.status(404).json({ error: 'Group not found or access denied' });
      }

      if (emailRaw) {
        const em = normalizeEmail(emailRaw);
        const userToAdd = await prisma.user.findUnique({
          where: { email: em }
        });

        if (!userToAdd) {
          const label = guestNameRaw || em.split('@')[0] || 'Guest';
          const member = await prisma.groupMember.create({
            data: { groupId, guestName: label }
          });
          return res.status(201).json({
            ...member,
            user: null
          });
        }

        const member = await prisma.groupMember.create({
          data: {
            groupId,
            userId: userToAdd.id
          },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        });

        return res.status(201).json(member);
      }

      const member = await prisma.groupMember.create({
        data: { groupId, guestName: guestNameRaw }
      });

      res.status(201).json({
        ...member,
        user: null
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'User is already a member' });
      }
      console.error('Error adding member:', error);
      res.status(500).json({ error: 'Failed to add member' });
    }
  }
);

// Create group expense with enhanced split options
router.post('/:groupId/expenses',
  [
    body('amount')
      .custom((v) => {
        const n = Number.parseFloat(String(v));
        return !Number.isNaN(n) && n >= 0;
      })
      .withMessage('Amount must be a non-negative number'),
    body('description').trim().notEmpty(),
    body('category').trim().notEmpty(),
    body('splitType').isIn(['equal', 'unequal', 'percentage', 'shares']),
    body('splits').optional().isArray()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const msg = errors.array().map((e) => e.msg).join(' ');
        return res.status(400).json({ error: msg, errors: errors.array() });
      }

      const { groupId } = req.params;
      const { amount, description, category, date, splitType, splits, paidBy } = req.body;

      let group = await prisma.group.findFirst({
        where: {
          id: groupId,
          OR: [
            { creatorId: req.user.id },
            { members: { some: { userId: req.user.id } } }
          ]
        },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      if (!group) {
        return res.status(404).json({ error: 'Group not found or access denied' });
      }

      await ensureCreatorMember(group.id, group.creatorId);
      group = await prisma.group.findFirst({
        where: {
          id: groupId,
          OR: [
            { creatorId: req.user.id },
            { members: { some: { userId: req.user.id } } }
          ]
        },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      group = await withCreatorInMembers(group);

      const expenseAmount = parseFloat(amount, 10);
      const payerId = paidBy || req.user.id;
      const payerMember = group.members.find((m) => m.userId === payerId);
      if (!payerMember || !payerMember.userId) {
        return res.status(400).json({
          error: 'Payer must be a registered group member (guests cannot be recorded as payer)'
        });
      }

      const memberIdSet = new Set(group.members.map((m) => m.id));

      const splitPaid = (gmId) => {
        const m = group.members.find((x) => x.id === gmId);
        return Boolean(m && m.userId && m.userId === payerId);
      };

      let processedSplits = [];

      switch (splitType) {
        case 'equal': {
          const equalAmount = expenseAmount / group.members.length;
          processedSplits = group.members.map((member) => ({
            groupMemberId: member.id,
            amount: equalAmount,
            isPaid: splitPaid(member.id)
          }));
          break;
        }

        case 'unequal': {
          if (!splits || splits.length === 0) {
            return res.status(400).json({ error: 'Splits are required for unequal split' });
          }
          const totalSplit = splits.reduce((sum, split) => sum + parseFloat(split.amount, 10), 0);
          if (Math.abs(totalSplit - expenseAmount) > 0.01) {
            return res.status(400).json({ error: 'Splits must sum to total amount' });
          }
          processedSplits = splits
            .map((split) => {
              const gmId = resolveSplitGroupMemberId(split, group.members);
              if (!gmId || !memberIdSet.has(gmId)) return null;
              return {
                groupMemberId: gmId,
                amount: parseFloat(split.amount, 10),
                isPaid: splitPaid(gmId)
              };
            })
            .filter(Boolean);
          if (processedSplits.length !== splits.length) {
            return res.status(400).json({ error: 'Each split must reference a valid group member' });
          }
          break;
        }

        case 'percentage': {
          if (!splits || splits.length === 0) {
            return res.status(400).json({ error: 'Splits are required for percentage split' });
          }
          const totalPercentage = splits.reduce((sum, split) => sum + parseFloat(split.percentage, 10), 0);
          if (Math.abs(totalPercentage - 100) > 0.01) {
            return res.status(400).json({ error: 'Percentages must sum to 100%' });
          }
          processedSplits = splits
            .map((split) => {
              const gmId = resolveSplitGroupMemberId(split, group.members);
              if (!gmId || !memberIdSet.has(gmId)) return null;
              return {
                groupMemberId: gmId,
                amount: (expenseAmount * parseFloat(split.percentage, 10)) / 100,
                isPaid: splitPaid(gmId)
              };
            })
            .filter(Boolean);
          if (processedSplits.length !== splits.length) {
            return res.status(400).json({ error: 'Each split must reference a valid group member' });
          }
          break;
        }

        case 'shares': {
          if (!splits || splits.length === 0) {
            return res.status(400).json({ error: 'Splits are required for shares split' });
          }
          const totalShares = splits.reduce((sum, split) => sum + parseFloat(split.shares, 10), 0);
          if (totalShares === 0) {
            return res.status(400).json({ error: 'Total shares must be greater than 0' });
          }
          processedSplits = splits
            .map((split) => {
              const gmId = resolveSplitGroupMemberId(split, group.members);
              if (!gmId || !memberIdSet.has(gmId)) return null;
              return {
                groupMemberId: gmId,
                amount: (expenseAmount * parseFloat(split.shares, 10)) / totalShares,
                isPaid: splitPaid(gmId)
              };
            })
            .filter(Boolean);
          if (processedSplits.length !== splits.length) {
            return res.status(400).json({ error: 'Each split must reference a valid group member' });
          }
          break;
        }
      }

      // Create expense and group expense
      const expense = await prisma.expense.create({
        data: {
          userId: req.user.id,
          amount: expenseAmount,
          description,
          category,
          date: date ? new Date(date) : new Date()
        }
      });

      const groupExpense = await prisma.groupExpense.create({
        data: {
          groupId,
          expenseId: expense.id,
          paidBy: payerId,
          amount: expenseAmount,
          description,
          category,
          date: date ? new Date(date) : new Date(),
          splits: {
            create: processedSplits.map((s) => ({
              groupMemberId: s.groupMemberId,
              amount: s.amount,
              isPaid: Boolean(s.isPaid)
            }))
          }
        },
        include: {
          splits: true,
          group: {
            include: {
              members: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true }
                  }
                }
              }
            }
          }
        }
      });

      res.status(201).json(groupExpense);
    } catch (error) {
      console.error('Error creating group expense:', error);
      res.status(500).json({
        error: 'Failed to create group expense',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
  }
);

// Get group expenses
router.get('/:groupId/expenses', async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        OR: [
          { creatorId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found or access denied' });
    }

    const expenses = await prisma.groupExpense.findMany({
      where: { groupId },
      include: {
        splits: {
          include: {
            groupMember: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        },
        group: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching group expenses:', error);
    res.status(500).json({ error: 'Failed to fetch group expenses' });
  }
});

// Get group summary (who owes whom) - Splitwise style
router.get('/:groupId/summary', async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        OR: [
          { creatorId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found or access denied' });
    }

    await ensureCreatorMember(group.id, group.creatorId);
    const refreshed = await prisma.group.findFirst({
      where: {
        id: groupId,
        OR: [
          { creatorId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    const groupForSummary = await withCreatorInMembers(refreshed);

    const expenses = await prisma.groupExpense.findMany({
      where: { groupId },
      include: {
        splits: true
      },
      orderBy: { date: 'desc' }
    });

    const balances = {};
    groupForSummary.members.forEach((member) => {
      balances[member.id] = {
        memberId: member.id,
        user: displayUser(member),
        userId: member.userId,
        balance: 0,
        totalPaid: 0,
        totalOwed: 0
      };
    });

    expenses.forEach((expense) => {
      const payerMember = groupForSummary.members.find((m) => m.userId === expense.paidBy);
      if (!payerMember || !balances[payerMember.id]) return;
      balances[payerMember.id].balance += expense.amount;
      balances[payerMember.id].totalPaid += expense.amount;

      expense.splits.forEach((split) => {
        const mid = split.groupMemberId;
        if (!mid || !balances[mid]) return;
        balances[mid].balance -= split.amount;
        balances[mid].totalOwed += split.amount;
      });
    });

    // Calculate who owes whom (Splitwise algorithm)
    const debtors = [];
    const creditors = [];

    Object.values(balances).forEach(person => {
      if (person.balance > 0) {
        creditors.push({ ...person, amount: person.balance });
      } else if (person.balance < 0) {
        debtors.push({ ...person, amount: Math.abs(person.balance) });
      }
    });

    const settlements = [];
    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];

      const settlementAmount = Math.min(debtor.amount, creditor.amount);

      if (settlementAmount > 0.01) {
        settlements.push({
          debtor: debtor.user,
          creditor: creditor.user,
          amount: parseFloat(settlementAmount.toFixed(2)),
          canSettle: Boolean(debtor.userId && creditor.userId)
        });
      }

      debtor.amount -= settlementAmount;
      creditor.amount -= settlementAmount;

      if (debtor.amount <= 0.01) debtorIndex++;
      if (creditor.amount <= 0.01) creditorIndex++;
    }

    // Calculate statistics
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const averageExpense = expenses.length > 0 ? totalAmount / expenses.length : 0;

    const summary = {
      group: {
        id: groupForSummary.id,
        name: groupForSummary.name,
        memberCount: groupForSummary.members.length
      },
      balances: Object.values(balances).map((person) => ({
        user: person.user,
        balance: parseFloat(person.balance.toFixed(2)),
        totalPaid: parseFloat(person.totalPaid.toFixed(2)),
        totalOwed: parseFloat(person.totalOwed.toFixed(2))
      })),
      settlements,
      statistics: {
        totalExpenses: expenses.length,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        averageExpense: parseFloat(averageExpense.toFixed(2)),
        totalSettlements: settlements.length
      },
      recentExpenses: expenses.slice(0, 5).map((expense) => {
        const payerMember = groupForSummary.members.find((m) => m.userId === expense.paidBy);
        return {
          id: expense.id,
          description: expense.description,
          amount: parseFloat(expense.amount.toFixed(2)),
          date: expense.date,
          paidBy: payerMember
            ? displayUser(payerMember)
            : {
                id: expense.paidBy,
                name: 'Member',
                email: null,
                isGuest: false
              },
          category: expense.category
        };
      })
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching group summary:', error);
    res.status(500).json({ error: 'Failed to fetch group summary' });
  }
});

// Settle up between users
router.post('/:groupId/settle', [
  body('fromUserId').notEmpty(),
  body('toUserId').notEmpty(),
  body('amount').isFloat({ min: 0.01 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { groupId } = req.params;
    const { fromUserId, toUserId, amount } = req.body;

    // Verify user is part of group
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        OR: [
          { creatorId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found or access denied' });
    }

    // Verify both users are group members
    const fromMember = await prisma.groupMember.findFirst({
      where: { groupId, userId: fromUserId }
    });

    const toMember = await prisma.groupMember.findFirst({
      where: { groupId, userId: toUserId }
    });

    if (!fromMember || !toMember) {
      return res.status(400).json({ error: 'Both users must be group members' });
    }

    // Create settlement record
    const settlement = await prisma.groupSettlement.create({
      data: {
        groupId,
        fromUserId,
        toUserId,
        amount: parseFloat(amount),
        settledBy: req.user.id,
        settledAt: new Date()
      },
      include: {
        fromUser: {
          select: { id: true, name: true, email: true }
        },
        toUser: {
          select: { id: true, name: true, email: true }
        },
        settledByUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json(settlement);
  } catch (error) {
    console.error('Error creating settlement:', error);
    res.status(500).json({ error: 'Failed to create settlement' });
  }
});

// Delete group
router.delete('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verify user is the creator of the group
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        creatorId: req.user.id
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found or access denied' });
    }

    // Delete the group (this will cascade delete members, expenses, etc.)
    await prisma.group.delete({
      where: { id: groupId }
    });

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

module.exports = router;
