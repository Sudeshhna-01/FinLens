const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const {
  hasFinnhub,
  fetchFinnhubQuote,
  fetchFinnhubDailyCandles,
  buildMarketDataMap
} = require('../services/marketData');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

// --- Register static paths before /:symbol ---

// Get market data for all user's stocks
router.get('/market-data', async (req, res) => {
  try {
    const portfolio = await prisma.stockHolding.findMany({
      where: { userId: req.user.id },
      include: {
        stock: {
          select: { symbol: true, currentPrice: true }
        }
      }
    });

    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      include: {
        stock: {
          select: { symbol: true, currentPrice: true }
        }
      }
    });

    const uniqueStocks = new Map();

    portfolio.forEach((holding) => {
      const symbol = holding.stock.symbol;
      if (!uniqueStocks.has(symbol)) {
        uniqueStocks.set(symbol, {
          symbol,
          price: holding.stock.currentPrice || 0
        });
      }
    });

    transactions.forEach((transaction) => {
      const symbol = transaction.stock.symbol;
      if (!uniqueStocks.has(symbol)) {
        uniqueStocks.set(symbol, {
          symbol,
          price: transaction.stock.currentPrice || 0
        });
      }
    });

    const { marketData, meta } = await buildMarketDataMap(uniqueStocks, prisma);

    res.json({ quotes: marketData, meta });
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// Search stocks (user portfolio / transactions)
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;

    const portfolio = await prisma.stockHolding.findMany({
      where: {
        userId: req.user.id,
        stock: {
          symbol: {
            contains: query.toUpperCase()
          }
        }
      },
      include: {
        stock: {
          select: { symbol: true, name: true, currentPrice: true }
        }
      }
    });

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.id,
        stock: {
          symbol: {
            contains: query.toUpperCase()
          }
        }
      },
      include: {
        stock: {
          select: { symbol: true, name: true, currentPrice: true }
        }
      }
    });

    const results = new Map();

    portfolio.forEach((holding) => {
      const symbol = holding.stock.symbol;
      if (!results.has(symbol)) {
        results.set(symbol, holding.stock);
      }
    });

    transactions.forEach((transaction) => {
      const symbol = transaction.stock.symbol;
      if (!results.has(symbol)) {
        results.set(symbol, transaction.stock);
      }
    });

    res.json(Array.from(results.values()));
  } catch (error) {
    console.error('Error searching stocks:', error);
    res.status(500).json({ error: 'Failed to search stocks' });
  }
});

// Get detailed stock information
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol: raw } = req.params;
    const symbol = raw.toUpperCase();

    const portfolio = await prisma.stockHolding.findFirst({
      where: {
        userId: req.user.id,
        stock: { symbol }
      },
      include: {
        stock: true
      }
    });

    const transaction = await prisma.transaction.findFirst({
      where: {
        userId: req.user.id,
        stock: { symbol }
      },
      include: {
        stock: true
      }
    });

    if (!portfolio && !transaction) {
      return res.status(404).json({ error: 'Stock not found in your portfolio' });
    }

    const stock = portfolio?.stock || transaction?.stock;

    const quote = hasFinnhub() ? await fetchFinnhubQuote(symbol) : null;
    // Fall back to user-provided costs (avgPrice/currentPrice on holding) when live quotes are unavailable.
    const userCostBasis =
      portfolio?.currentPrice ??
      portfolio?.avgPrice ??
      transaction?.price ??
      stock?.currentPrice ??
      0;

    const basePrice = quote?.price ?? userCostBasis;
    const change = quote?.change ?? 0;
    const changePercent =
      quote?.changePercent ??
      (quote?.previousClose
        ? ((basePrice - quote.previousClose) / quote.previousClose) * 100
        : 0);

    let candles = hasFinnhub() ? await fetchFinnhubDailyCandles(symbol) : [];
    const generateHistoricalData = (days) => {
      if (!Array.isArray(candles) || candles.length === 0) return [];
      return candles.length >= days ? candles.slice(-days) : candles;
    };

    const stockData = {
      symbol,
      name: stock?.name || symbol,
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: undefined,
      marketCap: undefined,
      pe: undefined,
      dividend: undefined,
      high52Week: quote?.high != null ? parseFloat(quote.high.toFixed(2)) : undefined,
      low52Week: quote?.low != null ? parseFloat(quote.low.toFixed(2)) : undefined,
      dataSource: quote ? 'finnhub' : 'database',
      historicalData: {
        '1D': generateHistoricalData(2),
        '1W': generateHistoricalData(7),
        '1M': generateHistoricalData(30),
        '3M': generateHistoricalData(90),
        '1Y': generateHistoricalData(252),
        '5Y': generateHistoricalData(252)
      },
      news: quote ? [] : [],
      competitors: []
    };

    res.json(stockData);
  } catch (error) {
    console.error('Error fetching stock details:', error);
    res.status(500).json({ error: 'Failed to fetch stock details' });
  }
});

module.exports = router;
