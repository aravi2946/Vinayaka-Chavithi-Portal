import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X, Shield, ShieldAlert, Key } from 'lucide-react';

const CommitteeUsers = () => {
  const { user, triggerToast } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'Super Admin',
    status: 'Active',
  });

  const rolesList = ['Super Admin', 'Treasurer', 'Event Manager', 'Volunteer Manager', 'Content Manager'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      triggerToast('Error loading committee users', 'danger');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      username: '',
      password: '',
      role: 'Treasurer',
      status: 'Active',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditingId(u._id);
    setForm({
      username: u.username,
      password: '', // Leave empty for password override (optional)
      role: u.role,
      status: u.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username) {
      triggerToast('Username is required', 'warning');
      return;
    }

    if (!editingId && !form.password) {
      triggerToast('Password is required for new users', 'warning');
      return;
    }

    try {
      const token = user.token;
      const url = editingId ? `${API_URL}/auth/users/${editingId}` : `${API_URL}/auth/users`;
      const method = editingId ? 'PUT' : 'POST';

      // Trim empty password on edit
      const payload = { ...form };
      if (editingId && !payload.password) {
        delete payload.password;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Operation failed');
      }

      triggerToast(editingId ? 'User account updated!' : 'New user created successfully!', 'success');
      setModalOpen(false);
      fetchUsers();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (id === user._id) {
      triggerToast('You cannot delete your own admin account!', 'danger');
      return;
    }

    if (!window.confirm('Are you sure you want to permanently delete this user account?')) {
      return;
    }

    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/auth/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Delete failed');
      }

      triggerToast('User account deleted successfully', 'info');
      fetchUsers();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>🛡️ Committee Users & Roles</h1>
          <p style={{ color: 'var(--text-muted)' }}>Super Admin control panel to establish new logins, configure access levels, or disable accounts.</p>
        </div>
        <div>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={16} /> Create User Login
          </button>
        </div>
      </div>

      {/* Users List Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary)' }}>Loading users...</div>
      ) : users.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No committee logins configured.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Assigned Permission Role</th>
                <th>Account Status</th>
                <th>Created At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>@{u.username}</td>
                  <td>
                    <span className="badge badge-submitted" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Shield size={12} /> {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.status === 'Active' ? 'badge-approved' : 'badge-rejected'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button onClick={() => handleOpenEdit(u)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem' }}>
                        <Edit2 size={12} />
                      </button>
                      {u._id !== user._id && (
                        <button onClick={() => handleDelete(u._id)} className="btn btn-danger btn-sm" style={{ padding: '0.25rem' }}>
                          <Trash2 size={12} />
                        </button>
                      )}
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
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                {editingId ? '📝 Edit Member Access' : '🛡️ Create Committee Login'}
              </h2>
              <button className="btn btn-link" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="username">Username *</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-control"
                    placeholder="E.g. raman_treasury"
                    value={form.username}
                    onChange={handleInputChange}
                    disabled={editingId !== null}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    {editingId ? 'Reset Password (Leave blank to keep same)' : 'Password *'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-control"
                      placeholder={editingId ? 'Override old password' : 'Enter login password'}
                      value={form.password}
                      onChange={handleInputChange}
                      required={!editingId}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="role">Permission Role *</label>
                  <select
                    id="role"
                    name="role"
                    className="form-control"
                    value={form.role}
                    onChange={handleInputChange}
                    required
                  >
                    {rolesList.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Account Status *</label>
                  <select
                    id="status"
                    name="status"
                    className="form-control"
                    value={form.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Active">Active (Permit login)</option>
                    <option value="Disabled">Disabled (Block login)</option>
                  </select>
                </div>

                {editingId && form.username === user.username && form.status === 'Disabled' && (
                  <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255, 0, 0, 0.05)', color: 'var(--danger)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    <ShieldAlert size={16} /> You cannot disable your own active login.
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingId ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitteeUsers;
