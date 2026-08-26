import React, { useState, useEffect } from 'react';
import { useAuth, API_URL, getMediaUrl } from '../context/AuthContext';
import { FileText, Download, Calendar, Tag } from 'lucide-react';

const PublicDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/documents`)
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data);
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
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>📁 Public Festival Documents</h1>
          <p style={{ color: 'var(--text-muted)' }}>Download schedules, rules, guidelines, and competition details.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--primary)' }}>Loading documents list...</div>
      ) : documents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <FileText size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No public notices or schedule documents uploaded yet.</p>
        </div>
      ) : (
        <div className="grid-2">
          {documents.map((doc) => (
            <div key={doc._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ background: 'rgba(255, 102, 0, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <FileText size={28} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.25rem' }}>
                    {doc.documentName}
                  </h2>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Tag size={12} />
                      Type: {doc.documentType}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} />
                      Uploaded: {new Date(doc.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                <a
                  href={getMediaUrl(doc.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Download size={14} />
                  Download PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicDocuments;
