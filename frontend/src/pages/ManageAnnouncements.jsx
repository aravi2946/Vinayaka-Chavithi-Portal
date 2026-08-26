import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Plus, Check, Edit2, Trash2, X, Megaphone, Calendar } from 'lucide-react';

const ManageAnnouncements = () => {
  const { user, triggerToast } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().substring(0, 10),
    priority: 'Medium',
    isPublished: true,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/announcements`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      triggerToast('Error loading announcements', 'danger');
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
      title: '',
      description: '',
      date: new Date().toISOString().substring(0, 10),
      priority: 'Medium',
      isPublished: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (ann) => {
    setEditingId(ann._id);
    setForm({
      title: ann.title,
      description: ann.description,
      date: new Date(ann.date).toISOString().substring(0, 10),
      priority: ann.priority,
      isPublished: ann.isPublished,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.description) {
      triggerToast('Please fill out announcement title and description', 'warning');
      return;
    }

    try {
      const token = user.token;
      const url = editingId ? `${API_URL}/announcements/${editingId}` : `${API_URL}/announcements`;
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

      triggerToast(editingId ? 'Announcement updated!' : 'Announcement created successfully!', 'success');
      setModalOpen(false);
      fetchAnnouncements();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this announcement?')) {
      return;
    }

    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Delete failed');
      }

      triggerToast('Announcement deleted successfully', 'info');
      fetchAnnouncements();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>📢 Announcements & Bulletin Manager</h1>
          <p style={{ color: 'var(--text-muted)' }}>Publish general updates, deadlines, schedules, or change notifications for devotees.</p>
        </div>
        <div>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={16} /> Write Announcement
          </button>
        </div>
      </div>

      {/* Announcements Register */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary)' }}>Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No announcements written yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {announcements.map((ann) => (
            <div key={ann._id} className="card card-festive-border">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Megaphone size={18} style={{ color: 'var(--primary)' }} />
                  {ann.title}
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`badge badge-${ann.priority.toLowerCase()}`}>{ann.priority} Priority</span>
                  <span className={`badge ${ann.isPublished ? 'badge-approved' : 'badge-draft'}`}>
                    {ann.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={14} />
                    {new Date(ann.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
              
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '1rem', whiteSpace: 'pre-line' }}>
                {ann.description}
              </p>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button onClick={() => handleOpenEdit(ann)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => handleDelete(ann._id)} className="btn btn-danger btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                {editingId ? '📝 Edit Bulletin Notice' : '📢 Post Announcement'}
              </h2>
              <button className="btn btn-link" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="title">Notice Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-control"
                    placeholder="E.g. Daily Aarti Timings Updated"
                    value={form.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="date">Publish Date *</label>
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
                    <label htmlFor="priority">Priority level *</label>
                    <select
                      id="priority"
                      name="priority"
                      className="form-control"
                      value={form.priority}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High (Banner alert)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Alert details / Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    placeholder="Enter the full description details."
                    value={form.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
                  <label htmlFor="isPublished" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', margin: 0 }}>
                    <input
                      type="checkbox"
                      id="isPublished"
                      name="isPublished"
                      checked={form.isPublished}
                      onChange={handleInputChange}
                    />
                    Publish immediately (Devotees see on public bulletin)
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingId ? 'Update Notice' : 'Post Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAnnouncements;
