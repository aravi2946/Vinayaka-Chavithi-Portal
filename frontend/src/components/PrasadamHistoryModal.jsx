import React, { useState } from 'react';
import { X, Search, Calendar, Utensils, Heart } from 'lucide-react';

const PrasadamHistoryModal = ({ isOpen, onClose, entries = [] }) => {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  if (!isOpen) return null;

  const filtered = entries.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      const matchDonor = item.donorName && item.donorName.toLowerCase().includes(q);
      const matchItem = item.item && item.item.toLowerCase().includes(q);
      if (!matchDonor && !matchItem) return false;
    }
    if (dateFilter) {
      const itemDateStr = new Date(item.date).toISOString().split('T')[0];
      if (itemDateStr !== dateFilter) return false;
    }
    return true;
  });

  return (
    <div className="sponsor-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="sponsor-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="sponsor-modal-header" style={{ background: 'linear-gradient(135deg, #B71C1C, #E65100)' }}>
          <button type="button" className="sponsor-modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>🍚</div>
          <h2 style={{ color: 'white', fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>
            Prasadam Seva Honor Roll &amp; History
          </h2>
          <p style={{ color: '#FFE082', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            Devoted patrons offering holy Annadanam and prasadams for Lord Ganesha
          </p>
        </div>

        <div className="sponsor-modal-body" style={{ padding: '1.25rem' }}>
          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: '1 1 200px', background: 'var(--bg-primary)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <Search size={15} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search donor or item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={15} style={{ color: 'var(--text-muted)' }} />
              <input
                type="date"
                className="form-control"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ padding: '0.35rem 0.65rem', height: '34px', fontSize: '0.82rem' }}
              />
              {dateFilter && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setDateFilter('')}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  All Dates
                </button>
              )}
            </div>
          </div>

          {/* List of Entries */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <p style={{ fontStyle: 'italic', margin: 0 }}>No matching prasadam seva entries found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered.map((item) => (
                <div
                  key={item._id}
                  style={{
                    background: 'linear-gradient(145deg, #FFFFFF, #FFF9F5)',
                    border: '1.5px solid rgba(255, 102, 0, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>🙏</span>
                      <strong style={{ fontSize: '1.02rem', color: 'var(--text-main)', wordBreak: 'break-word' }}>
                        {item.donorName}
                      </strong>
                    </div>
                    <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.92rem', marginBottom: item.notes ? '0.25rem' : 0 }}>
                      🍚 {item.item}
                    </div>
                    {item.notes && (
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        background: 'hsl(30, 20%, 94%)',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '12px',
                      }}
                    >
                      <Calendar size={12} />
                      {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={onClose} style={{ minWidth: '120px' }}>
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrasadamHistoryModal;
