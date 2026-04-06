import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './Portfolio.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState({ holdings: [], summary: null });
  const [transactions, setTransactions] = useState([]);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('holdings');
  const [showForm, setShowForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [timeRange, setTimeRange] = useState('1M');
  const [sortBy, setSortBy] = useState('value');
  const [searchTerm, setSearchTerm] = useState('');
  /** Latest ML portfolio row from /insights (type portfolio_prediction) */
  const [mlPortfolio, setMlPortfolio] = useState(null);
  /** From /stocks/market-data meta — live quote provider when configured */
  const [marketMeta, setMarketMeta] = useState(null);

  const [formData, setFormData] = useState({
    symbol: '',
    quantity: '',
    avgPrice: '',
    currentPrice: ''
  });

  const [transactionFormData, setTransactionFormData] = useState({
    type: 'buy',
    symbol: '',
    quantity: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchPortfolio();
    fetchTransactions();
    fetchStockData();
  }, []);

  const fetchMlOutlook = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/insights`);
      const list = Array.isArray(data) ? data : [];
      const row = list.find((x) => x.type === 'portfolio_prediction');
      setMlPortfolio(row || null);
    } catch {
      setMlPortfolio(null);
    }
  };

  useEffect(() => {
    fetchMlOutlook();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`${API_URL}/portfolio`);
      setPortfolio(response.data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchStockData = async () => {
    try {
      const response = await axios.get(`${API_URL}/stocks/market-data`);
      const payload = response.data;
      setStockData(payload.quotes || payload);
      setMarketMeta(payload.meta || null);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/portfolio`, formData);
      setSearchTerm('');
      fetchPortfolio();
      fetchTransactions();
      fetchMlOutlook();
      setFormData({ symbol: '', quantity: '', avgPrice: '', currentPrice: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving holding:', error);
      alert('Failed to save holding');
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/transactions`, transactionFormData);
      fetchTransactions();
      fetchPortfolio();
      fetchMlOutlook();
      setTransactionFormData({
        type: 'buy',
        symbol: '',
        quantity: '',
        price: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setShowTransactionForm(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction');
    }
  };

  const handleDelete = async (symbol) => {
    if (!window.confirm(`Delete ${symbol} from portfolio?`)) return;
    
    try {
      await axios.delete(`${API_URL}/portfolio/${symbol}`);
      fetchPortfolio();
      fetchTransactions();
      fetchMlOutlook();
    } catch (error) {
      console.error('Error deleting holding:', error);
      alert('Failed to delete holding');
    }
  };

  const getStockPrice = (symbol) => {
    const p = stockData[symbol]?.price;
    return typeof p === 'number' && Number.isFinite(p) ? p : 0;
  };

  /** Saved quote on the holding wins, then live market data, then cost basis. */
  const getHoldingCurrentPrice = (holding) => {
    const saved = holding.currentPrice;
    if (saved != null && saved !== '') {
      const n = Number(saved);
      if (Number.isFinite(n) && n >= 0) return n;
    }
    const live = getStockPrice(holding.symbol);
    if (live > 0) return live;
    return holding.avgPrice;
  };

  const getStockChange = (symbol) => {
    return stockData[symbol]?.change || 0;
  };

  const getStockChangePercent = (symbol) => {
    return stockData[symbol]?.changePercent || 0;
  };

  const getStockChart = (symbol) => {
    return stockData[symbol]?.chart || [];
  };

  const searchQuery = searchTerm.trim().toLowerCase();
  const filteredAndSortedHoldings = portfolio.holdings
    .filter((holding) => {
      const sym = (holding.symbol || '').toLowerCase();
      return !searchQuery || sym.includes(searchQuery);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'symbol':
          return a.symbol.localeCompare(b.symbol);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'value': {
          const aValue = getHoldingCurrentPrice(a) * a.quantity;
          const bValue = getHoldingCurrentPrice(b) * b.quantity;
          return bValue - aValue;
        }
        case 'gain': {
          const aGain = (getHoldingCurrentPrice(a) - a.avgPrice) * a.quantity;
          const bGain = (getHoldingCurrentPrice(b) - b.avgPrice) * b.quantity;
          return bGain - aGain;
        }
        default:
          return 0;
      }
    });

  const calculatePortfolioMetrics = () => {
    if (!portfolio.summary) return null;
    
    const totalValue = portfolio.summary.totalValue;
    const totalCost = portfolio.summary.totalCost;
    const totalGain = portfolio.summary.totalGain;
    const gainPercent = portfolio.summary.totalGainPercent;
    
    return {
      totalValue,
      totalCost,
      totalGain,
      gainPercent,
      dayChange: portfolio.holdings.reduce((sum, h) => sum + (getStockChange(h.symbol) * h.quantity), 0),
      dayChangePercent: totalValue > 0 ? (portfolio.holdings.reduce((sum, h) => sum + (getStockChange(h.symbol) * h.quantity), 0) / totalValue) * 100 : 0
    };
  };

  const metrics = calculatePortfolioMetrics();

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading portfolio...</div>
      </>
    );
  }

  const { holdings, summary } = portfolio;

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Portfolio & Investments</h1>
            <p className="page-subtitle">Track your stock investments and financial transactions</p>
            {marketMeta?.finnhub ? (
              <p className="portfolio-live-banner">
                Live prices: Finnhub (delayed). {marketMeta.liveSymbols ?? 0} symbol(s) refreshed.
              </p>
            ) : (
              <p className="portfolio-live-banner portfolio-live-banner--sim">
                Add <code className="portfolio-env-hint">FINNHUB_API_KEY</code> to the backend{' '}
                <code className="portfolio-env-hint">.env</code> for real-time quotes (free tier at
                finnhub.io).
              </p>
            )}
          </div>

          {/* Enhanced Portfolio Summary */}
          {metrics && (
            <div className="portfolio-summary-enhanced">
              <div className="summary-header">
                <h2>Portfolio Overview</h2>
                <div className="time-range-selector">
                  {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(range => (
                    <button
                      key={range}
                      className={`time-btn ${timeRange === range ? 'active' : ''}`}
                      onClick={() => setTimeRange(range)}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="metrics-grid">
                <div className="metric-card primary">
                  <div className="metric-header">
                    <span className="metric-label">Total Value</span>
                    <span className={`metric-change ${metrics.dayChange >= 0 ? 'positive' : 'negative'}`}>
                      {metrics.dayChange >= 0 ? '+' : ''}${metrics.dayChange.toFixed(2)} ({metrics.dayChangePercent >= 0 ? '+' : ''}{metrics.dayChangePercent.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="metric-value">${metrics.totalValue.toFixed(2)}</div>
                </div>
                
                <div className="metric-card">
                  <span className="metric-label">Total Cost</span>
                  <div className="metric-value">${metrics.totalCost.toFixed(2)}</div>
                </div>
                
                <div className={`metric-card ${metrics.totalGain >= 0 ? 'success' : 'danger'}`}>
                  <span className="metric-label">Total Gain/Loss</span>
                  <div className="metric-value">
                    {metrics.totalGain >= 0 ? '+' : ''}${metrics.totalGain.toFixed(2)}
                  </div>
                  <div className="metric-percent">
                    ({metrics.gainPercent >= 0 ? '+' : ''}{metrics.gainPercent.toFixed(2)}%)
                  </div>
                </div>
                
                <div className="metric-card">
                  <span className="metric-label">Holdings</span>
                  <div className="metric-value">{holdings.length}</div>
                </div>
              </div>
            </div>
          )}

          {mlPortfolio?.data?.holdings?.length > 0 && (
            <div className="portfolio-ml-card">
              <h2>ML portfolio outlook</h2>
              <p className="portfolio-ml-summary">
                {mlPortfolio.data.totals ? (
                  <>
                    <span>
                      Value now ~{' '}
                      <strong>
                        ${Number(mlPortfolio.data.totals.current_value).toLocaleString()}
                      </strong>
                    </span>
                    <span>
                      30d model projection ~{' '}
                      <strong>
                        ${Number(mlPortfolio.data.totals.projected_value_30d).toLocaleString()}
                      </strong>
                      <em>
                        {' '}
                        (
                        {Number(mlPortfolio.data.totals.implied_change_pct) >= 0 ? '+' : ''}
                        {Number(mlPortfolio.data.totals.implied_change_pct).toFixed(1)}%)
                      </em>
                    </span>
                  </>
                ) : null}
              </p>
              <div className="portfolio-ml-table-wrap">
                <table className="portfolio-ml-table">
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Signal</th>
                      <th>Mark</th>
                      <th>30d proj.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mlPortfolio.data.holdings.map((h) => (
                      <tr key={h.symbol}>
                        <td>
                          <strong>{h.symbol}</strong>
                        </td>
                        <td>{h.signal}</td>
                        <td>${Number(h.mark_price).toFixed(2)}</td>
                        <td>${Number(h.projected_price_30d).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="portfolio-ml-disclaimer">
                Model-based projection from your saved costs vs live marks (if configured). Not investment advice.
              </p>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-btn ${activeTab === 'holdings' ? 'active' : ''}`}
              onClick={() => setActiveTab('holdings')}
            >
              Holdings
            </button>
            <button
              className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              Transactions
            </button>
            <button
              className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
              onClick={() => setActiveTab('analysis')}
            >
              Analysis
            </button>
          </div>

          {/* Holdings Tab */}
          {activeTab === 'holdings' && (
            <div className="tab-content">
              <div className="section-header">
                <div className="section-controls">
                  <div
                    className={`search-box${searchTerm.trim() ? ' search-box--has-clear' : ''}`}
                  >
                    <input
                      type="text"
                      className="input"
                      placeholder="Search by symbol..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label="Search holdings by symbol"
                    />
                    {searchTerm.trim() ? (
                      <button
                        type="button"
                        className="search-clear-btn"
                        onClick={() => setSearchTerm('')}
                        aria-label="Clear search"
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                  <div className="sort-selector">
                    <select
                      className="input"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="value">Sort by Value</option>
                      <option value="symbol">Sort by Symbol</option>
                      <option value="quantity">Sort by Quantity</option>
                      <option value="gain">Sort by Gain/Loss</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary"
                  >
                    {showForm ? 'Cancel' : '+ Add Holding'}
                  </button>
                </div>
              </div>

              {showForm && (
                <div className="form-card">
                  <h3>Add New Holding</h3>
                  <form onSubmit={handleSubmit} className="portfolio-form">
                    <div className="form-row">
                      <div className="input-group">
                        <label className="input-label">Symbol</label>
                        <input
                          type="text"
                          className="input"
                          value={formData.symbol}
                          onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                          required
                          placeholder="AAPL"
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Quantity</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          required
                          placeholder="10"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="input-group">
                        <label className="input-label">Average Price</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          value={formData.avgPrice}
                          onChange={(e) => setFormData({ ...formData, avgPrice: e.target.value })}
                          required
                          placeholder="150.00"
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Current Price (optional)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          value={formData.currentPrice}
                          onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                          placeholder="155.00"
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Add Holding
                    </button>
                  </form>
                </div>
              )}

              {filteredAndSortedHoldings.length > 0 ? (
                <div className="holdings-grid">
                  {filteredAndSortedHoldings.map(holding => {
                    const currentPrice = getHoldingCurrentPrice(holding);
                    const value = currentPrice * holding.quantity;
                    const cost = holding.avgPrice * holding.quantity;
                    const gain = value - cost;
                    const gainPercent = (gain / cost) * 100;
                    const dayChange = getStockChange(holding.symbol);
                    const dayChangePercent = getStockChangePercent(holding.symbol);

                    return (
                      <div key={holding.id} className="holding-card">
                        <div className="holding-header">
                          <div className="holding-info">
                            <h3>{holding.symbol}</h3>
                            <span className={`day-change ${dayChange >= 0 ? 'positive' : 'negative'}`}>
                              {dayChange >= 0 ? '+' : ''}{dayChange.toFixed(2)} ({dayChangePercent >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%)
                            </span>
                          </div>
                          <button
                            onClick={() => handleDelete(holding.symbol)}
                            className="btn-icon"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                        
                        <div className="holding-metrics">
                          <div className="metric-row">
                            <span className="label">Quantity:</span>
                            <span className="value">{holding.quantity}</span>
                          </div>
                          <div className="metric-row">
                            <span className="label">Avg Price:</span>
                            <span className="value">${holding.avgPrice.toFixed(2)}</span>
                          </div>
                          <div className="metric-row">
                            <span className="label">Current Price:</span>
                            <span className="value">${currentPrice.toFixed(2)}</span>
                          </div>
                          <div className="metric-row">
                            <span className="label">Total Value:</span>
                            <span className="value">${value.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="holding-gain">
                          <div className={`gain-amount ${gain >= 0 ? 'positive' : 'negative'}`}>
                            {gain >= 0 ? '+' : ''}${gain.toFixed(2)}
                          </div>
                          <div className={`gain-percent ${gain >= 0 ? 'positive' : 'negative'}`}>
                            ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📈</div>
                  <div className="empty-state-title">
                    {holdings.length > 0 && searchQuery
                      ? 'No matching holdings'
                      : 'No holdings yet'}
                  </div>
                  <div className="empty-state-text">
                    {holdings.length > 0 && searchQuery
                      ? `Nothing matches "${searchTerm.trim()}". Clear the search or try another symbol.`
                      : 'Add your stock holdings to track your portfolio'}
                  </div>
                  {holdings.length > 0 && searchQuery ? (
                    <button
                      type="button"
                      className="btn btn-primary empty-state-action"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear search
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="tab-content">
              <div className="section-header">
                <button
                  onClick={() => setShowTransactionForm(!showTransactionForm)}
                  className="btn btn-primary"
                >
                  {showTransactionForm ? 'Cancel' : '+ Add Transaction'}
                </button>
              </div>

              {showTransactionForm && (
                <div className="form-card">
                  <h3>Add Transaction</h3>
                  <form onSubmit={handleTransactionSubmit} className="transaction-form">
                    <div className="form-row">
                      <div className="input-group">
                        <label className="input-label">Type</label>
                        <select
                          className="input"
                          value={transactionFormData.type}
                          onChange={(e) => setTransactionFormData({ ...transactionFormData, type: e.target.value })}
                        >
                          <option value="buy">Buy</option>
                          <option value="sell">Sell</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label className="input-label">Symbol</label>
                        <input
                          type="text"
                          className="input"
                          value={transactionFormData.symbol}
                          onChange={(e) => setTransactionFormData({ ...transactionFormData, symbol: e.target.value.toUpperCase() })}
                          required
                          placeholder="AAPL"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="input-group">
                        <label className="input-label">Quantity</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          value={transactionFormData.quantity}
                          onChange={(e) => setTransactionFormData({ ...transactionFormData, quantity: e.target.value })}
                          required
                          placeholder="10"
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Price</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          value={transactionFormData.price}
                          onChange={(e) => setTransactionFormData({ ...transactionFormData, price: e.target.value })}
                          required
                          placeholder="150.00"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="input-group">
                        <label className="input-label">Date</label>
                        <input
                          type="date"
                          className="input"
                          value={transactionFormData.date}
                          onChange={(e) => setTransactionFormData({ ...transactionFormData, date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Notes (optional)</label>
                        <input
                          type="text"
                          className="input"
                          value={transactionFormData.notes}
                          onChange={(e) => setTransactionFormData({ ...transactionFormData, notes: e.target.value })}
                          placeholder="Transaction notes..."
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Add Transaction
                    </button>
                  </form>
                </div>
              )}

              {transactions.length > 0 ? (
                <div className="transactions-list">
                  {transactions.map(transaction => (
                    <div key={transaction.id} className="transaction-item">
                      <div className={`transaction-type ${transaction.type}`}>
                        {transaction.type === 'buy' ? '📈' : '📉'}
                      </div>
                      <div className="transaction-details">
                        <div className="transaction-header">
                          <span className="transaction-symbol">{transaction.symbol}</span>
                          <span className="transaction-date">{new Date(transaction.date).toLocaleDateString()}</span>
                        </div>
                        <div className="transaction-info">
                          <span>{transaction.quantity} shares @ ${transaction.price}</span>
                          <span className="transaction-total">${(transaction.quantity * transaction.price).toFixed(2)}</span>
                        </div>
                        {transaction.notes && (
                          <div className="transaction-notes">{transaction.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">💰</div>
                  <div className="empty-state-title">No transactions yet</div>
                  <div className="empty-state-text">Add your buy/sell transactions to track your investment history</div>
                </div>
              )}
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="tab-content">
              <div className="analysis-grid">
                <div className="analysis-card">
                  <h3>Portfolio Performance</h3>
                  <div className="performance-chart">
                    <div className="chart-placeholder">
                      <div className="chart-icon">📊</div>
                      <p>Performance chart coming soon</p>
                    </div>
                  </div>
                </div>
                
                <div className="analysis-card">
                  <h3>Asset Allocation</h3>
                  <div className="allocation-chart">
                    <div className="chart-placeholder">
                      <div className="chart-icon">🥧</div>
                      <p>Asset allocation chart coming soon</p>
                    </div>
                  </div>
                </div>
                
                <div className="analysis-card">
                  <h3>Top Performers</h3>
                  <div className="top-performers">
                    {holdings
                      .sort((a, b) => {
                        const aGain =
                          ((getHoldingCurrentPrice(a) - a.avgPrice) * a.quantity) / (a.avgPrice * a.quantity);
                        const bGain =
                          ((getHoldingCurrentPrice(b) - b.avgPrice) * b.quantity) / (b.avgPrice * b.quantity);
                        return bGain - aGain;
                      })
                      .slice(0, 5)
                      .map(holding => {
                        const gainPercent =
                          ((getHoldingCurrentPrice(holding) - holding.avgPrice) / holding.avgPrice) * 100;
                        return (
                          <div key={holding.id} className="performer-item">
                            <span className="performer-symbol">{holding.symbol}</span>
                            <span className={`performer-gain ${gainPercent >= 0 ? 'positive' : 'negative'}`}>
                              {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
                
                <div className="analysis-card">
                  <h3>Investment Summary</h3>
                  <div className="investment-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total Invested:</span>
                      <span className="stat-value">${summary?.totalCost.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Current Value:</span>
                      <span className="stat-value">${summary?.totalValue.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Return:</span>
                      <span className={`stat-value ${summary?.totalGain >= 0 ? 'positive' : 'negative'}`}>
                        {summary?.totalGain >= 0 ? '+' : ''}${summary?.totalGain.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Return %:</span>
                      <span className={`stat-value ${summary?.totalGainPercent >= 0 ? 'positive' : 'negative'}`}>
                        {summary?.totalGainPercent >= 0 ? '+' : ''}{summary?.totalGainPercent.toFixed(2) || '0.00'}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Portfolio;
