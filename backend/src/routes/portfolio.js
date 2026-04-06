const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

// Get portfolio
router.get('/', async (req, res) => {
  try {
    const holdings = await prisma.stockHolding.findMany({
      where: { userId: req.user.id },
      include: {
        stock: {
          select: { symbol: true }
        }
      },
      orderBy: {
        stock: {
          symbol: 'asc'
        }
      }
    });

    const totalValue = holdings.reduce((sum, h) => {
      return sum + (h.currentPrice || h.avgPrice) * h.quantity;
    }, 0);

    const totalCost = holdings.reduce((sum, h) => sum + h.avgPrice * h.quantity, 0);

    res.json({
      holdings: holdings.map(h => ({
        ...h,
        symbol: h.stock.symbol
      })),
      summary: {
        totalValue,
        totalCost,
        totalGain: totalValue - totalCost,
        totalGainPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Add/Update holding
router.post('/',
  [
    body('symbol').trim().notEmpty().toUpperCase(),
    body('quantity').isFloat({ min: 0 }),
    body('avgPrice').isFloat({ min: 0 }),
    body('currentPrice').optional().isFloat({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { symbol, quantity, avgPrice, currentPrice } = req.body;

      // Find or create stock
      let stock = await prisma.stock.findUnique({
        where: { symbol: symbol.toUpperCase() }
      });

      if (!stock) {
        stock = await prisma.stock.create({
          data: {
            symbol: symbol.toUpperCase(),
            name: symbol.toUpperCase(),
            currentPrice: currentPrice ? parseFloat(currentPrice) : null
          }
        });
      }

      const holding = await prisma.stockHolding.upsert({
        where: {
          userId_stockId: {
            userId: req.user.id,
            stockId: stock.id
          }
        },
        update: {
          quantity: parseFloat(quantity),
          avgPrice: parseFloat(avgPrice),
          currentPrice: currentPrice ? parseFloat(currentPrice) : null
        },
        create: {
          userId: req.user.id,
          stockId: stock.id,
          quantity: parseFloat(quantity),
          avgPrice: parseFloat(avgPrice),
          currentPrice: currentPrice ? parseFloat(currentPrice) : null
        },
        include: {
          stock: {
            select: { symbol: true }
          }
        }
      });

      res.json({
        ...holding,
        symbol: holding.stock.symbol
      });
    } catch (error) {
      console.error('Error updating portfolio:', error);
      res.status(500).json({ error: 'Failed to update portfolio' });
    }
  }
);

// Delete holding
router.delete('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;

    await prisma.stockHolding.deleteMany({
      where: {
        userId: req.user.id,
        symbol: symbol.toUpperCase()
      }
    });

    res.json({ message: 'Holding deleted successfully' });
  } catch (error) {
    console.error('Error deleting holding:', error);
    res.status(500).json({ error: 'Failed to delete holding' });
  }
});

module.exports = router;
