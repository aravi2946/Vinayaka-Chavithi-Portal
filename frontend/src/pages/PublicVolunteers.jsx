import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { Users, Search, MapPin, Sparkles, Phone, HeartHandshake, Filter } from 'lucide-react';

const PublicVolunteers = () => {
  const { settings } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');

  useEffect(() => {
    fetch(`${API_URL}/volunteers`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setVolunteers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching volunteers:', err);
        setLoading(false);
      });
  }, []);

  const getRoleClass = (resp) => {
    if (!resp) return 'volunteer-role-default';
    const lower = resp.toLowerCase();
    if (lower.includes('food')) return 'volunteer-role-food';
    if (lower.includes('decor')) return 'volunteer-role-decorations';
    if (lower.includes('puja')) return 'volunteer-role-puja';
    if (lower.includes('crowd') || lower.includes('security')) return 'volunteer-role-crowd';
    if (lower.includes('cultur')) return 'volunteer-role-cultural';
    return 'volunteer-role-default';
  };

  const getRoleIcon = (resp) => {
    if (!resp) return '🤝';
    const lower = resp.toLowerCase();
    if (lower.includes('food')) return '🍲';
    if (lower.includes('decor')) return '🎨';
    if (lower.includes('puja')) return '🪔';
    if (lower.includes('crowd')) return '👥';
    if (lower.includes('security')) return '🛡️';
    if (lower.includes('clean')) return '🧹';
    if (lower.includes('transp')) return '🚚';
    if (lower.includes('cultur')) return '🎭';
    if (lower.includes('event')) return '📋';
    return '🤝';
  };

  // Distinct roles for filter buttons
  const rolesList = ['All', ...new Set(volunteers.map((v) => v.assignedResponsibility || 'General Seva').filter((r) => r && r !== 'None'))];

  // Filter volunteers based on search and category
  const filteredVolunteers = volunteers.filter((vol) => {
    const matchesSearch =
      vol.name?.toLowerCase().includes(search.toLowerCase()) ||
      vol.phone?.toLowerCase().includes(search.toLowerCase()) ||
      vol.area?.toLowerCase().includes(search.toLowerCase()) ||
      vol.assignedResponsibility?.toLowerCase().includes(search.toLowerCase());

    const volRole = vol.assignedResponsibility || 'General Seva';
    const matchesRole = selectedRole === 'All' || volRole === selectedRole;

    return matchesSearch && matchesRole;
  });

  // Extract contact phone
  let phone = settings?.contactPhone || '';
  if (!phone && settings?.contactInfo) {
    const parts = settings.contactInfo.split(',').map((s) => s.trim());
    const phonePart = parts.find((p) => !p.includes('@'));
    if (phonePart) phone = phonePart;
  }
  if (!phone) phone = '+91 9948050484';

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="action-header" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)' }}>
            <Users size={28} /> Festival Sevadals & Volunteers
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            Meet our dedicated team of volunteers working selflessly for {settings?.festivalName || 'Vinayaka Chavithi'}
          </p>
        </div>
        <span className="volunteers-badge-count" style={{ fontSize: '0.9rem', padding: '0.4rem 0.85rem' }}>
          <Sparkles size={16} style={{ color: 'var(--primary)' }} />
          {volunteers.length} Enrolled Sevadals
        </span>
      </div>

      {/* Live Seva Ticker */}
      {volunteers.length > 0 && (
        <div className="volunteers-ticker-wrapper" style={{ marginBottom: '1.5rem' }}>
          <div className="volunteers-ticker-label">
            <span>✨ LIVE SEVA ON DUTY</span>
          </div>
          <div className="volunteers-ticker-track">
            {volunteers.map((vol, index) => (
              <div key={vol._id || index} className="volunteers-ticker-item">
                <span>{getRoleIcon(vol.assignedResponsibility)}</span>
                <span>{vol.name}</span>
                {vol.assignedResponsibility && vol.assignedResponsibility !== 'None' && (
                  <span className="duty">({vol.assignedResponsibility})</span>
                )}
                {vol.phone && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--primary)', fontWeight: 600 }}>
                    <Phone size={11} /> {vol.phone}
                  </span>
                )}
                {vol.area && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>• {vol.area}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search volunteers by name, phone, duty, or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSearch('')}
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Role Filter Chips */}
        {rolesList.length > 1 && (
          <div className="volunteers-filter-bar" style={{ marginBottom: 0, paddingBottom: 0 }}>
            {rolesList.map((role) => (
              <button
                key={role}
                type="button"
                className={`volunteers-filter-btn ${selectedRole === role ? 'active' : ''}`}
                onClick={() => setSelectedRole(role)}
              >
                {role !== 'All' && <span>{getRoleIcon(role)}</span>}
                <span>{role}</span>
                <span style={{ opacity: 0.75, fontSize: '0.75rem' }}>
                  ({role === 'All' ? volunteers.length : volunteers.filter((v) => (v.assignedResponsibility || 'General Seva') === role).length})
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Volunteer Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--primary)' }}>
          Loading volunteer directory...
        </div>
      ) : filteredVolunteers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '1rem', marginBottom: '1rem' }}>
            {search || selectedRole !== 'All'
              ? 'No volunteers found matching your search filters.'
              : 'No volunteers registered in the public directory yet.'}
          </p>
          {(search || selectedRole !== 'All') && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => { setSearch(''); setSelectedRole('All'); }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="volunteers-public-grid" style={{ marginBottom: '3rem' }}>
          {filteredVolunteers.map((vol, idx) => (
            <div key={vol._id || idx} className="volunteer-public-card">
              <div className="volunteer-avatar-circle">
                {vol.name ? vol.name.charAt(0).toUpperCase() : 'V'}
              </div>
              <div className="volunteer-info-box">
                <div className="volunteer-name-text" title={vol.name}>
                  {vol.name}
                </div>
                <div className="volunteer-meta-row">
                  <span className={`volunteer-role-pill ${getRoleClass(vol.assignedResponsibility)}`}>
                    <span>{getRoleIcon(vol.assignedResponsibility)}</span>
                    <span>{vol.assignedResponsibility && vol.assignedResponsibility !== 'None' ? vol.assignedResponsibility : 'General Seva'}</span>
                  </span>
                  {vol.phone && (
                    <a
                      href={`tel:${vol.phone}`}
                      className="volunteer-phone-tag"
                      title={`Call ${vol.name} (${vol.phone})`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--primary)',
                        textDecoration: 'none',
                        background: 'hsl(20, 100%, 96%)',
                        border: '1px solid hsl(20, 90%, 88%)',
                        borderRadius: '4px',
                        padding: '0.15rem 0.45rem',
                      }}
                    >
                      <Phone size={11} /> {vol.phone}
                    </a>
                  )}
                  {vol.area && (
                    <span className="volunteer-area-tag" title={vol.area}>
                      <MapPin size={11} /> {vol.area}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action: Join as Volunteer */}
      <div className="card card-festive-border" style={{ background: 'linear-gradient(135deg, hsl(30, 20%, 98%), hsl(20, 90%, 98%))', textAlign: 'center', padding: '2rem 1.5rem' }}>
        <HeartHandshake size={36} style={{ color: 'var(--primary)', margin: '0 auto 0.75rem auto' }} />
        <h2 style={{ fontSize: '1.3rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
          Want to Serve in Lord Ganesha's Utsav?
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 1.25rem auto', fontSize: '0.95rem' }}>
          We welcome enthusiastic devotees for Prasadam distribution, Mandap decoration, Puja coordination, and event security.
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', fontWeight: 600, color: 'var(--primary-dark)' }}>
          <Phone size={16} /> Contact Organizers: <span>{phone}</span>
        </div>
      </div>
    </div>
  );
};

export default PublicVolunteers;
