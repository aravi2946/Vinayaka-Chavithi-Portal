import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Heart, ShieldCheck, Landmark, Search, X, Sparkles, Filter, ArrowUpDown, Calendar, Award } from 'lucide-react';
import DonateModal from '../components/DonateModal';

const PublicCollections = () => {
  const { settings } = useAuth();
  const [data, setData] = useState({ publicVisible: true, showDonorsList: true, totalAmount: 0, donorsCount: 0, collections: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);

  const fetchCollectionsData = () => {
    fetch(`${API_URL}/collections`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCollectionsData();
  }, []);

  const filteredCollections = useMemo(() => {
    if (!data.collections || !Array.isArray(data.collections)) return [];

    let result = [...data.collections];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.donorName?.toLowerCase().includes(q) ||
          c.amount?.toString().includes(q) ||
          new Date(c.date).toLocaleDateString('en-IN').includes(q)
      );
    }

    if (sortBy === 'date-desc') {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'date-asc') {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'amount-desc') {
      result.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    } else if (sortBy === 'amount-asc') {
      result.sort((a, b) => (a.amount || 0) - (b.amount || 0));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => (a.donorName || '').localeCompare(b.donorName || ''));
    }

    return result;
  }, [data.collections, searchQuery, sortBy]);

  const hasIdolSponsor = (settings?.idolSponsorActive !== false) && (settings?.idolSponsorName && settings?.idolSponsorName.trim().length > 0);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="action-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', margin: 0 }}>🙏 Donor &amp; Collection Summary</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.35rem' }}>Public log of contributions supporting the Vinayaka Chavithi celebrations.</p>
        </div>
      </div>

      {/* Featured Vinayaka Idol Sponsor Card */}
      {hasIdolSponsor && (
        <div className="idol-sponsor-card" style={{ marginBottom: '0.85rem', padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', width: '100%', flexWrap: 'wrap' }}>
            <div className="idol-sponsor-icon-badge" style={{ flexShrink: 0 }}>
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🙏</span>
            </div>
            <div style={{ flex: '1 1 220px', minWidth: 0 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'linear-gradient(135deg, rgba(255, 102, 0, 0.16), rgba(249, 200, 53, 0.28))', border: '1.5px solid rgba(255, 102, 0, 0.45)', borderRadius: '20px', padding: '0.2rem 0.75rem', marginBottom: '0.25rem', boxShadow: '0 2px 8px rgba(255,102,0,0.15)', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '0.85rem', lineHeight: 1 }}>🙏</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--primary)' }}>
                  Vinayaka Idol Sponsor
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#B71C1C', margin: '0.1rem 0', fontWeight: 800, wordBreak: 'break-word' }}>
                {settings?.idolSponsorName}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, wordBreak: 'break-word' }}>
                {settings?.idolSponsorDetails || 'Grand Eco-Friendly Clay Vinayaka Idol Seva'}
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary)' }}>Loading donation logs...</div>
      ) : (
        <div>
          {/* Summary Dashboard Cards */}
          {data.publicVisible && (
            <div className="collections-summary-grid" style={{ marginBottom: '0.85rem' }}>
              <div className="card card-festive-border" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1rem' }}>
                <div style={{ background: 'var(--grad-festive)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '46px', height: '46px', borderRadius: 'var(--radius-sm)', flexShrink: 0, boxShadow: '0 3px 10px rgba(255, 102, 0, 0.25)' }}>
                  <Heart size={24} fill="white" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'block' }}>
                    Total Festival Collection
                  </span>
                  <span style={{ display: 'block', fontSize: 'clamp(1.4rem, 3.5vw, 1.85rem)', fontWeight: 900, color: 'var(--success)', lineHeight: 1.2, wordBreak: 'break-word' }}>
                    ₹{(data.totalAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="card card-festive-border" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1rem' }}>
                <div style={{ background: 'var(--grad-gold)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '46px', height: '46px', borderRadius: 'var(--radius-sm)', flexShrink: 0, boxShadow: '0 3px 10px rgba(255, 179, 0, 0.25)' }}>
                  <Landmark size={24} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'block' }}>
                    Total Devotee Donors
                  </span>
                  <span style={{ display: 'block', fontSize: 'clamp(1.4rem, 3.5vw, 1.85rem)', fontWeight: 900, color: 'var(--primary-dark)', lineHeight: 1.2 }}>
                    {data.donorsCount !== undefined ? data.donorsCount : data.collections.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Donation Bank / UPI Details Card */}
          <div className="card glass-panel donation-bank-card" style={{ padding: '0.95rem 1.1rem', marginBottom: '0.85rem', border: '1.5px solid rgba(255, 102, 0, 0.2)' }}>
            <div style={{ flex: '1 1 240px', minWidth: 0 }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', margin: '0 0 0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}>
                <span>💳</span> Support Our Festival - Online UPI Seva
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
                Your contributions fund holy Puja materials, community Annadanam meals, and grand stage decorations.
              </p>
            </div>
            <div className="donation-bank-actions">
              <div className="donation-bank-info-box">
                <div>Account: <strong>{settings?.accountName || 'UPPUTURI VENKATA GANESH'}</strong></div>
                <div>UPI Number: <strong style={{ color: 'var(--primary)' }}>{settings?.paymentNumber || '9948050484'}</strong></div>
              </div>
              <button
                type="button"
                className="donate-upi-btn"
                onClick={() => setShowDonateModal(true)}
              >
                <span>🙏</span> Donate Online (UPI)
                <span className="donate-pulse-badge">✨</span>
              </button>
            </div>
          </div>

          {/* Donor Table or Hidden Message */}
          {!data.showDonorsList ? (
            <div className="card card-festive-border" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', border: '1px dashed var(--primary)' }}>
              <div style={{ background: 'rgba(255, 102, 0, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%' }}>
                <ShieldCheck size={28} />
              </div>
              <h2 style={{ color: 'var(--primary)', fontSize: '1.3rem', margin: 0, fontWeight: 800 }}>Donors List Hidden</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', fontSize: '0.88rem', lineHeight: '1.5' }}>
                Individual donor details are currently kept private by the administrator. The total collection amount and donation banking details remain public.
              </p>
            </div>
          ) : (
            <>
              {/* Compact Unified Donors Toolbar */}
              <div className="donors-toolbar-panel">
                <div className="donors-toolbar-header-row">
                  <h2 className="donors-toolbar-heading">
                    📜 Approved Donor Directory
                  </h2>
                  <span className="donors-toolbar-count">
                    Showing {filteredCollections.length} of {data.collections.length} approved donations
                  </span>
                </div>

                <div className="donors-toolbar-controls-row">
                  {/* Search Input Box */}
                  <div className="donors-search-box">
                    <Search size={16} className="donors-search-icon" />
                    <input
                      type="text"
                      className="donors-search-input"
                      placeholder="Search donor name, amount, date..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="Search Donors"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        className="donors-search-clear"
                        onClick={() => setSearchQuery('')}
                        title="Clear search"
                        aria-label="Clear search query"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Sort Dropdown */}
                  <div className="donors-sort-wrapper">
                    <select
                      className="donors-sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      aria-label="Sort Donors"
                    >
                      <option value="date-desc">Sort: Latest First</option>
                      <option value="date-asc">Sort: Oldest First</option>
                      <option value="amount-desc">Sort: Highest Amount</option>
                      <option value="amount-asc">Sort: Lowest Amount</option>
                      <option value="name-asc">Sort: Donor Name (A-Z)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Donor Content or Empty State */}
              {data.collections.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                    No approved public collection entries logged yet.
                  </p>
                </div>
              ) : filteredCollections.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    No donors found matching "{searchQuery}"
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Try checking the spelling or search by amount or date.
                  </p>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <>
                  {/* 1. Desktop & Tablet Table View (Screens >= 640px) */}
                  <div className="table-responsive desktop-donors-view">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th style={{ width: '60px' }}>#</th>
                          <th style={{ width: '150px' }}>Date</th>
                          <th>Donor Name</th>
                          <th style={{ textAlign: 'right', width: '160px' }}>Amount (INR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCollections.map((coll, index) => (
                          <tr key={coll._id || index}>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                              #{index + 1}
                            </td>
                            <td style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                              {new Date(coll.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                <span>{coll.donorName}</span>
                                {coll.amount >= 10000 && (
                                  <span className="badge badge-festive" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                                    🌟 Special Donor
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--success)', fontSize: '1.05rem', whiteSpace: 'nowrap' }}>
                              ₹{coll.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 2. Mobile Cards List View (Screens < 640px) - Prevents squished tables */}
                  <div className="mobile-donors-list">
                    {filteredCollections.map((coll, index) => (
                      <div key={coll._id || index} className="mobile-donor-card">
                        <div className="mobile-donor-card-top">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                            <span className="mobile-donor-index">#{index + 1}</span>
                            <strong className="mobile-donor-name">{coll.donorName}</strong>
                          </div>
                          <span className="mobile-donor-amount">₹{coll.amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="mobile-donor-card-bottom">
                          <span className="mobile-donor-date">
                            📅 {new Date(coll.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          {coll.amount >= 10000 && (
                            <span className="badge badge-festive" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                              🌟 Special Donor
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Featured Vinayaka Idol Sponsor Modal */}
      {showSponsorModal && (
        <div
          className="sponsor-modal-overlay"
          onClick={() => setShowSponsorModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sponsor-modal-title"
        >
          <div className="sponsor-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="sponsor-modal-header">
              <button
                type="button"
                className="sponsor-modal-close-btn"
                onClick={() => setShowSponsorModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>🙏</div>
              <h2 id="sponsor-modal-title" style={{ color: 'white', fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>
                Vinayaka Idol Sponsor
              </h2>
              <p style={{ color: '#FFE082', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                Divine Patronage for Lord Vinayaka Utsav
              </p>
            </div>

            <div className="sponsor-modal-body">
              <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>
                Main Idol Sponsored By
              </span>

              <div className="sponsor-name-highlight">
                <h2>{settings?.idolSponsorName || 'UPPUTURI VENKATA GANESH'}</h2>
                <div style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.35rem' }}>
                  {settings?.idolSponsorDetails || 'Grand 9ft Eco-Friendly Clay Ganesha Idol'}
                </div>
              </div>

              {settings?.idolSponsorMessage && (
                <div style={{ background: 'hsl(30, 20%, 96%)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)', margin: '1rem 0', fontSize: '0.9rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{settings.idolSponsorMessage}"
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowSponsorModal(false)}
                  style={{ minWidth: '130px' }}
                >
                  🙏 Haro Hara / Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Online UPI QR Scanner Donation Modal */}
      <DonateModal
        isOpen={showDonateModal}
        onClose={() => setShowDonateModal(false)}
        onSuccess={fetchCollectionsData}
      />
    </div>
  );
};

export default PublicCollections;
