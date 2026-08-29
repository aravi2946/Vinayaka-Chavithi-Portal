import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { History, Calendar, User, CheckCircle2 } from 'lucide-react';

const ActivityLog = () => {
  const { user, triggerToast } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>📜 Committee Activity Log & Audits</h1>
          <p style={{ color: 'var(--text-muted)' }}>Super Admin view of operations history, edits, approvals and soft-deletes.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary)' }}>Loading audit logs...</div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No activity records found.</p>
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
              {logs.map((log) => (
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
