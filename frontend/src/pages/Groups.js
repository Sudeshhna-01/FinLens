import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5001/api';

const newLocalId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `m-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const memberFormLabel = (m) => m.name || m.guestName || m.email || 'Member';

const memberDisplayName = (m) =>
  m.user?.name || m.guestName || m.user?.email || 'Guest';

const Groups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupSummary, setGroupSummary] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: []
  });
  const [expenseFormData, setExpenseFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    splitType: 'equal',
    paidBy: '',
    splits: []
  });

  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  /** Fresh group payload from GET /groups/:id so expense modal always has full member list */
  const [expenseModalGroup, setExpenseModalGroup] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const defaultSplitsForMembers = (members, splitType) => {
    if (!members?.length) return [];
    const gid = (m) => m.id;
    if (splitType === 'shares') {
      return members.map((m) => ({ groupMemberId: gid(m), shares: '1' }));
    }
    if (splitType === 'percentage') {
      const p = (100 / members.length).toFixed(2);
      return members.map((m) => ({ groupMemberId: gid(m), percentage: p }));
    }
    if (splitType === 'unequal') {
      return members.map((m) => ({ groupMemberId: gid(m), amount: '' }));
    }
    return [];
  };

  const openExpenseModal = async (groupId) => {
    setShowExpenseForm(groupId);
    setExpenseModalGroup(null);
    try {
      const { data } = await axios.get(`${API_URL}/groups/${groupId}`);
      setExpenseModalGroup(data);
      setExpenseFormData((prev) => {
        const payers = (data.members || []).filter((m) => m.userId);
        const defaultPaid =
          payers.find((m) => m.userId === user?.id)?.userId ||
          payers[0]?.userId ||
          '';
        return {
          ...prev,
          paidBy: defaultPaid,
          splits: defaultSplitsForMembers(data.members, prev.splitType || 'equal')
        };
      });
    } catch (err) {
      console.error('Error loading group for expense:', err);
      alert('Could not load group members. Try again.');
      setShowExpenseForm(null);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_URL}/groups`);
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setUserSearchResults([]);
      setShowUserSearch(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/groups/users/search/${query}`);
      setUserSearchResults(response.data);
      setShowUserSearch(true);
    } catch (error) {
      console.error('Error searching users:', error);
      setUserSearchResults([]);
    }
  };

  const handleMemberSearch = (e) => {
    const query = e.target.value;
    setNewMemberEmail(query);
    searchUsers(query);
  };

  const selectUser = (u) => {
    if (!formData.members.find((m) => m.email === u.email)) {
      setFormData({
        ...formData,
        members: [
          ...formData.members,
          { localId: newLocalId(), email: u.email, name: u.name }
        ]
      });
    }
    setNewMemberEmail('');
    setUserSearchResults([]);
    setShowUserSearch(false);
  };

  const deleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/groups/${groupId}`);
      fetchGroups();
      // Clear selected group if it was the deleted one
      if (selectedGroup === groupId) {
        setSelectedGroup(null);
        setGroupSummary(null);
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group');
    }
  };

  const addMember = () => {
    const raw = newMemberEmail.trim();
    if (!raw) return;
    const dup = formData.members.some(
      (m) =>
        (m.email && m.email.toLowerCase() === raw.toLowerCase()) ||
        (m.guestName && m.guestName.toLowerCase() === raw.toLowerCase())
    );
    if (dup) return;

    const looksLikeEmail = raw.includes('@');
    const entry = looksLikeEmail
      ? { localId: newLocalId(), email: raw }
      : { localId: newLocalId(), guestName: raw };

    setFormData({
      ...formData,
      members: [...formData.members, entry]
    });
    setNewMemberEmail('');
    setUserSearchResults([]);
    setShowUserSearch(false);
  };

  const removeMember = (localId) => {
    setFormData({
      ...formData,
      members: formData.members.filter((m) => m.localId !== localId)
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMember();
    }
  };

  const fetchGroupSummary = async (groupId) => {
    try {
      const response = await axios.get(`${API_URL}/groups/${groupId}/summary`);
      setGroupSummary(response.data);
    } catch (error) {
      console.error('Error fetching group summary:', error);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/groups`, formData);
      fetchGroups();
      setFormData({ name: '', description: '', members: [] });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating group:', error);
      const msg =
        error.response?.data?.error ||
        error.response?.data?.details ||
        'Failed to create group';
      alert(msg);
    }
  };

  const updateSplitField = (groupMemberId, field, value) => {
    setExpenseFormData((prev) => {
      const others = prev.splits.filter((s) => s.groupMemberId !== groupMemberId);
      const cur =
        prev.splits.find((s) => s.groupMemberId === groupMemberId) || { groupMemberId };
      return { ...prev, splits: [...others, { ...cur, [field]: value }] };
    });
  };

  const handleCreateExpense = async (groupId) => {
    try {
      const group =
        expenseModalGroup?.id === groupId
          ? expenseModalGroup
          : groups.find((g) => g.id === groupId);
      if (!group?.members?.length) {
        alert('Group members are still loading or unavailable. Wait a moment and try again.');
        return;
      }

      let splits = [];

      // Calculate splits based on split type
      switch (expenseFormData.splitType) {
        case 'equal': {
          splits = group.members.map((member) => ({
            groupMemberId: member.id,
            amount: (parseFloat(expenseFormData.amount, 10) / group.members.length).toFixed(2)
          }));
          break;
        }

        case 'unequal':
          splits = expenseFormData.splits;
          break;

        case 'percentage':
          splits = expenseFormData.splits.map((split) => ({
            groupMemberId: split.groupMemberId,
            percentage: split.percentage
          }));
          break;

        case 'shares':
          splits = expenseFormData.splits.map((split) => ({
            groupMemberId: split.groupMemberId,
            shares: parseFloat(String(split.shares)) || 0
          }));
          break;

        default:
          console.error('Unknown split type:', expenseFormData.splitType);
          return;
      }

      await axios.post(`${API_URL}/groups/${groupId}/expenses`, {
        amount: expenseFormData.amount,
        description: expenseFormData.description,
        category: expenseFormData.category,
        date: expenseFormData.date,
        splitType: expenseFormData.splitType,
        splits,
        paidBy: expenseFormData.paidBy || user?.id
      });
      
      fetchGroups();
      setExpenseFormData({
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        splitType: 'equal',
        paidBy: user?.id || '',
        splits: []
      });
      setShowExpenseForm(null);
      setExpenseModalGroup(null);
      if (selectedGroup === groupId) {
        fetchGroupSummary(groupId);
      }
    } catch (error) {
      console.error('Error creating group expense:', error);
      const msg =
        error.response?.data?.error ||
        error.response?.data?.details ||
        (Array.isArray(error.response?.data?.errors)
          ? error.response.data.errors.map((e) => e.msg).join(' ')
          : null) ||
        error.message ||
        'Failed to create expense';
      alert(msg);
    }
  };

  const handleSettleUp = async (settlement) => {
    if (settlement.canSettle === false) {
      alert('In-app settlement is only for registered members. Settle with guests outside the app.');
      return;
    }
    try {
      await axios.post(`${API_URL}/groups/${selectedGroup}/settle`, {
        fromUserId: settlement.debtor.id,
        toUserId: settlement.creditor.id,
        amount: settlement.amount
      });
      
      // Refresh the group summary
      await fetchGroupSummary(selectedGroup);
      alert('Settlement recorded successfully!');
    } catch (error) {
      console.error('Error settling up:', error);
      alert('Failed to record settlement');
    }
  };

  const viewGroupDetails = async (groupId) => {
    setSelectedGroup(groupId);
    await fetchGroupSummary(groupId);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading groups...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Groups</h1>
            <p className="page-subtitle">Split expenses and track shared costs</p>
          </div>

          <div className="groups-layout">
            <div className="groups-list">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Your Groups</h2>
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="btn btn-primary"
                  >
                    {showCreateForm ? 'Cancel' : '+ Create Group'}
                  </button>
                </div>

                {showCreateForm && (
                  <form onSubmit={handleCreateGroup} className="group-form">
                    <div className="input-group">
                      <label className="input-label">Group Name</label>
                      <input
                        type="text"
                        className="input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Roommates, Trip to Paris, etc."
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Description (optional)</label>
                      <input
                        type="text"
                        className="input"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description"
                      />
                    </div>
                    
                    <div className="input-group">
                      <label className="input-label">Add Members</label>
                      <div className="member-input-container">
                        <input
                          type="text"
                          className="input"
                          value={newMemberEmail}
                          onChange={handleMemberSearch}
                          onKeyPress={handleKeyPress}
                          placeholder="Search users, or type a name / email and Add"
                        />
                        <button
                          type="button"
                          onClick={addMember}
                          className="btn btn-outline"
                          disabled={!newMemberEmail.trim()}
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* User Search Results */}
                      {showUserSearch && userSearchResults.length > 0 && (
                        <div className="user-search-results">
                          {userSearchResults.map(user => (
                            <div
                              key={user.id}
                              className="user-search-result"
                              onClick={() => selectUser(user)}
                            >
                              <div className="user-info">
                                <span className="user-name">{user.name}</span>
                                <span className="user-email">{user.email}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {formData.members.length > 0 && (
                      <div className="members-list">
                        <label className="input-label">Members to Add</label>
                        {formData.members.map((member) => (
                          <div key={member.localId} className="member-item">
                            <span className="member-email">{memberFormLabel(member)}</span>
                            <button
                              type="button"
                              onClick={() => removeMember(member.localId)}
                              className="btn btn-remove"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        Create Group
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setFormData({ name: '', description: '', members: [] });
                          setNewMemberEmail('');
                        }}
                        className="btn btn-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {groups.length > 0 ? (
                  <div className="groups-grid">
                    {groups.map(group => (
                      <div key={group.id} className="group-card">
                        <div className="group-header">
                          <h3>{group.name}</h3>
                          <span className="group-badge">{group.members.length} members</span>
                        </div>
                        {group.description && (
                          <p className="group-description">{group.description}</p>
                        )}
                        <div className="group-actions">
                          <button
                            onClick={() => viewGroupDetails(group.id)}
                            className="btn btn-outline btn-sm"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => openExpenseModal(group.id)}
                            className="btn btn-primary btn-sm"
                          >
                            Add Expense
                          </button>
                          {user && group.creatorId === user.id && (
                            <button
                              onClick={() => deleteGroup(group.id)}
                              className="btn btn-danger btn-sm"
                            >
                              Delete Group
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <div className="empty-state-title">No groups yet</div>
                    <div className="empty-state-text">Create a group to start splitting expenses</div>
                  </div>
                )}
              </div>
            </div>

            {selectedGroup && groupSummary && (
              <div className="group-details card">
                <h2 className="card-title">Group Summary</h2>
                
                {/* Statistics */}
                <div className="summary-stats">
                  <div className="summary-stat">
                    <span className="stat-label">Total Expenses</span>
                    <span className="stat-value">${groupSummary.statistics.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Number of Expenses</span>
                    <span className="stat-value">{groupSummary.statistics.totalExpenses}</span>
                  </div>
                </div>

                {/* Balances */}
                <div className="balances-section">
                  <h3>Balances</h3>
                  {groupSummary.balances.map(balance => (
                    <div key={balance.user.id} className="balance-item">
                      <div className="balance-info">
                        <span className="balance-name">{balance.user.name}</span>
                        <span className="balance-details">
                          Paid: ${balance.totalPaid.toFixed(2)} | Owed: ${balance.totalOwed.toFixed(2)}
                        </span>
                      </div>
                      <span className={balance.balance >= 0 ? 'positive' : 'negative'}>
                        {balance.balance >= 0 ? '+' : ''}${balance.balance.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Who Owes Whom */}
                {groupSummary.settlements.length > 0 && (
                  <div className="settlements-section">
                    <h3>Settlements</h3>
                    <div className="settlements-list">
                      {groupSummary.settlements.map((settlement, index) => (
                        <div key={index} className="settlement-item">
                          <div className="settlement-info">
                            <span className="settlement-amount">${settlement.amount.toFixed(2)}</span>
                            <span className="settlement-description">
                              {settlement.debtor.name} owes {settlement.creditor.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            disabled={settlement.canSettle === false}
                            title={
                              settlement.canSettle === false
                                ? 'Settle in person with guests (not linked to accounts)'
                                : undefined
                            }
                            onClick={() => handleSettleUp(settlement)}
                          >
                            Settle Up
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Expenses */}
                {groupSummary.recentExpenses.length > 0 && (
                  <div className="recent-expenses-section">
                    <h3>Recent Expenses</h3>
                    <div className="recent-expenses-list">
                      {groupSummary.recentExpenses.map(expense => (
                        <div key={expense.id} className="recent-expense-item">
                          <div className="expense-info">
                            <span className="expense-description">{expense.description}</span>
                            <span className="expense-meta">
                              {expense.category} • {new Date(expense.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="expense-details">
                            <span className="expense-amount">${expense.amount.toFixed(2)}</span>
                            <span className="expense-payer">Paid by {expense.paidBy.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {showExpenseForm && (() => {
            const expenseModalLoading =
              !expenseModalGroup || expenseModalGroup.id !== showExpenseForm;
            const modalMembers = expenseModalLoading
              ? []
              : expenseModalGroup.members || [];

            return (
            <div
              className="modal-overlay"
              onClick={() => {
                setShowExpenseForm(null);
                setExpenseModalGroup(null);
              }}
            >
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Add Group Expense</h2>
                {expenseModalLoading && (
                  <p className="modal-loading">Loading group members…</p>
                )}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (expenseModalLoading) return;
                  handleCreateExpense(showExpenseForm);
                }}>
                  <div className="input-group">
                    <label className="input-label">Description</label>
                    <input
                      type="text"
                      className="input"
                      value={expenseFormData.description}
                      onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                      required
                      placeholder="What's this expense for?"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="input-group">
                      <label className="input-label">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        className="input"
                        value={expenseFormData.amount}
                        onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                        required
                        placeholder="0.00"
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Category</label>
                      <select
                        className="input"
                        value={expenseFormData.category}
                        onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
                        required
                      >
                        <option value="">Select</option>
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Bills">Bills</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label className="input-label">Date</label>
                      <input
                        type="date"
                        className="input"
                        value={expenseFormData.date}
                        onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Paid By</label>
                      <select
                        className="input"
                        value={expenseFormData.paidBy}
                        onChange={(e) => setExpenseFormData({ ...expenseFormData, paidBy: e.target.value })}
                        required
                      >
                        <option value="">Select payer</option>
                        {modalMembers
                          .filter((member) => member.userId)
                          .map((member) => (
                            <option key={member.id} value={member.userId}>
                              {member.user?.name || member.user?.email || 'Member'}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Split Type</label>
                    <select
                      className="input"
                      value={expenseFormData.splitType}
                      onChange={(e) => {
                        const splitType = e.target.value;
                        setExpenseFormData((prev) => ({
                          ...prev,
                          splitType,
                          splits: defaultSplitsForMembers(modalMembers, splitType)
                        }));
                      }}
                      required
                    >
                      <option value="equal">Split Equally</option>
                      <option value="unequal">Unequal Split</option>
                      <option value="percentage">Split by Percentage</option>
                      <option value="shares">Split by Shares</option>
                    </select>
                  </div>

                  {expenseFormData.splitType === 'equal' && !expenseModalLoading && modalMembers.length > 0 && (
                    <div className="split-preview">
                      <p>Splitting equally among {modalMembers.length} members</p>
                      {expenseFormData.amount && (
                        <p>Each person pays: ${(parseFloat(expenseFormData.amount) / modalMembers.length).toFixed(2)}</p>
                      )}
                    </div>
                  )}

                  {(expenseFormData.splitType === 'unequal' || 
                    expenseFormData.splitType === 'percentage' || 
                    expenseFormData.splitType === 'shares') && !expenseModalLoading && (
                    <div className="splits-section">
                      <label className="input-label">Split Details</label>
                      {modalMembers.map((member) => {
                        const gmId = member.id;
                        return (
                        <div key={member.id} className="split-item">
                          <span className="member-name">{memberDisplayName(member)}</span>
                          {expenseFormData.splitType === 'unequal' && (
                            <input
                              type="number"
                              step="0.01"
                              className="input split-input"
                              placeholder="Amount"
                              value={
                                expenseFormData.splits.find((s) => s.groupMemberId === gmId)?.amount ?? ''
                              }
                              onChange={(e) => updateSplitField(gmId, 'amount', e.target.value)}
                            />
                          )}
                          {expenseFormData.splitType === 'percentage' && (
                            <input
                              type="number"
                              step="0.1"
                              className="input split-input"
                              placeholder="%"
                              value={
                                expenseFormData.splits.find((s) => s.groupMemberId === gmId)?.percentage ?? ''
                              }
                              onChange={(e) => updateSplitField(gmId, 'percentage', e.target.value)}
                            />
                          )}
                          {expenseFormData.splitType === 'shares' && (
                            <input
                              type="number"
                              step="1"
                              min="0"
                              className="input split-input"
                              placeholder="Shares"
                              value={
                                expenseFormData.splits.find((s) => s.groupMemberId === gmId)?.shares ?? ''
                              }
                              onChange={(e) => updateSplitField(gmId, 'shares', e.target.value)}
                            />
                          )}
                        </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={expenseModalLoading}>
                      Add Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowExpenseForm(null);
                        setExpenseModalGroup(null);
                      }}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
            );
          })()}
        </div>
      </div>
    </>
  );
};

export default Groups;
