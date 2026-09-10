import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X, Search, Calendar, Check, Utensils, Heart } from 'lucide-react';

const ManagePrasadam = () => {
  const { user, triggerToast } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    date: todayStr,
    donorName: '',
    item: '',
    notes: '',
  });

  useEffect(() => {
    fetchPrasadam();
  }, []);

  const fetchPrasadam = async () => {
    try {
      const res = await fetch(`${API_URL}/prasadam`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.allEntries || []);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load prasadam list', 'danger');
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      date: todayStr,
      donorName: '',
      item: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (entry) => {
    setEditingId(entry._id);
    setForm({
      date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : todayStr,
      donorName: entry.donorName,
      item: entry.item,
      notes: entry.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.donorName.trim()) {
      triggerToast('Please provide donor name', 'warning');
      return;
    }

    if (!form.item.trim()) {
      triggerToast('Please provide prasadam item details', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const token = user?.token;
      const url = editingId ? `${API_URL}/prasadam/${editingId}` : `${API_URL}/prasadam`;
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
        throw new Error(data.message || 'Failed to save prasadam entry');
      }

      triggerToast(
        editingId ? 'Prasadam record updated successfully!' : 'Prasadam seva logged successfully!',
        'success'
      );
      setModalOpen(false);
      fetchPrasadam();
    } catch (err) {
      triggerToast(err.message || 'Error saving record', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, donorName) => {
    if (!window.confirm(`Are you sure you want to delete prasadam entry for "${donorName}"?`)) {
      return;
    }

    try {
      const token = user?.token;
      const res = await fetch(`${API_URL}/prasadam/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete');
      }

      triggerToast('Prasadam record deleted successfully', 'info');
      fetchPrasadam();
    } catch (err) {
      triggerToast(err.message || 'Error deleting record', 'danger');
    }
  };

  const filteredEntries = entries.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      const matchDonor = item.donorName && item.donorName.toLowerCase().includes(q);
      const matchItem = item.item && item.item.toLowerCase().includes(q);
      if (!matchDonor && !matchItem) return false;
    }
    if (dateFilter) {
      const itemDateStr = new Date(item.date).toISOString().split('T')[0];
      if (itemDateStr !== dateFilter) return false;
    }
    return true;
  });

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>🍚 Prasadam Seva Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Log and manage daily Prasadam offerings, Annadanam donors, and holy feast items.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={16} /> Log Prasadam
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexGrow: 1,
            minWidth: '220px',
            background: 'var(--bg-primary)',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
          }}
        >
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search donor name or prasadam item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="date"
            className="form-control"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ width: 'auto', padding: '0.4rem 0.75rem', height: '38px', fontSize: '0.85rem' }}
          />
          {dateFilter && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setDateFilter('')}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Table of Prasadam entries */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--primary)' }}>Loading Prasadam entries...</div>
      ) : filteredEntries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍚</div>
          <h3 style={{ color: 'var(--text-main)', margin: '0 0 0.5rem' }}>No Prasadam Records Found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            {search || dateFilter ? 'Try clearing filters.' : 'Click Log Prasadam above to record the first donor.'}
          </p>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={16} /> Log Prasadam Entry
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Donor Name</th>
                <th>Prasadam Item</th>
                <th>Notes</th>
                <th>Logged By</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((item) => (
                <tr key={item._id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <strong>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ color: '#D84315' }}>🙏</span>
                      {item.donorName}
                    </span>
                  </td>
                  <td style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    {item.item}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {item.notes || '-'}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.addedBy || 'Admin'}
                  </td>
                  <td className="table-actions-cell" style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="btn btn-secondary btn-sm btn-table-action"
                        title="Edit Record"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id, item.donorName)}
                        className="btn btn-danger btn-sm btn-table-action"
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

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="sponsor-modal-overlay" onClick={() => setModalOpen(false)} role="dialog" aria-modal="true">
          <div className="sponsor-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="sponsor-modal-header" style={{ background: 'linear-gradient(135deg, #D84315, #FFA000)' }}>
              <button
                type="button"
                className="sponsor-modal-close-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.2rem' }}>🍚</div>
              <h2 style={{ color: 'white', fontSize: '1.35rem', margin: 0, fontWeight: 800 }}>
                {editingId ? 'Edit Prasadam Seva' : 'Log Prasadam Seva'}
              </h2>
              <p style={{ color: '#FFE082', fontSize: '0.82rem', margin: '0.25rem 0 0' }}>
                Record holy food offering &amp; devotee donor details
              </p>
            </div>

            <div className="sponsor-modal-body" style={{ padding: '1.5rem' }}>
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                  <label htmlFor="pDate" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Seva Date <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="date"
                    id="pDate"
                    className="form-control"
                    value={form.date}
                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                  <label htmlFor="pDonor" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Donor / Family Name <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="pDonor"
                    className="form-control"
                    placeholder="e.g. Smt & Sri K. Satyanarayana & Family"
                    value={form.donorName}
                    onChange={(e) => setForm((prev) => ({ ...prev, donorName: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                  <label htmlFor="pItem" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Prasadam Item (Free text) <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="pItem"
                    className="form-control"
                    placeholder="e.g. Sweet Pongal, Chitrannam & Curd Rice (500 packets)"
                    value={form.item}
                    onChange={(e) => setForm((prev) => ({ ...prev, item: e.target.value }))}
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    Enter any food item or seva description freely.
                  </small>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="pNotes" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Notes / Distribution Timing (Optional)
                  </label>
                  <input
                    type="text"
                    id="pNotes"
                    className="form-control"
                    placeholder="e.g. Evening distribution after 7:30 PM Aarti"
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}
                  >
                    <Check size={16} /> {submitting ? 'Saving...' : editingId ? 'Update Seva' : 'Log Prasadam'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePrasadam;
