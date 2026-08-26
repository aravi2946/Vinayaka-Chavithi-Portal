import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Plus, Search, Check, Edit2, Trash2, X, Calendar, Clock, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';

const ManageEvents = () => {
  const { user, triggerToast } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [form, setForm] = useState({
    eventName: '',
    date: new Date().toISOString().substring(0, 10),
    startTime: '08:00',
    endTime: '10:00',
    venue: '',
    description: '',
    organizer: '',
    maxParticipants: '0',
    registrationRequired: false,
    status: 'Active',
    isPublished: true,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/events`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      triggerToast('Error loading events list', 'danger');
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
      eventName: '',
      date: new Date().toISOString().substring(0, 10),
      startTime: '09:00',
      endTime: '11:00',
      venue: '',
      description: '',
      organizer: '',
      maxParticipants: '0',
      registrationRequired: false,
      status: 'Active',
      isPublished: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (evt) => {
    setEditingId(evt._id);
    setForm({
      eventName: evt.eventName,
      date: new Date(evt.date).toISOString().substring(0, 10),
      startTime: evt.startTime,
      endTime: evt.endTime,
      venue: evt.venue,
      description: evt.description || '',
      organizer: evt.organizer || '',
      maxParticipants: String(evt.maxParticipants || 0),
      registrationRequired: evt.registrationRequired,
      status: evt.status,
      isPublished: evt.isPublished,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.eventName || !form.venue || !form.startTime || !form.endTime) {
      triggerToast('Please fill out event name, timings and venue', 'warning');
      return;
    }

    if (form.startTime > form.endTime) {
      triggerToast('Event end time cannot be before start time', 'warning');
      return;
    }

    try {
      const token = user.token;
      const url = editingId ? `${API_URL}/events/${editingId}` : `${API_URL}/events`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          maxParticipants: parseInt(form.maxParticipants) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Operation failed');
      }

      triggerToast(editingId ? 'Event updated!' : 'Event created successfully!', 'success');
      setModalOpen(false);
      fetchEvents();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  const handleTogglePublish = async (evt) => {
    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/events/${evt._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublished: !evt.isPublished }),
      });

      if (res.ok) {
        triggerToast(!evt.isPublished ? 'Event published publicly' : 'Event unpublished', 'success');
        fetchEvents();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this event and all associated registrations?')) {
      return;
    }

    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Delete failed');
      }

      triggerToast('Event deleted successfully', 'info');
      fetchEvents();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  const filteredEvents = events.filter((evt) =>
    evt.eventName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>🗓️ Festival Events Scheduler</h1>
          <p style={{ color: 'var(--text-muted)' }}>Publish schedules, details, organizers, and manage registration criteria.</p>
        </div>
        <div>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={16} /> Create Event
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexGrow: 1, background: 'var(--bg-primary)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search event name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary)' }}>Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No events logged yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredEvents.map((evt) => (
            <div key={evt._id} className="card event-card card-festive-border" style={{ borderLeftWidth: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{evt.eventName}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{evt.description}</p>
                  
                  <div className="event-details" style={{ fontSize: '0.85rem' }}>
                    <span className="event-detail-item">
                      <Calendar size={14} />
                      {new Date(evt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="event-detail-item">
                      <Clock size={14} />
                      {evt.startTime} - {evt.endTime}
                    </span>
                    <span className="event-detail-item">
                      <MapPin size={14} />
                      {evt.venue}
                    </span>
                    {evt.registrationRequired && (
                      <span className="badge badge-submitted" style={{ fontSize: '0.7rem' }}>
                        Registration Required (Cap: {evt.maxParticipants > 0 ? evt.maxParticipants : 'Unlimited'})
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                    <span className={`badge ${evt.status === 'Active' ? 'badge-approved' : 'badge-rejected'}`}>{evt.status}</span>
                    <button
                      onClick={() => handleTogglePublish(evt)}
                      className="btn btn-link"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: evt.isPublished ? 'var(--success)' : 'var(--text-muted)' }}
                    >
                      {evt.isPublished ? (
                        <>
                          <ToggleRight size={18} /> Publicly Published
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={18} /> Unpublished Draft
                        </>
                      )}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => handleOpenEdit(evt)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem' }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(evt._id)} className="btn btn-danger btn-sm" style={{ padding: '0.25rem' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
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
                {editingId ? '📝 Edit Event Schedule' : '🗓️ Create Festival Event'}
              </h2>
              <button className="btn btn-link" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="eventName">Event Name *</label>
                  <input
                    type="text"
                    id="eventName"
                    name="eventName"
                    className="form-control"
                    placeholder="E.g. Sri Vinayaka Sthapana"
                    value={form.eventName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label htmlFor="date">Date *</label>
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
                    <label htmlFor="startTime">Start Time *</label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      className="form-control"
                      value={form.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="endTime">End Time *</label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      className="form-control"
                      value={form.endTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="venue">Venue *</label>
                    <input
                      type="text"
                      id="venue"
                      name="venue"
                      className="form-control"
                      placeholder="E.g. Main Pandal Hall"
                      value={form.venue}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="organizer">Organizer / Priest Troupe</label>
                    <input
                      type="text"
                      id="organizer"
                      name="organizer"
                      className="form-control"
                      placeholder="E.g. Adyar Veda Samiti"
                      value={form.organizer}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Event Description</label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    placeholder="Provide detailed itinerary."
                    value={form.description}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid-3">
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '1.8rem' }}>
                    <label htmlFor="registrationRequired" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', margin: 0 }}>
                      <input
                        type="checkbox"
                        id="registrationRequired"
                        name="registrationRequired"
                        checked={form.registrationRequired}
                        onChange={handleInputChange}
                      />
                      Requires Registration
                    </label>
                  </div>

                  <div className="form-group">
                    <label htmlFor="maxParticipants">Max Limit (0 = Unlimited)</label>
                    <input
                      type="number"
                      id="maxParticipants"
                      name="maxParticipants"
                      className="form-control"
                      value={form.maxParticipants}
                      onChange={handleInputChange}
                      disabled={!form.registrationRequired}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Event Status</label>
                    <select id="status" name="status" className="form-control" value={form.status} onChange={handleInputChange}>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
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
                    Publish publicly immediately
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingId ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
