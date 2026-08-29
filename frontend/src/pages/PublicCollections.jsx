import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Heart, ShieldCheck, Landmark, Search, X, Sparkles, Crown, Filter, ArrowUpDown } from 'lucide-react';

const PublicCollections = () => {
  const { settings } = useAuth();
  const [data, setData] = useState({ publicVisible: true, showDonorsList: true, totalAmount: 0, donorsCount: 0, collections: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showSponsorModal, setShowSponsorModal] = useState(false);

  useEffect(() => {
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
  }, []);

  // Filter and sort donor list client-side
  const filteredCollections = useMemo(() => {
    if (!data.collections || !Array.isArray(data.collections)) return [];
    
    let result = data.collections.filter((item) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      const donorMatch = item.donorName && item.donorName.toLowerCase().includes(query);
      const amountMatch = item.amount && item.amount.toString().includes(query);
      const dateStr = item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).toLowerCase() : '';
      const dateMatch = dateStr.includes(query);
      return donorMatch || amountMatch || dateMatch;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'amount-desc') return (b.amount || 0) - (a.amount || 0);
      if (sortBy === 'amount-asc') return (a.amount || 0) - (b.amount || 0);
      if (sortBy === 'name-asc') return (a.donorName || '').localeCompare(b.donorName || '');
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      // default: 'date-desc'
      return new Date(b.date) - new Date(a.date);
    });

    return result;
  }, [data.collections, searchQuery, sortBy]);

  const hasIdolSponsor = (settings?.idolSponsorActive !== false) && (settings?.idolSponsorName && settings?.idolSponsorName.trim().length > 0);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="action-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>🙏 Donor & Collection Summary</h1>
          <p style={{ color: 'var(--text-muted)' }}>Public log of contributions supporting the Vinayaka Chavithi celebrations.</p>
        </div>

        {hasIdolSponsor && (
          <button
            type="button"
            className="idol-sponsor-hero-btn"
            onClick={() => setShowSponsorModal(true)}
            title="View Vinayaka Idol Sponsor Details"
          >
            <span className="idol-sponsor-shine-dot"></span>
            <Crown size={18} />
            <span>Vinayaka Idol Sponsor</span>
          </button>
        )}
      </div>

      {/* Featured Vinayaka Idol Sponsor Card */}
      {hasIdolSponsor && (
        <div className="idol-sponsor-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className="idol-sponsor-icon-badge">
              <Crown size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)' }}>
                  👑 Grand Patron & Seva
                </span>
                <span className="badge badge-festive" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                  Vinayaka Idol Sponsor
                </span>
              </div>
              <h3 style={{ fontSize: '1.35rem', color: '#B71C1C', margin: '0.2rem 0', fontWeight: 800 }}>
                {settings?.idolSponsorName}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                {settings?.idolSponsorDetails || 'Grand Eco-Friendly Clay Vinayaka Idol Seva'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowSponsorModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Sparkles size={15} /> View Sponsor Blessing
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--primary)' }}>Loading donation logs...</div>
      ) : (
        <div>
          {/* Summary Dashboard Card (Only show if publicVisible is true) */}
          {data.publicVisible && (
            <div className="grid-3" style={{ marginBottom: '2rem' }}>
              <div className="card card-festive-border span-2" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ background: 'var(--grad-festive)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}>
                  <Heart size={28} fill="white" />
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                    Total Festival Collection
                  </span>
                  <span style={{ display: 'block', fontSize: '2.2rem', fontWeight: 800, color: 'var(--success)' }}>
                    ₹{(data.totalAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="card card-festive-border" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ background: 'var(--grad-gold)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: 'var(--radius-sm)' }}>
                  <Landmark size={28} />
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                    Total Donors
                  </span>
                  <span style={{ display: 'block', fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                    {data.donorsCount !== undefined ? data.donorsCount : data.collections.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Donation Bank / UPI Details Card */}
          <div className="card glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', border: '1px solid rgba(255, 102, 0, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>💳</span> Support Our Festival - Donation Details
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Your contributions fund Puja materials, community Annadanam dinners, and stage decorations.
              </p>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
              <div style={{ marginBottom: '0.1rem' }}>Account Name: <strong style={{ fontWeight: 700 }}>{settings?.accountName || 'UPPUTURI VENKATA GANESH'}</strong></div>
              <div>Payment Number (UPI): <strong style={{ fontWeight: 700 }}>{settings?.paymentNumber || '9948050484'}</strong></div>
            </div>
          </div>

          {/* Donor Table or Hidden Message */}
          {!data.showDonorsList ? (
            <div className="card card-festive-border" style={{ textAlign: 'center', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', border: '1px dashed var(--primary)' }}>
              <div style={{ background: 'rgba(255, 102, 0, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%' }}>
                <ShieldCheck size={32} />
              </div>
              <h2 style={{ color: 'var(--primary)', fontSize: '1.5rem', margin: 0 }}>Donors List Hidden</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Individual donor details are currently kept private by the administrator. The total collection amount and donation banking details remain public.
              </p>
            </div>
          ) : (
            <>
              {/* Toolbar: Search Box & Sort Options */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.35rem', color: 'var(--primary)', margin: 0 }}>
                    📜 Approved Donor Directory
                  </h2>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Showing {filteredCollections.length} of {data.collections.length} approved donations
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
                  {/* Search Input Box */}
                  <div className="donors-search-box">
                    <Search size={18} className="donors-search-icon" />
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
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* Sort Dropdown */}
                  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                    <select
                      className="form-control"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{
                        padding: '0.65rem 1rem',
                        fontSize: '0.88rem',
                        borderRadius: 'var(--radius-full)',
                        border: '1.5px solid var(--border-color)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                      }}
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

              {/* Donor Table or Empty Search Results */}
              {data.collections.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
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
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Donor Name</th>
                        <th style={{ textAlign: 'right' }}>Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCollections.map((coll, index) => (
                        <tr key={coll._id || index}>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', width: '50px' }}>
                            {index + 1}
                          </td>
                          <td>
                            {new Date(coll.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span>{coll.donorName}</span>
                              {coll.amount >= 10000 && (
                                <span className="badge badge-festive" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                                  🌟 Special Donor
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)', fontSize: '1.05rem' }}>
                            ₹{coll.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* =========================================================================
          FEATURE: Vinayaka Idol Sponsor Festive Modal
         ========================================================================= */}
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
              <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>👑</div>
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
    </div>
  );
};

export default PublicCollections;
