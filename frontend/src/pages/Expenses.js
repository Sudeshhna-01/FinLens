import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5001/api';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API_URL}/expenses`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/expenses/${editingId}`, formData);
      } else {
        await axios.post(`${API_URL}/expenses`, formData);
      }
      fetchExpenses();
      resetForm();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await axios.delete(`${API_URL}/expenses/${id}`);
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0]
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
    setShowForm(false);
  };

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading expenses...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Expenses</h1>
            <p className="page-subtitle">Track and manage your personal expenses</p>
          </div>

          <div className="expenses-layout">
            <div className="expenses-main">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">All Expenses</h2>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary"
                  >
                    {showForm ? 'Cancel' : '+ Add Expense'}
                  </button>
                </div>

                {showForm && (
                  <form onSubmit={handleSubmit} className="expense-form">
                    <div className="form-row">
                      <div className="input-group">
                        <label className="input-label">Description</label>
                        <input
                          type="text"
                          className="input"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          required
                          placeholder="Lunch at restaurant"
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          required
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="input-group">
                        <label className="input-label">Category</label>
                        <select
                          className="input"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          required
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="input-group">
                        <label className="input-label">Date</label>
                        <input
                          type="date"
                          className="input"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        {editingId ? 'Update' : 'Add'} Expense
                      </button>
                      {editingId && (
                        <button type="button" onClick={resetForm} className="btn btn-outline">
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}

                {expenses.length > 0 ? (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Category</th>
                          <th>Amount</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map(expense => (
                          <tr key={expense.id}>
                            <td>{new Date(expense.date).toLocaleDateString()}</td>
                            <td>{expense.description}</td>
                            <td>
                              <span className="badge badge-primary">{expense.category}</span>
                            </td>
                            <td className="amount-cell">${expense.amount.toFixed(2)}</td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  onClick={() => handleEdit(expense)}
                                  className="btn-icon"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDelete(expense.id)}
                                  className="btn-icon"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">📝</div>
                    <div className="empty-state-title">No expenses yet</div>
                    <div className="empty-state-text">Start tracking your expenses to gain insights</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Expenses;
