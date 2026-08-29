import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, getMediaUrl, formatInstagramUrl, InstagramIcon } from '../context/AuthContext';
import { Menu, X, Landmark, Calendar, Megaphone, Image, FileText, Lock, LayoutDashboard, Radio } from 'lucide-react';

const Navbar = () => {
  const { user, settings } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [settings?.logoUrl]);

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => setMobileOpen(!mobileOpen);

  const isLiveActive = settings?.liveStreamActive && settings?.liveStreamUrl;

  return (
    <nav className="public-nav">
      <Link to="/" className="public-nav-brand">
        {settings?.logoUrl && !logoError ? (
          <img
            src={getMediaUrl(settings.logoUrl)}
            alt={settings.festivalName || 'Logo'}
            onError={() => setLogoError(true)}
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <span style={{ fontSize: '1.8rem', marginRight: '0.2rem', lineHeight: 1, flexShrink: 0 }}>🕉️</span>
        )}
        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="public-nav-title">
              {settings?.festivalName || 'Vinayaka Chavithi Utsav'}
            </span>
            {isLiveActive && (
              <span className="nav-live-chip">
                <span className="live-indicator-dot"></span> LIVE
              </span>
            )}
          </div>
          <span className="public-nav-subtitle">
            {settings?.committeeName || 'Organizing Committee'}
          </span>
        </div>
      </Link>

      <button className="menu-btn" onClick={toggleMobileMenu} aria-label="Toggle Navigation Menu">
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileOpen && (
        <div
          className="nav-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={`public-nav-links ${mobileOpen ? 'mobile-open' : ''}`}>
        <Link to="/" className={`public-nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          Home
        </Link>

        {isLiveActive && (
          <a href="/#live-stream-section" className="public-nav-link nav-live-link" onClick={() => setMobileOpen(false)}>
            🔴 Live Puja
          </a>
        )}
        
        <Link to="/volunteers" className={`public-nav-link ${isActive('/volunteers') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          Volunteers
        </Link>

        <Link to="/events" className={`public-nav-link ${isActive('/events') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          Events
        </Link>

        <Link to="/collections" className={`public-nav-link ${isActive('/collections') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          Donations
        </Link>

        {settings?.announcementSettings && (
          <Link to="/announcements" className={`public-nav-link ${isActive('/announcements') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
            Announcements
          </Link>
        )}

        <Link to="/gallery" className={`public-nav-link ${isActive('/gallery') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          Gallery
        </Link>

        {settings?.instagramUrl && (
          <a
            href={formatInstagramUrl(settings.instagramUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-nav-icon"
            title={`Follow on Instagram (${settings.instagramHandle || 'Instagram'})`}
            aria-label="Instagram Profile"
            onClick={() => setMobileOpen(false)}
          >
            <InstagramIcon size={18} />
          </a>
        )}

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
