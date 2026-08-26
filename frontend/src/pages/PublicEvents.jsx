import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Calendar, Clock, MapPin, User, Award, CheckCircle, AlertTriangle, X } from 'lucide-react';

const PublicEvents = () => {
  const { triggerToast, settings } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Registration Form State
  const [form, setForm] = useState({
    participantName: '',
    age: '',
    phone: '',
    category: 'General',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const handleOpenRegister = (event) => {
    setSelectedEvent(event);
    setForm({
      participantName: '',
      age: '',
      phone: '',
      category: event.eventName.includes('Drawing') ? 'Drawing' : event.eventName.includes('Sloka') ? 'Sloka' : 'General',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!form.participantName || !form.age || !form.phone) {
      triggerToast('Please fill out all required fields', 'warning');
      return;
    }

    if (parseInt(form.age) <= 0) {
      triggerToast('Age must be greater than zero', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/events/${selectedEvent._id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to register');
      }

      triggerToast(data.message || 'Registration submitted successfully!', 'success');
      setSelectedEvent(null);
    } catch (error) {
      triggerToast(error.message, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>🗓️ Festival Event Schedule</h1>
          <p style={{ color: 'var(--text-muted)' }}>Join us for daily pujas, cultural contests, and community assemblies.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--primary)' }}>Loading schedule...</div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No events scheduled or published yet. Please check back later.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {events.map((evt) => (
            <div key={evt._id} className="card event-card card-festive-border" style={{ borderLeftWidth: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    {evt.eventName}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                    {evt.description}
                  </p>

                  <div className="event-details">
                    <span className="event-detail-item">
                      <Calendar size={16} /> 
                      {new Date(evt.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="event-detail-item">
                      <Clock size={16} /> 
                      {evt.startTime} - {evt.endTime}
                    </span>
                    <span className="event-detail-item">
                      <MapPin size={16} /> 
                      {evt.venue}
                    </span>
                    {evt.organizer && (
                      <span className="event-detail-item">
                        <User size={16} /> 
                        Organizer: {evt.organizer}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <span className={`badge ${evt.status === 'Active' ? 'badge-approved' : 'badge-rejected'}`}>
                    {evt.status === 'Active' ? 'Active' : evt.status}
                  </span>

                  {evt.registrationRequired && evt.status === 'Active' && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handleOpenRegister(evt)}>
                        Register for Event
                      </button>
                      {evt.maxParticipants > 0 && (
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Max capacity: {evt.maxParticipants} kids
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Registration Modal */}
      {selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                📝 Registration: {selectedEvent.eventName}
              </h2>
              <button className="btn btn-link" onClick={() => setSelectedEvent(null)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleRegisterSubmit}>
              <div className="modal-body">
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 102, 0, 0.05)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,102,0,0.1)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                  <AlertTriangle size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block' }}>Approval Notice</strong>
                    Once submitted, your entry will be reviewed by the event manager. Registrations are capped at {selectedEvent.maxParticipants > 0 ? selectedEvent.maxParticipants : 'unlimited'} entries.
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="participantName">Participant Name *</label>
                  <input
                    type="text"
                    id="participantName"
                    name="participantName"
                    className="form-control"
                    placeholder="Enter participant name"
                    value={form.participantName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="age">Age (Years) *</label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      className="form-control"
                      placeholder="E.g. 10"
                      value={form.age}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="category">Category / Class</label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      className="form-control"
                      placeholder="E.g. Class 5 / Under-12"
                      value={form.category}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Contact Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-control"
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedEvent(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Submit Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicEvents;
