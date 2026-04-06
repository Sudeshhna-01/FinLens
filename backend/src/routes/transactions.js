const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const prisma = new PrismaClient();

router.use(authenticateToken);

// Get all transactions for a user
router.get('/', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
      include: {
        stock: {
          select: { symbol: true }
        }
      }
    });

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Create a new transaction
router.post('/',
  [
    body('type').isIn(['buy', 'sell']),
    body('symbol').trim().notEmpty(),
    body('quantity').isFloat({ min: 0.01 }),
    body('price').isFloat({ min: 0.01 }),
    body('date').isISO8601().toDate(),
    body('notes').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, symbol, quantity, price, date, notes } = req.body;

      // Create or find stock
      let stock = await prisma.stock.findUnique({
        where: { symbol: symbol.toUpperCase() }
      });

      if (!stock) {
        stock = await prisma.stock.create({
          data: {
            symbol: symbol.toUpperCase(),
            name: symbol.toUpperCase(), // Could be enhanced with API call
            currentPrice: parseFloat(price)
          }
        });
      }

      const transaction = await prisma.transaction.create({
        data: {
          userId: req.user.id,
          stockId: stock.id,
          type,
          quantity: parseFloat(quantity),
          price: parseFloat(price),
          date: new Date(date),
          notes: notes || null
        },
        include: {
          stock: {
            select: { symbol: true }
          }
        }
      });

      // Update stock current price
      await prisma.stock.update({
        where: { id: stock.id },
        data: { currentPrice: parseFloat(price) }
      });

      res.status(201).json(transaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  }
);

// Update a transaction
router.put('/:id',
  [
    body('type').optional().isIn(['buy', 'sell']),
    body('quantity').optional().isFloat({ min: 0.01 }),
    body('price').optional().isFloat({ min: 0.01 }),
    body('date').optional().isISO8601().toDate(),
    body('notes').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, quantity, price, date, notes } = req.body;

      // Verify transaction ownership
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id
        }
      });

      if (!existingTransaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      const updateData = {};
      if (type) updateData.type = type;
      if (quantity) updateData.quantity = parseFloat(quantity);
      if (price) updateData.price = parseFloat(price);
      if (date) updateData.date = new Date(date);
      if (notes !== undefined) updateData.notes = notes || null;

      const transaction = await prisma.transaction.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
          stock: {
            select: { symbol: true }
          }
        }
      });

      res.json(transaction);
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({ error: 'Failed to update transaction' });
    }
  }
);

// Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    // Verify transaction ownership
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await prisma.transaction.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Get transaction summary
router.get('/summary', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      include: {
        stock: {
          select: { symbol: true }
        }
      }
    });

    const summary = {
      totalTransactions: transactions.length,
      buyTransactions: transactions.filter(t => t.type === 'buy').length,
      sellTransactions: transactions.filter(t => t.type === 'sell').length,
      totalInvested: transactions
        .filter(t => t.type === 'buy')
        .reduce((sum, t) => sum + (t.quantity * t.price), 0),
      totalReceived: transactions
        .filter(t => t.type === 'sell')
        .reduce((sum, t) => sum + (t.quantity * t.price), 0),
      totalShares: transactions.reduce((sum, t) => {
        return sum + (t.type === 'buy' ? t.quantity : -t.quantity);
      }, 0),
      averagePrice: transactions.length > 0 
        ? transactions.reduce((sum, t) => sum + t.price, 0) / transactions.length 
        : 0
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    res.status(500).json({ error: 'Failed to fetch transaction summary' });
  }
});

module.exports = router;
