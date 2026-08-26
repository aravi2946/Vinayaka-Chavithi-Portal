import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, X, Users, Phone, MapPin, Award } from 'lucide-react';

const ManageVolunteers = () => {
  const { user, triggerToast } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    phone: '',
    area: '',
    skills: '',
    availability: '',
    assignedResponsibility: 'None',
    status: 'Active',
  });

  const responsibilities = [
    'Decorations',
    'Food',
    'Cleaning',
    'Event Management',
    'Security',
    'Crowd Management',
    'Transportation',
    'Cultural Programs',
    'Puja Arrangements',
    'None',
  ];

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/volunteers`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVolunteers(data);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      triggerToast('Error loading volunteers list', 'danger');
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
      name: '',
      phone: '',
      area: '',
      skills: '',
      availability: '',
      assignedResponsibility: 'None',
      status: 'Active',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (vol) => {
    setEditingId(vol._id);
    setForm({
      name: vol.name,
      phone: vol.phone,
      area: vol.area || '',
      skills: vol.skills || '',
      availability: vol.availability || '',
      assignedResponsibility: vol.assignedResponsibility,
      status: vol.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.phone) {
      triggerToast('Name and phone numbers are required', 'warning');
      return;
    }

    try {
      const token = user.token;
      const url = editingId ? `${API_URL}/volunteers/${editingId}` : `${API_URL}/volunteers`;
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

      triggerToast(editingId ? 'Volunteer details updated!' : 'Volunteer logged successfully!', 'success');
      setModalOpen(false);
      fetchVolunteers();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this volunteer?')) {
      return;
    }

    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/volunteers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Remove failed');
      }

      triggerToast('Volunteer removed successfully', 'info');
      fetchVolunteers();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  const filteredVols = volunteers.filter(
    (vol) =>
      vol.name.toLowerCase().includes(search.toLowerCase()) ||
      (vol.assignedResponsibility && vol.assignedResponsibility.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>🤝 Volunteer Coordination Hub</h1>
          <p style={{ color: 'var(--text-muted)' }}>Map volunteer skills and availability to specific decorations, security, and prasadam duties.</p>
        </div>
        <div>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={16} /> Register Volunteer
          </button>
        </div>
      </div>

      {/* Search Filter bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexGrow: 1, background: 'var(--bg-primary)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search volunteers by name or assignment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      {/* Volunteer Grid List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary)' }}>Loading volunteers...</div>
      ) : filteredVols.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No volunteers found matching details.</p>
        </div>
      ) : (
        <div className="grid-3">
          {filteredVols.map((vol) => (
            <div key={vol._id} className="card card-festive-border" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>{vol.name}</h2>
                  <span className={`badge ${vol.status === 'Active' ? 'badge-approved' : 'badge-draft'}`}>{vol.status}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={14} /> {vol.phone}
                  </span>
                  {vol.area && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} /> Location: {vol.area}
                    </span>
                  )}
                  {vol.skills && (
                    <span style={{ fontStyle: 'italic' }}>
                      ⚙️ Skills: {vol.skills}
                    </span>
                  )}
                  {vol.availability && (
                    <span>
                      📅 Availability: {vol.availability}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-submitted" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Award size={12} /> {vol.assignedResponsibility}
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => handleOpenEdit(vol)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem' }}>
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => handleDelete(vol._id)} className="btn btn-danger btn-sm" style={{ padding: '0.25rem' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
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
                {editingId ? '📝 Edit Volunteer Assignment' : '🤝 Register New Volunteer'}
              </h2>
              <button className="btn btn-link" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="name">Volunteer Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      placeholder="Full Name"
                      value={form.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="form-control"
                      placeholder="Contact number"
                      value={form.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="area">Area / Location</label>
                    <input
                      type="text"
                      id="area"
                      name="area"
                      className="form-control"
                      placeholder="E.g. Adyar West"
                      value={form.area}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="availability">Availability Schedule</label>
                    <input
                      type="text"
                      id="availability"
                      name="availability"
                      className="form-control"
                      placeholder="E.g. Evenings, Sept 4-6"
                      value={form.availability}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="skills">Skills / Competence</label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    className="form-control"
                    placeholder="E.g. electrical work, driving, food distribution"
                    value={form.skills}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="assignedResponsibility">Assigned Task *</label>
                    <select
                      id="assignedResponsibility"
                      name="assignedResponsibility"
                      className="form-control"
                      value={form.assignedResponsibility}
                      onChange={handleInputChange}
                      required
                    >
                      {responsibilities.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status *</label>
                    <select
                      id="status"
                      name="status"
                      className="form-control"
                      value={form.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingId ? 'Save Changes' : 'Enroll Volunteer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVolunteers;
