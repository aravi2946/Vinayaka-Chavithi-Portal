import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Megaphone, Calendar, AlertCircle } from 'lucide-react';

const PublicAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/announcements`)
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>📢 Festival Announcements Bulletin</h1>
          <p style={{ color: 'var(--text-muted)' }}>Stay updated with puja timings, event changes, deadlines, and prasadam schedules.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--primary)' }}>Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No announcements published yet. Check back during the festival!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {announcements.map((ann) => (
            <div key={ann._id} className="card card-festive-border">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Megaphone size={18} style={{ color: 'var(--primary)', transform: 'rotate(-10deg)' }} />
                  {ann.title}
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`badge badge-${ann.priority.toLowerCase()}`}>{ann.priority} Priority</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={14} />
                    {new Date(ann.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>{ann.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicAnnouncements;
