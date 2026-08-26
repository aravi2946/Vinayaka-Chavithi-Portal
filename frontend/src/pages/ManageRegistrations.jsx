import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Check, X, Search, Filter, Trash2, FileSpreadsheet } from 'lucide-react';

const ManageRegistrations = () => {
  const { user, triggerToast } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter State
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchRegistrations();
    fetchEvents();
  }, [eventFilter, statusFilter]);

  const fetchRegistrations = async () => {
    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/events/registrations/all`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      triggerToast('Error loading registrations', 'danger');
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/events`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.filter((e) => e.registrationRequired));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/events/registrations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ registrationStatus: status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Status update failed');
      }

      triggerToast(`Registration ${status.toLowerCase()}!`, 'success');
      fetchRegistrations();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) {
      return;
    }

    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/events/registrations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Delete failed');
      }

      triggerToast('Registration deleted successfully', 'info');
      fetchRegistrations();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) return;
    
    // Build CSV
    const headers = ['Participant Name', 'Age', 'Phone', 'Event Name', 'Category', 'Registration Date', 'Status'];
    const rows = registrations.map((r) => [
      r.participantName,
      r.age,
      r.phone,
      r.event ? r.event.eventName : 'N/A',
      r.category,
      new Date(r.registrationDate).toLocaleDateString('en-IN'),
      r.registrationStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter local state
  const filteredRegs = registrations.filter((reg) => {
    const matchesSearch = reg.participantName.toLowerCase().includes(search.toLowerCase());
    const matchesEvent = eventFilter ? reg.event && reg.event._id === eventFilter : true;
    const matchesStatus = statusFilter ? reg.registrationStatus === statusFilter : true;
    return matchesSearch && matchesEvent && matchesStatus;
  });

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>📝 Event Registrations Manager</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review participants, assign categories, and approve entries for kid competitions.</p>
        </div>
        <div>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <FileSpreadsheet size={16} /> Export CSV List
          </button>
        </div>
      </div>

      {/* Search and Filters card */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexGrow: 1, minWidth: '180px', background: 'var(--bg-primary)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search participant name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
          />
        </div>

        <div className="search-filters">
          <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className="form-control" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
            <option value="">All Events</option>
            {events.map((e) => (
              <option key={e._id} value={e._id}>{e.eventName}</option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-control" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary)' }}>Loading registrations...</div>
      ) : filteredRegs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No registrations logged.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Participant Name</th>
                <th>Age</th>
                <th>Contact Phone</th>
                <th>Competition Event</th>
                <th>Category</th>
                <th>Reg Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegs.map((reg) => (
                <tr key={reg._id}>
                  <td style={{ fontWeight: 600 }}>{reg.participantName}</td>
                  <td>{reg.age} years</td>
                  <td>{reg.phone}</td>
                  <td><span style={{ fontWeight: 600 }}>{reg.event ? reg.event.eventName : 'Event Deleted'}</span></td>
                  <td>{reg.category}</td>
                  <td>{new Date(reg.registrationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td>
                    <span className={`badge badge-${reg.registrationStatus.toLowerCase()}`}>{reg.registrationStatus}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      {reg.registrationStatus !== 'Approved' && (
                        <button
                          onClick={() => handleUpdateStatus(reg._id, 'Approved')}
                          className="btn btn-success btn-sm"
                          style={{ padding: '0.25rem', borderRadius: '4px' }}
                          title="Approve Entry"
                        >
                          <Check size={12} />
                        </button>
                      )}
                      {reg.registrationStatus !== 'Rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(reg._id, 'Rejected')}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.25rem', borderRadius: '4px', backgroundColor: 'var(--warning)', borderColor: 'var(--warning)' }}
                          title="Reject Entry"
                        >
                          <X size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(reg._id)}
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
  );
};

export default ManageRegistrations;
