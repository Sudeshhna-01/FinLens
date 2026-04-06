/**
 * Live market quotes via Finnhub (optional). Falls back to DB when no key or on error.
 * @see https://finnhub.io/docs/api/quote
 */

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

function hasFinnhub() {
  return Boolean(process.env.FINNHUB_API_KEY && process.env.FINNHUB_API_KEY.length > 8);
}

/**
 * @param {string} symbol
 * @returns {Promise<null | { price: number, change: number, changePercent: number, previousClose: number, high: number, low: number, open: number }>}
 */
async function fetchFinnhubQuote(symbol) {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) return null;

  const url = `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'FinLens/1.0' } });
  if (!res.ok) {
    console.warn(`Finnhub quote ${symbol}: HTTP ${res.status}`);
    return null;
  }
  const data = await res.json();

  const current = typeof data.c === 'number' ? data.c : 0;
  const prevClose = typeof data.pc === 'number' ? data.pc : 0;
  const price = current > 0 ? current : prevClose > 0 ? prevClose : null;
  if (price == null || price <= 0) {
    return null;
  }

  const change = typeof data.d === 'number' ? data.d : price - prevClose;
  const changePercent =
    typeof data.dp === 'number'
      ? data.dp
      : prevClose > 0
        ? ((price - prevClose) / prevClose) * 100
        : 0;

  return {
    price: parseFloat(price.toFixed(4)),
    change: parseFloat(change.toFixed(4)),
    changePercent: parseFloat(changePercent.toFixed(4)),
    previousClose: prevClose,
    high: data.h ?? null,
    low: data.l ?? null,
    open: data.o ?? null
  };
}

/**
 * Daily candles for simple sparkline (last ~30 trading days).
 * @param {string} symbol
 * @returns {Promise<Array<{ date: string, price: number }>>}
 */
async function fetchFinnhubDailyCandles(symbol) {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) return [];

  const to = Math.floor(Date.now() / 1000);
  const from = to - 60 * 60 * 24 * 45;
  const url = `${FINNHUB_BASE}/stock/candle?symbol=${encodeURIComponent(
    symbol
  )}&resolution=D&from=${from}&to=${to}&token=${token}`;

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'FinLens/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    if (data.s !== 'ok' || !Array.isArray(data.c) || !data.t) return [];

    return data.t.map((unix, i) => ({
      date: new Date(unix * 1000).toISOString().split('T')[0],
      price: parseFloat(Number(data.c[i]).toFixed(4))
    }));
  } catch (e) {
    console.warn(`Finnhub candles ${symbol}:`, e.message);
    return [];
  }
}

// No fabricated history: when provider data is unavailable we return an empty chart array.

/**
 * Build market-data payload for the frontend (matches previous shape + source flag).
 * @param {Map<string, { symbol: string, price: number }>} uniqueStocks
 * @param {import('@prisma/client').PrismaClient} prisma
 */
async function buildMarketDataMap(uniqueStocks, prisma) {
  const symbols = [...uniqueStocks.keys()];
  const out = {};
  let liveCount = 0;

  for (const symbol of symbols) {
    const base = uniqueStocks.get(symbol);
    const dbPrice = base.price || 0;

    let quote = null;
    if (hasFinnhub()) {
      quote = await fetchFinnhubQuote(symbol);
      if (quote) liveCount += 1;
    }

    // Never fabricate market changes/history. If Finnhub fails, we fall back to 0 for live fields.
    const effectivePrice = quote?.price ?? (dbPrice > 0 ? dbPrice : 0);
    const change = quote?.change ?? 0;
    const changePercent = quote?.changePercent ?? 0;

    let chart = [];
    if (hasFinnhub() && quote) {
      chart = await fetchFinnhubDailyCandles(symbol);
    }
    // If chart is empty, frontend will simply show no chart (and keep avgPrice/cost-basis for value).

    out[symbol] = {
      price: parseFloat(effectivePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      chart,
      volume: null,
      source: quote ? 'finnhub' : 'database',
      previousClose: quote?.previousClose ?? null
    };
  }

  if (hasFinnhub() && liveCount > 0 && prisma) {
    try {
      for (const [sym, row] of Object.entries(out)) {
        if (row.source === 'finnhub' && row.price > 0) {
          await prisma.stock.updateMany({
            where: { symbol: sym },
            data: { currentPrice: row.price }
          });
        }
      }
    } catch (e) {
      console.warn('Could not sync stock prices to DB:', e.message);
    }
  }

  return { marketData: out, meta: { finnhub: hasFinnhub(), liveSymbols: liveCount } };
}

module.exports = {
  hasFinnhub,
  fetchFinnhubQuote,
  fetchFinnhubDailyCandles,
  buildMarketDataMap
};
