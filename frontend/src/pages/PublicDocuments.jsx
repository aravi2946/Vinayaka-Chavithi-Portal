import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, API_URL, getMediaUrl } from '../context/AuthContext';
import { FileText, Download, Calendar, Tag, Search, X, ExternalLink, ShieldAlert, Sparkles, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Schedule', 'Rules', 'Public Notice', 'Permission', 'Other'];

const PublicDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetch(`${API_URL}/documents`)
      .then((res) => res.json())
      .then((data) => {
        setDocuments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching public documents:', err);
        setLoading(false);
      });
  }, []);

  const filteredDocuments = useMemo(() => {
    let result = documents;

    if (selectedCategory !== 'All') {
      result = result.filter(
        (doc) => doc.documentType?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.documentName?.toLowerCase().includes(q) ||
          doc.documentType?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [documents, selectedCategory, searchQuery]);

  const getBadgeClass = (type) => {
    switch (type) {
      case 'Schedule':
        return 'badge-submitted';
      case 'Rules':
        return 'badge-medium';
      case 'Public Notice':
        return 'badge-approved';
      case 'Permission':
        return 'badge-low';
      default:
        return 'badge-draft';
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="action-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>📁</span> Public Festival Documents
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Official schedules, competition guidelines, pooja timetables, and public festival notices approved by the committee.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          border: '1px solid rgba(255, 102, 0, 0.15)',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div className="donors-search-box" style={{ maxWidth: '420px', flex: '1 1 260px' }}>
            <Search size={18} className="donors-search-icon" />
            <input
              type="text"
              className="donors-search-input"
              placeholder="Search document name or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search Documents"
            />
            {searchQuery && (
              <button
                type="button"
                className="donors-search-clear"
                onClick={() => setSearchQuery('')}
                title="Clear search"
                aria-label="Clear document search query"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Showing {filteredDocuments.length} of {documents.length} published document{documents.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', paddingTop: '0.25rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.25rem' }}>
            <Filter size={14} /> Filter:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className="btn btn-sm"
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.82rem',
                borderRadius: 'var(--radius-full)',
                background: selectedCategory === cat ? 'var(--grad-festive)' : 'var(--bg-primary)',
                color: selectedCategory === cat ? 'white' : 'var(--text-main)',
                border: selectedCategory === cat ? 'none' : '1px solid var(--border-color)',
                boxShadow: selectedCategory === cat ? '0 2px 8px rgba(255,102,0,0.25)' : 'none',
                fontWeight: selectedCategory === cat ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid / States */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--primary)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🕉️</div>
          <p style={{ fontWeight: 600 }}>Loading official festival documents...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <FileText size={52} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            {documents.length === 0 ? 'No Public Documents Available' : 'No Matching Documents Found'}
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.25rem auto', fontSize: '0.92rem' }}>
            {documents.length === 0
              ? 'The festival organizing committee has not published any public documents or schedules yet. Please check back soon!'
              : `No document matched your search query "${searchQuery}" or category filter "${selectedCategory}".`}
          </p>
          {(searchQuery || selectedCategory !== 'All') && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid-2">
          {filteredDocuments.map((doc) => {
            const resolvedUrl = getMediaUrl(doc.fileUrl);
            return (
              <div
                key={doc._id}
                className="card card-festive-border"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 102, 0, 0.15), rgba(249, 200, 53, 0.25))',
                      color: 'var(--primary)',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(255, 102, 0, 0.12)',
                    }}
                  >
                    <FileText size={30} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                      <span className={`badge ${getBadgeClass(doc.documentType)}`}>
                        {doc.documentType || 'Notice'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} />
                        {new Date(doc.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <h2
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        margin: '0.2rem 0',
                        lineHeight: 1.35,
                        wordBreak: 'break-word',
                      }}
                      title={doc.documentName}
                    >
                      {doc.documentName}
                    </h2>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Official PDF / Notice
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <a
                      href={resolvedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      title="Open and preview document in a new tab"
                    >
                      <ExternalLink size={14} />
                      Preview
                    </a>
                    <a
                      href={resolvedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      title="Download document file"
                    >
                      <Download size={14} />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PublicDocuments;
