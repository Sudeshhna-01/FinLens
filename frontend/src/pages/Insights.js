import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import './Insights.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const labelFromKey = (key) =>
  String(key || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const priorityLabel = (p) => {
  if (p === 3) return 'High priority';
  if (p === 2) return 'Medium priority';
  if (p === 1) return 'Tip';
  return null;
};

const Insights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryStats, setCategoryStats] = useState({});
  const [monthlyStats, setMonthlyStats] = useState({});

  useEffect(() => {
    fetchInsights();
    fetchStats();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await axios.get(`${API_URL}/insights`);
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshMyInsights = async () => {
    try {
      setRefreshing(true);
      await axios.post(`${API_URL}/insights/self/refresh`);
      await fetchInsights();
    } catch (error) {
      console.error('Error refreshing insights:', error);
      alert('Could not refresh insights. Please try again in a bit.');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [categoryRes, monthlyRes] = await Promise.all([
        axios.get(`${API_URL}/expenses/stats/category`),
        axios.get(`${API_URL}/expenses/stats/monthly`)
      ]);
      setCategoryStats(categoryRes.data);
      setMonthlyStats(monthlyRes.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading insights...</div>
      </>
    );
  }

  const categoryData = Object.entries(categoryStats).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  })).sort((a, b) => b.value - a.value);

  const monthlyData = Object.entries(monthlyStats)
    .sort()
    .slice(-6)
    .map(([name, value]) => ({
      name: new Date(name + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      value: parseFloat(value.toFixed(2))
    }));

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Insights</h1>
            <p className="page-subtitle">ML-driven financial insights and analytics</p>
          </div>

          <div className="insights-grid">
            <div className="card insights-card">
              <h2 className="card-title">Spending by Category</h2>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="value" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-text">No category data available</div>
                </div>
              )}
            </div>

            <div className="card insights-card">
              <h2 className="card-title">Monthly Spending Trend</h2>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-text">No monthly data available</div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header-row">
              <h2 className="card-title">ML-Generated Insights</h2>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={refreshMyInsights}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing…' : 'Refresh my insights'}
              </button>
            </div>
            {insights.length > 0 ? (
              <div className="insights-list">
                {[...insights]
                  .sort(
                    (a, b) =>
                      new Date(b.generatedAt).getTime() -
                      new Date(a.generatedAt).getTime()
                  )
                  .map((insight) => {
                  const d = insight.data || {};
                  const isReadable =
                    typeof d.message === 'string' && d.message.trim().length > 0;
                  const isPortfolioMl =
                    insight.type === 'portfolio_prediction' &&
                    Array.isArray(d.holdings);

                  return (
                    <div
                      key={insight.id}
                      className={`insight-item${isPortfolioMl ? ' insight-item--portfolio' : ''}`}
                    >
                      <div className="insight-header">
                        <div className="insight-header-main">
                          {d.category ? (
                            <span className="insight-badge">{labelFromKey(d.category)}</span>
                          ) : null}
                          <h3 className="insight-title">
                            {isPortfolioMl
                              ? 'Portfolio outlook'
                              : isReadable && d.type
                                ? labelFromKey(d.type)
                                : labelFromKey(insight.type)}
                          </h3>
                          {d.priority ? (
                            <span
                              className={`insight-priority insight-priority--${d.priority}`}
                            >
                              {priorityLabel(d.priority) || `Priority ${d.priority}`}
                            </span>
                          ) : null}
                        </div>
                        <time
                          className="insight-date"
                          dateTime={insight.generatedAt}
                        >
                          {new Date(insight.generatedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </time>
                      </div>
                      <div className="insight-content">
                        {isPortfolioMl ? (
                          <>
                            <p className="insight-message">{d.message}</p>
                            {d.totals ? (
                              <div className="insight-portfolio-totals">
                                <span>
                                  Today ~${Number(d.totals.current_value).toLocaleString()}
                                </span>
                                <span className="insight-portfolio-arrow">→</span>
                                <span>
                                  30d model projection ~$
                                  {Number(d.totals.projected_value_30d).toLocaleString()}
                                  <em className="insight-portfolio-pct">
                                    {' '}
                                    ({Number(d.totals.implied_change_pct) >= 0 ? '+' : ''}
                                    {Number(d.totals.implied_change_pct).toFixed(1)}%)
                                  </em>
                                </span>
                              </div>
                            ) : null}
                            <div className="insight-table-wrap">
                              <table className="insight-predictions-table">
                                <thead>
                                  <tr>
                                    <th>Symbol</th>
                                    <th>Signal</th>
                                    <th>Mark</th>
                                    <th>30d proj.</th>
                                    <th>Unrealized</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {d.holdings.map((h) => (
                                    <tr key={h.symbol}>
                                      <td>
                                        <strong>{h.symbol}</strong>
                                      </td>
                                      <td>
                                        <span
                                          className={`insight-signal insight-signal--${h.signal}`}
                                        >
                                          {h.signal}
                                        </span>
                                      </td>
                                      <td>${Number(h.mark_price).toFixed(2)}</td>
                                      <td>${Number(h.projected_price_30d).toFixed(2)}</td>
                                      <td
                                        className={
                                          h.unrealized_pct >= 0 ? 'positive' : 'negative'
                                        }
                                      >
                                        {h.unrealized_pct >= 0 ? '+' : ''}
                                        {Number(h.unrealized_pct).toFixed(1)}%
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {d.awareness ? (
                              <p className="insight-awareness">{d.awareness}</p>
                            ) : null}
                          </>
                        ) : isReadable ? (
                          <>
                            <p className="insight-message">{d.message}</p>
                            {d.awareness ? (
                              <p className="insight-awareness">{d.awareness}</p>
                            ) : null}
                          </>
                        ) : (
                          <pre className="insight-raw">
                            {JSON.stringify(d, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">💡</div>
                <div className="empty-state-title">No ML insights yet</div>
                <div className="empty-state-text">
                  Run the ML script to generate insights based on your spending patterns
                </div>
              </div>
            )}
          </div>

          <div className="card info-card">
            <h3>About ML Insights</h3>
            <p>
              Our machine learning models analyze your spending patterns to provide:
            </p>
            <ul>
              <li><strong>Spending Patterns:</strong> Identify trends and anomalies in your expenses</li>
              <li><strong>Budget Forecasts:</strong> Predict future spending based on historical data</li>
              <li><strong>Category Trends:</strong> Understand which categories are growing or shrinking</li>
              <li><strong>Group Summaries:</strong> Analyze group expense patterns and fairness</li>
            </ul>
            <p className="info-note">
              <strong>Note:</strong> Insights are generated offline (Python scripts) and stored in the database.
              Run <code className="info-code">ml/run_ml_pipeline.sh</code> to refresh spending insights and
              portfolio outlook.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Insights;
