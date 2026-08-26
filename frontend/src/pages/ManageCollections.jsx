import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Plus, Search, Filter, Check, Edit2, Trash2, X, AlertTriangle, FileSpreadsheet } from 'lucide-react';

const ManageCollections = () => {
  const { user, triggerToast } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter state
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().substring(0, 10),
    donorName: '',
    phone: '',
    amount: '',
    paymentMode: 'Cash',
    transactionRef: '',
    purpose: 'General Donation',
    notes: '',
    approvalStatus: 'Draft',
    showPublicly: false,
  });

  useEffect(() => {
    fetchCollections();
  }, [paymentFilter, statusFilter]);

  const fetchCollections = async () => {
    try {
      const token = user.token;
      let query = `?search=${search}`;
      if (paymentFilter) query += `&paymentMode=${paymentFilter}`;
      if (statusFilter) query += `&approvalStatus=${statusFilter}`;

      const res = await fetch(`${API_URL}/collections${query}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      triggerToast('Error loading collections', 'danger');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      date: new Date().toISOString().substring(0, 10),
      donorName: '',
      phone: '',
      amount: '',
      paymentMode: 'Cash',
      transactionRef: '',
      purpose: 'General Donation',
      notes: '',
      approvalStatus: 'Draft',
      showPublicly: false,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (coll) => {
    setEditingId(coll._id);
    setForm({
      date: new Date(coll.date).toISOString().substring(0, 10),
      donorName: coll.donorName,
      phone: coll.phone || '',
      amount: coll.amount,
      paymentMode: coll.paymentMode,
      transactionRef: coll.transactionRef || '',
      purpose: coll.purpose,
      notes: coll.notes || '',
      approvalStatus: coll.approvalStatus,
      showPublicly: coll.showPublicly || false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.donorName || !form.amount) {
      triggerToast('Please enter donor name and amount', 'warning');
      return;
    }

    if (parseFloat(form.amount) <= 0) {
      triggerToast('Amount must be greater than zero', 'warning');
      return;
    }

    try {
      const token = user.token;
      const url = editingId ? `${API_URL}/collections/${editingId}` : `${API_URL}/collections`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Operation failed');
      }

      triggerToast(editingId ? 'Donation updated!' : 'Donation added successfully!', 'success');
      setModalOpen(false);
      fetchCollections();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/collections/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Approval failed');
      }

      triggerToast('Donation collection approved!', 'success');
      fetchCollections();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection entry? This action uses soft-deletion.')) {
      return;
    }

    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/collections/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Delete failed');
      }

      triggerToast('Donation soft-deleted successfully', 'info');
      fetchCollections();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  const handleExportCSV = () => {
    if (collections.length === 0) return;

    // Build CSV Content
    const headers = ['Receipt ID', 'Date', 'Donor Name', 'Phone', 'Amount', 'Payment Mode', 'Transaction Ref', 'Purpose', 'Approval Status'];
    const rows = collections.map(c => [
      c.collectionId,
      new Date(c.date).toLocaleDateString('en-IN'),
      c.donorName,
      c.phone || '',
      c.amount,
      c.paymentMode,
      c.transactionRef || '',
      c.purpose,
      c.approvalStatus
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `collections_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>💰 Collection & Donations Register</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage devotee donations, verify UPI transactions, and track approval states.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <FileSpreadsheet size={16} /> Export CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={16} /> Log Collection
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexGrow: 1, minWidth: '200px', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search donor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
          <button onClick={fetchCollections} className="btn btn-primary btn-sm" style={{ padding: '0.25rem 0.75rem' }}>Find</button>
        </div>

        <div className="search-filters">
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="form-control" style={{ width: 'auto', padding: '0.4rem 1rem' }}>
            <option value="">All Payment Modes</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-control" style={{ width: 'auto', padding: '0.4rem 1rem' }}>
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary)' }}>Loading collections...</div>
      ) : collections.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No collections found matching search criteria.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Date</th>
                <th>Donor Name</th>
                <th>Phone (Private)</th>
                <th>Amount (INR)</th>
                <th>Payment Mode</th>
                <th>Reference ID</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((coll) => (
                <tr key={coll._id}>
                  <td><span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{coll.collectionId}</span></td>
                  <td>{new Date(coll.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td style={{ fontWeight: 600 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      {coll.donorName}
                      {coll.showPublicly ? (
                        <span title="Public Visibility: ON" style={{ cursor: 'help', fontSize: '1rem' }}>👁️</span>
                      ) : (
                        <span title="Public Visibility: OFF (Private)" style={{ opacity: 0.25, cursor: 'help', fontSize: '1rem' }}>👁️</span>
                      )}
                    </span>
                  </td>
                  <td>{coll.phone || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>None</span>}</td>
                  <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{coll.amount.toLocaleString('en-IN')}</td>
                  <td>{coll.paymentMode}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{coll.transactionRef || '-'}</td>
                  <td>
                    <span className={`badge badge-${coll.approvalStatus.toLowerCase()}`}>{coll.approvalStatus}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      {coll.approvalStatus !== 'Approved' && (
                        <button
                          onClick={() => handleApprove(coll._id)}
                          className="btn btn-success btn-sm"
                          style={{ padding: '0.25rem', borderRadius: '4px' }}
                          title="Approve Record"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(coll)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem', borderRadius: '4px' }}
                        title="Edit Entry"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(coll._id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.25rem', borderRadius: '4px' }}
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                {editingId ? '📝 Edit Collection Record' : '💰 Log New Donation'}
              </h2>
              <button className="btn btn-link" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="date">Collection Date *</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      className="form-control"
                      value={form.date}
                      onChange={handleInputChange}
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
                      placeholder="E.g. 5000"
                      value={form.amount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="donorName">Donor Name *</label>
                    <input
                      type="text"
                      id="donorName"
                      name="donorName"
                      className="form-control"
                      placeholder="Full Name"
                      value={form.donorName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number (Private)</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="form-control"
                      placeholder="10-digit number"
                      value={form.phone}
                      onChange={handleInputChange}
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
                      value={form.paymentMode}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="transactionRef">Transaction / Reference ID</label>
                    <input
                      type="text"
                      id="transactionRef"
                      name="transactionRef"
                      className="form-control"
                      placeholder="E.g. UPI8291..."
                      value={form.transactionRef}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="purpose">Donation Purpose</label>
                    <input
                      type="text"
                      id="purpose"
                      name="purpose"
                      className="form-control"
                      placeholder="E.g. Annadanam, general..."
                      value={form.purpose}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="approvalStatus">Entry Status *</label>
                    <select
                      id="approvalStatus"
                      name="approvalStatus"
                      className="form-control"
                      value={form.approvalStatus}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Draft">Draft (Internal review)</option>
                      <option value="Submitted">Submitted (For approval)</option>
                      <option value="Approved">Approved (Final report)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ margin: '1rem 0' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      id="showPublicly"
                      name="showPublicly"
                      checked={form.showPublicly}
                      onChange={handleInputChange}
                      style={{ transform: 'scale(1.1)', cursor: 'pointer' }}
                    />
                    <span>👁️ Show Donor Publicly</span>
                  </label>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem', marginLeft: '1.4rem' }}>
                    {form.showPublicly ? '👁️ ON — Public (Name + Amount + Date visible to public)' : '👁️ OFF — Private (Hidden from public donor list)'}
                  </span>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Private Notes (Internal)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="form-control"
                    placeholder="Any specific note regarding this donor or collection."
                    value={form.notes}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingId ? 'Save Changes' : 'Record Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCollections;
