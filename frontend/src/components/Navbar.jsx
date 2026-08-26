import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, getMediaUrl } from '../context/AuthContext';
import { Menu, X, Landmark, Calendar, Megaphone, Image, FileText, Lock, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, settings } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => setMobileOpen(!mobileOpen);

  return (
    <nav className="public-nav">
      <Link to="/" className="public-nav-brand">
        {settings.logoUrl ? (
          <img src={getMediaUrl(settings.logoUrl)} alt="Logo" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '1.8rem', marginRight: '0.2rem' }}>🕉️</span>
        )}
        <div>
          <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-sans)', color: 'var(--primary)' }}>
            {settings.festivalName}
          </span>
          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
            {settings.committeeName}
          </span>
        </div>
      </Link>

      <button className="menu-btn" onClick={toggleMobileMenu}>
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`public-nav-links ${mobileOpen ? 'mobile-open' : ''}`}>
        <Link to="/" className={`public-nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          Home
        </Link>
        
        <Link to="/collections" className={`public-nav-link ${isActive('/collections') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          Donations
        </Link>

        <Link to="/events" className={`public-nav-link ${isActive('/events') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          Events
        </Link>

        {settings.announcementSettings && (
          <Link to="/announcements" className={`public-nav-link ${isActive('/announcements') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
            Announcements
          </Link>
        )}

        <Link to="/gallery" className={`public-nav-link ${isActive('/gallery') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          Gallery
        </Link>

        {user ? (
          <Link to="/dashboard" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>
            <LayoutDashboard size={16} />
            Portal Dashboard
          </Link>
        ) : (
          <Link to="/login" className="btn btn-secondary btn-sm" onClick={() => setMobileOpen(false)}>
            <Lock size={16} />
            Committee Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
