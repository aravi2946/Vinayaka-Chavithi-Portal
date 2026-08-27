import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Plus, Search, Filter, Check, Edit2, Trash2, X, AlertTriangle, Coins, Receipt, Edit, DollarSign } from 'lucide-react';

const ManageExpenses = () => {
  const { user, triggerToast } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search/Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().substring(0, 10),
    expenseCategory: 'Decorations',
    description: '',
    amount: '',
    paidTo: '',
    paymentMode: 'Cash',
    billReceiptNo: '',
    notes: '',
    approvalStatus: 'Draft',
  });

  // Budget form state
  const [budgetForm, setBudgetForm] = useState({
    category: 'Decorations',
    budgetedAmount: '',
  });

  const categories = [
    'Decorations',
    'Puja materials',
    'Food/Annadanam',
    'Sound system',
    'Lighting',
    'Stage',
    'Transportation',
    'Security',
    'Cultural programs',
    'Printing',
    'Cleaning',
    'Other',
  ];

  useEffect(() => {
    fetchExpenses();
    fetchBudgetsAndStats();
  }, [categoryFilter, statusFilter]);

  const fetchExpenses = async () => {
    try {
      const token = user.token;
      let query = `?search=${search}`;
      if (categoryFilter) query += `&expenseCategory=${categoryFilter}`;
      if (statusFilter) query += `&approvalStatus=${statusFilter}`;

      const res = await fetch(`${API_URL}/expenses${query}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error(error);
      triggerToast('Error loading expenses', 'danger');
    }
  };

  const fetchBudgetsAndStats = async () => {
    try {
      const token = user.token;
      const headers = { 'Authorization': `Bearer ${token}` };

      // Load budget categories
      const budRes = await fetch(`${API_URL}/expenses/budgets`, { headers });
      const budData = budRes.ok ? await budRes.json() : [];
      setBudgets(budData);

      // Load dashboard stats for budgets comparison
      const statRes = await fetch(`${API_URL}/expenses/dashboard`, { headers });
      const statData = statRes.ok ? await statRes.json() : null;
      setStats(statData);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleExpenseInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBudgetInputChange = (e) => {
    const { name, value } = e.target;
    setBudgetForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAddExpense = () => {
    setEditingExpenseId(null);
    setExpenseForm({
      date: new Date().toISOString().substring(0, 10),
      expenseCategory: 'Decorations',
      description: '',
      amount: '',
      paidTo: '',
      paymentMode: 'Cash',
      billReceiptNo: '',
      notes: '',
      approvalStatus: 'Draft',
    });
    setExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (exp) => {
    setEditingExpenseId(exp._id);
    setExpenseForm({
      date: new Date(exp.date).toISOString().substring(0, 10),
      expenseCategory: exp.expenseCategory,
      description: exp.description,
      amount: exp.amount,
      paidTo: exp.paidTo,
      paymentMode: exp.paymentMode,
      billReceiptNo: exp.billReceiptNo || '',
      notes: exp.notes || '',
      approvalStatus: exp.approvalStatus,
    });
    setExpenseModalOpen(true);
  };

  const handleOpenEditBudget = (category, currentAmount) => {
    setBudgetForm({
      category,
      budgetedAmount: currentAmount || 0,
    });
    setBudgetModalOpen(true);
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();

    if (!expenseForm.description || !expenseForm.amount || !expenseForm.paidTo) {
      triggerToast('Please fill out descriptions, payee, and amounts', 'warning');
      return;
    }

    if (parseFloat(expenseForm.amount) <= 0) {
      triggerToast('Amount must be greater than zero', 'warning');
      return;
    }

    try {
      const token = user.token;
      const url = editingExpenseId ? `${API_URL}/expenses/${editingExpenseId}` : `${API_URL}/expenses`;
      const method = editingExpenseId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(expenseForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Operation failed');
      }

      triggerToast(editingExpenseId ? 'Expense entry updated!' : 'Expense entry added successfully!', 'success');
      setExpenseModalOpen(false);
      fetchExpenses();
      fetchBudgetsAndStats();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();

    if (parseFloat(budgetForm.budgetedAmount) < 0) {
      triggerToast('Budget limit cannot be negative', 'warning');
      return;
    }

    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/expenses/budgets`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(budgetForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update budget');
      }

      triggerToast(`Budget for ${budgetForm.category} updated successfully!`, 'success');
      setBudgetModalOpen(false);
      fetchBudgetsAndStats();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  const handleApproveExpense = async (id) => {
    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/expenses/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Approval failed');
      }

      triggerToast('Expense record approved successfully!', 'success');
      fetchExpenses();
      fetchBudgetsAndStats();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record? This action uses soft-deletion.')) {
      return;
    }

    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Delete failed');
      }

      triggerToast('Expense soft-deleted successfully', 'info');
      fetchExpenses();
      fetchBudgetsAndStats();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>🧾 Expense & Budget Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Log expenditures, manage category targets, and review financial balances.</p>
        </div>
        <div>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAddExpense}>
            <Plus size={16} /> Add Expense Log
          </button>
        </div>
      </div>

      <div className="grid-3">
        {/* Left Side: Expense Records List (Span 2) */}
        <div className="span-2">
          {/* Filters card */}
          <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexGrow: 1, minWidth: '180px', background: 'var(--bg-primary)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search descriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
              />
              <button onClick={fetchExpenses} className="btn btn-primary btn-sm" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}>Find</button>
            </div>

            <div className="search-filters">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="form-control" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-control" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
          </div>

          {/* Expenses Register Table */}
          {expenses.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No expense records found matching criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Expense ID</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount (INR)</th>
                    <th>Paid To</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp._id}>
                      <td><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{exp.expenseId}</span></td>
                      <td>{new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                      <td><span style={{ fontSize: '0.8rem', background: 'hsl(30, 15%, 92%)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{exp.expenseCategory}</span></td>
                      <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={exp.description}>
                        {exp.description}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--danger)' }}>₹{exp.amount.toLocaleString('en-IN')}</td>
                      <td>{exp.paidTo}</td>
                      <td>
                        <span className={`badge badge-${exp.approvalStatus.toLowerCase()}`}>{exp.approvalStatus}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          {exp.approvalStatus !== 'Approved' && (
                            <button
                              onClick={() => handleApproveExpense(exp._id)}
                              className="btn btn-success btn-sm"
                              style={{ padding: '0.25rem', borderRadius: '4px' }}
                              title="Approve Record"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditExpense(exp)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem', borderRadius: '4px' }}
                            title="Edit Entry"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(exp._id)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.25rem', borderRadius: '4px' }}
                            title="Delete Record"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Budget Summary & Edit Targets (Span 1) */}
        <div>
          <div className="card card-festive-border">
            <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Coins size={18} /> Budget Target Progress
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Approved spending compared against target limits. Click edit icons to adjust limits.
            </p>

            {stats && stats.budgetVsActual ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {stats.budgetVsActual.map((b) => (
                  <div key={b.category} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {b.category}
                        <button
                          onClick={() => handleOpenEditBudget(b.category, b.budget)}
                          style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', cursor: 'pointer' }}
                          title="Edit Category Target"
                        >
                          <Edit size={12} />
                        </button>
                      </span>
                      <span>₹{b.actual.toLocaleString()} / ₹{b.budget.toLocaleString()}</span>
                    </div>

                    <div className="budget-progress-bar" style={{ height: '6px', marginTop: '0.4rem' }}>
                      <div
                        className={`budget-progress-fill ${b.percentUsed > 100 ? 'over-budget' : ''}`}
                        style={{ width: `${Math.min(b.percentUsed, 100)}%` }}
                      ></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      <span>{b.percentUsed}% used</span>
                      {b.percentUsed > 100 ? (
                        <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Over budget!</span>
                      ) : (
                        <span>₹{b.remaining.toLocaleString()} left</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading budget statistics...</div>
            )}
          </div>
        </div>
      </div>

      {/* Expense Modal */}
      {expenseModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                {editingExpenseId ? '📝 Edit Expense Entry' : '🧾 Log Expenditure'}
              </h2>
              <button className="btn btn-link" onClick={() => setExpenseModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="date">Expense Date *</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      className="form-control"
                      value={expenseForm.date}
                      onChange={handleExpenseInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="amount">Amount (INR) *</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      className="form-control"
                      placeholder="E.g. 1500"
                      value={expenseForm.amount}
                      onChange={handleExpenseInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="expenseCategory">Category *</label>
                    <select
                      id="expenseCategory"
                      name="expenseCategory"
                      className="form-control"
                      value={expenseForm.expenseCategory}
                      onChange={handleExpenseInputChange}
                      required
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="paidTo">Paid To (Vendor/Payee) *</label>
                    <input
                      type="text"
                      id="paidTo"
                      name="paidTo"
                      className="form-control"
                      placeholder="Name of vendor"
                      value={expenseForm.paidTo}
                      onChange={handleExpenseInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="paymentMode">Payment Mode *</label>
                    <select
                      id="paymentMode"
                      name="paymentMode"
                      className="form-control"
                      value={expenseForm.paymentMode}
                      onChange={handleExpenseInputChange}
                      required
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="billReceiptNo">Bill / Receipt Number</label>
                    <input
                      type="text"
                      id="billReceiptNo"
                      name="billReceiptNo"
                      className="form-control"
                      placeholder="E.g. RECEIPT-221"
                      value={expenseForm.billReceiptNo}
                      onChange={handleExpenseInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description / Purpose *</label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    className="form-control"
                    placeholder="E.g. Purchase of puja coconuts, mandap advance"
                    value={expenseForm.description}
                    onChange={handleExpenseInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="approvalStatus">Record Status *</label>
                  <select
                    id="approvalStatus"
                    name="approvalStatus"
                    className="form-control"
                    value={expenseForm.approvalStatus}
                    onChange={handleExpenseInputChange}
                    required
                  >
                    <option value="Draft">Draft (Under review)</option>
                    <option value="Submitted">Submitted (Request approval)</option>
                    <option value="Approved">Approved (Log in totals)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Private Notes (Internal)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="form-control"
                    placeholder="Enter additional details."
                    value={expenseForm.notes}
                    onChange={handleExpenseInputChange}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setExpenseModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingExpenseId ? 'Save Changes' : 'Log Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {budgetModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '350px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>
                Target: {budgetForm.category}
              </h2>
              <button className="btn btn-link" onClick={() => setBudgetModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBudgetSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="budgetedAmount">Budget Limit Amount (INR) *</label>
                  <input
                    type="number"
                    id="budgetedAmount"
                    name="budgetedAmount"
                    className="form-control"
                    value={budgetForm.budgetedAmount}
                    onChange={handleBudgetInputChange}
                    placeholder="E.g. 50000"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setBudgetModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Update Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageExpenses;
