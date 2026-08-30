import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { History, Calendar, User, CheckCircle2, Search, X, ShieldAlert } from 'lucide-react';

const ActivityLog = () => {
  const { user, triggerToast } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/logs`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      triggerToast('Error loading audit logs', 'danger');
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    const formattedDate = new Date(log.timestamp).toLocaleString('en-IN').toLowerCase();
    const username = (log.user || '').toLowerCase();
    const action = (log.action || '').toLowerCase();
    const recordType = (log.recordType || '').toLowerCase();
    const recordId = (log.recordId || '').toLowerCase();

    return (
      username.includes(query) ||
      action.includes(query) ||
      recordType.includes(query) ||
      recordId.includes(query) ||
      formattedDate.includes(query)
    );
  });

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>📜 Committee Activity Log & Audits</h1>
          <p style={{ color: 'var(--text-muted)' }}>Super Admin view of operations history, edits, approvals and soft-deletes.</p>
        </div>
      </div>

      {/* Search Bar Controls */}
      <div className="filter-bar" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative', flex: '1 1 300px', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search activity by admin user, action, record type, or ID code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem', paddingRight: searchTerm ? '2.5rem' : '1rem', width: '100%', marginBottom: 0 }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
          Showing {filteredLogs.length} of {logs.length} records
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary)' }}>Loading audit logs...</div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No activity records found.</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <ShieldAlert size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Matching Logs Found</h3>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1rem' }}>
            No activity records match your search for "{searchTerm}".
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setSearchTerm('')}
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User Account</th>
                <th>Action Description</th>
                <th>Record Type</th>
                <th>ID Code</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      <User size={12} /> @{log.user}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: log.action.includes('Delete') ? 'var(--danger)' : log.action.includes('Approve') ? 'var(--success)' : 'var(--text-main)' }}>
                    {log.action}
                  </td>
                  <td><span className="badge badge-submitted" style={{ fontSize: '0.75rem' }}>{log.recordType}</span></td>
                  <td><code>{log.recordId}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
