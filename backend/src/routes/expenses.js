const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// Get all expenses for user
router.get('/', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.user.id },
      include: {
        tags: true
      },
      orderBy: { date: 'desc' }
    });

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Get expense by ID
router.get('/:id', async (req, res) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        tags: true
      }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// Create expense
router.post('/',
  [
    body('amount').isFloat({ min: 0 }),
    body('description').trim().notEmpty(),
    body('category').trim().notEmpty(),
    body('date').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, description, category, date, tags } = req.body;

      const expense = await prisma.expense.create({
        data: {
          userId: req.user.id,
          amount: parseFloat(amount),
          description,
          category,
          date: date ? new Date(date) : new Date(),
          tags: tags ? {
            create: tags.map(tag => ({ tag }))
          } : undefined
        },
        include: {
          tags: true
        }
      });

      res.status(201).json(expense);
    } catch (error) {
      console.error('Error creating expense:', error);
      res.status(500).json({ error: 'Failed to create expense' });
    }
  }
);

// Update expense
router.put('/:id',
  [
    body('amount').optional().isFloat({ min: 0 }),
    body('description').optional().trim().notEmpty(),
    body('category').optional().trim().notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const expense = await prisma.expense.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id
        }
      });

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      const updated = await prisma.expense.update({
        where: { id: req.params.id },
        data: req.body,
        include: {
          tags: true
        }
      });

      res.json(updated);
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).json({ error: 'Failed to update expense' });
    }
  }
);

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await prisma.expense.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Get expenses by category
router.get('/stats/category', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.user.id },
      select: {
        category: true,
        amount: true
      }
    });

    const categoryStats = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    res.json(categoryStats);
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({ error: 'Failed to fetch category stats' });
  }
});

// Get expenses by month
router.get('/stats/monthly', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.user.id },
      select: {
        date: true,
        amount: true
      }
    });

    const monthlyStats = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {});

    res.json(monthlyStats);
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    res.status(500).json({ error: 'Failed to fetch monthly stats' });
  }
});

module.exports = router;
