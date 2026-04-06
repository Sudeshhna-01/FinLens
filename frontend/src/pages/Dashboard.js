import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalExpenses: 0,
    monthlyExpenses: 0,
    groupCount: 0,
    portfolioValue: 0
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    // Update date every minute
    const dateInterval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    
    return () => clearInterval(dateInterval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [expensesRes, groupsRes, portfolioRes] = await Promise.all([
        axios.get(`${API_URL}/expenses`),
        axios.get(`${API_URL}/groups`),
        axios.get(`${API_URL}/portfolio`)
      ]);

      const expenses = expensesRes.data;
      const groups = groupsRes.data;
      const portfolio = portfolioRes.data;

      const now = new Date();
      const currentMonth = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === now.getMonth() &&
               expenseDate.getFullYear() === now.getFullYear();
      });

      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const monthlyExpenses = currentMonth.reduce((sum, e) => sum + e.amount, 0);

      setStats({
        totalExpenses,
        monthlyExpenses,
        groupCount: groups.length,
        portfolioValue: portfolio.summary?.totalValue || 0
      });

      setRecentExpenses(expenses.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading dashboard...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <div className="page-header">
            <div className="page-header-content">
              <div>
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Your financial overview at a glance</p>
              </div>
              <div className="page-date">
                <div className="date-display">
                  {currentDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="time-display">
                  {currentDate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Expenses</h3>
              <div className="value">${stats.totalExpenses.toFixed(2)}</div>
            </div>
            <div className="stat-card secondary">
              <h3>This Month</h3>
              <div className="value">${stats.monthlyExpenses.toFixed(2)}</div>
            </div>
            <div className="stat-card warning">
              <h3>Active Groups</h3>
              <div className="value">{stats.groupCount}</div>
            </div>
            <div className="stat-card">
              <h3>Portfolio Value</h3>
              <div className="value">${stats.portfolioValue.toFixed(2)}</div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="card">
              <h2 className="card-title">Recent Expenses</h2>
              {recentExpenses.length > 0 ? (
                <div className="expense-list">
                  {recentExpenses.map(expense => (
                    <div key={expense.id} className="expense-item">
                      <div className="expense-info">
                        <div className="expense-description">{expense.description}</div>
                        <div className="expense-meta">
                          <span className="expense-category">{expense.category}</span>
                          <span className="expense-date">
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="expense-amount">${expense.amount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-text">No expenses yet</div>
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="card-title">Quick Actions</h2>
              <div className="quick-actions">
                <a href="/expenses" className="action-btn">
                  <span className="action-icon">➕</span>
                  <span>Add Expense</span>
                </a>
                <a href="/groups" className="action-btn">
                  <span className="action-icon">👥</span>
                  <span>Create Group</span>
                </a>
                <a href="/portfolio" className="action-btn">
                  <span className="action-icon">📈</span>
                  <span>View Portfolio</span>
                </a>
                <a href="/insights" className="action-btn">
                  <span className="action-icon">💡</span>
                  <span>View Insights</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
