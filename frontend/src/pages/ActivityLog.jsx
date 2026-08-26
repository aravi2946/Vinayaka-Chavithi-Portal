import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { History, Calendar, User, Info, CheckCircle2 } from 'lucide-react';

const ActivityLog = () => {
  const { user, triggerToast } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

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

  const handleOpenDetail = (log) => {
    setSelectedLog(log);
  };

  const parseJSON = (str) => {
    if (!str) return 'None';
    try {
      const parsed = JSON.parse(str);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return str;
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
                <th style={{ textAlign: 'right' }}>State Details</th>
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
                  <td style={{ textAlign: 'right' }}>
                    {(log.previousValue || log.newValue) ? (
                      <button className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleOpenDetail(log)}>
                        <Info size={12} /> View Changes
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No snapshot</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {selectedLog && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
                🔍 Log Details: {selectedLog.action}
              </h2>
              <button className="btn btn-link" onClick={() => setSelectedLog(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                <span>User: <strong>@{selectedLog.user}</strong></span>
                <span>Type: <strong>{selectedLog.recordType}</strong></span>
                <span>Record ID: <strong>{selectedLog.recordId}</strong></span>
                <span>Time: <strong>{new Date(selectedLog.timestamp).toLocaleString()}</strong></span>
              </div>

              <div className="grid-2">
                <div>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>State Prior to Action (Before)</h3>
                  <pre style={{ background: 'hsl(30, 10%, 93%)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.75rem', overflowX: 'auto', whiteSpace: 'pre-wrap', maxHeight: '250px' }}>
                    {parseJSON(selectedLog.previousValue)}
                  </pre>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>State Post Action (After)</h3>
                  <pre style={{ background: 'hsl(30, 10%, 93%)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.75rem', overflowX: 'auto', whiteSpace: 'pre-wrap', maxHeight: '250px' }}>
                    {parseJSON(selectedLog.newValue)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedLog(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
