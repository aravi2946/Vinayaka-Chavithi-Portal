import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API_URL, getMediaUrl, isVideoUrl } from '../context/AuthContext';
import { Calendar, Bell, ShieldAlert, Phone, Mail, Award, MapPin, Clock, Heart, Users } from 'lucide-react';

const PublicHome = () => {
  const { settings } = useAuth();
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [donationsInfo, setDonationsInfo] = useState({ publicVisible: false, totalAmount: 0, collections: [] });
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, finished: false });

  useEffect(() => {
    // Fetch public collections info
    fetch(`${API_URL}/collections`)
      .then((res) => res.json())
      .then((data) => setDonationsInfo(data))
      .catch((err) => console.error(err));

    // Fetch published events
    fetch(`${API_URL}/events`)
      .then((res) => res.json())
      .then((data) => setEvents(data.slice(0, 3))) // Show top 3
      .catch((err) => console.error(err));

    // Fetch published announcements
    fetch(`${API_URL}/announcements`)
      .then((res) => res.json())
      .then((data) => setAnnouncements(data.slice(0, 3))) // Show top 3
      .catch((err) => console.error(err));

    // Fetch published gallery items
    fetch(`${API_URL}/gallery`)
      .then((res) => res.json())
      .then((data) => setGallery(data.slice(0, 4))) // Show top 4
      .catch((err) => console.error(err));
  }, []);

  // Countdown timer logic
  useEffect(() => {
    // Parse target date (Sept 14, 2026)
    const target = new Date('2026-09-14T08:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setCountdown((prev) => ({ ...prev, finished: true }));
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds, finished: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-container">
      {/* Festive Hero Banner */}
      <div className="festive-banner" style={settings.ganeshaImageUrl ? {
        backgroundImage: `linear-gradient(rgba(30, 15, 8, 0.85), rgba(20, 10, 5, 0.9)), url(${getMediaUrl(settings.ganeshaImageUrl)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}>
        <svg className="ganesha-accent" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ganeshaGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE57F" />
              <stop offset="50%" stopColor="#FFC107" />
              <stop offset="100%" stopColor="#FF9800" />
            </linearGradient>
            <linearGradient id="ganeshaSaffron" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF9100" />
              <stop offset="50%" stopColor="#FF6D00" />
              <stop offset="100%" stopColor="#E65100" />
            </linearGradient>
            <linearGradient id="ganeshaRed" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF3D00" />
              <stop offset="100%" stopColor="#BA0000" />
            </linearGradient>
          </defs>

          {/* Crown (Mukut / Kireetam) */}
          <path d="M50 6 C52 9 53 11 53 13 C53 15 52 16 50 16 C48 16 47 15 47 13 C47 11 48 9 50 6 Z" fill="url(#ganeshaGold)" />
          <circle cx="50" cy="5" r="1.5" fill="#FFF9C4" />
          <path d="M43 16 C46 14 54 14 57 16 L60 24 C54 22 46 22 40 24 L43 16 Z" fill="url(#ganeshaGold)" stroke="url(#ganeshaSaffron)" strokeWidth="1" strokeLinejoin="round" />
          <path d="M35 25 C45 22 55 22 65 25 C66 28 34 28 35 25 Z" fill="url(#ganeshaSaffron)" />
          <circle cx="42" cy="25" r="1" fill="#FFF9C4" />
          <circle cx="50" cy="24.5" r="1.2" fill="#FFF9C4" />
          <circle cx="58" cy="25" r="1" fill="#FFF9C4" />

          {/* Holy Tilak (Tripundra & Kumkum Bindi) */}
          <path d="M43 31 Q50 29 57 31" stroke="url(#ganeshaGold)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M42 34 Q50 32 58 34" stroke="url(#ganeshaGold)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M50 27 C48.5 30 48.5 35 50 38 C51.5 35 51.5 30 50 27 Z" fill="url(#ganeshaRed)" />
          <circle cx="50" cy="34" r="1.2" fill="#FFF9C4" />

          {/* Majestic Ears (Karna) */}
          {/* Left Ear */}
          <path d="M35 27 C22 26 12 34 13 47 C14 56 22 61 32 59" stroke="url(#ganeshaSaffron)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M26 36 C20 40 20 48 25 52" stroke="url(#ganeshaGold)" strokeWidth="1.6" strokeLinecap="round" />
          
          {/* Right Ear */}
          <path d="M65 27 C78 26 88 34 87 47 C86 56 78 61 68 59" stroke="url(#ganeshaSaffron)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M74 36 C80 40 80 48 75 52" stroke="url(#ganeshaGold)" strokeWidth="1.6" strokeLinecap="round" />

          {/* Divine Eyes & Brows */}
          <path d="M37 38 Q42 36 46 39" stroke="url(#ganeshaGold)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M54 39 Q58 36 63 38" stroke="url(#ganeshaGold)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M38 41 Q42 44 46 41" stroke="url(#ganeshaGold)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M54 41 Q58 44 62 41" stroke="url(#ganeshaGold)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="42" cy="41.5" r="1" fill="url(#ganeshaGold)" />
          <circle cx="58" cy="41.5" r="1" fill="url(#ganeshaGold)" />

          {/* Holy Tusks (Danta) */}
          {/* Right Full Tusk */}
          <path d="M38 52 L30 54 L36 56 Z" fill="#FFFDF0" stroke="url(#ganeshaGold)" strokeWidth="0.8" />
          {/* Left Broken Tusk (Ekadanta) */}
          <path d="M62 52 L68 54 L67.5 56 L62 56 Z" fill="#FFFDF0" stroke="url(#ganeshaGold)" strokeWidth="0.8" />

          {/* Sacred Curved Trunk (Vakratunda) */}
          <path d="M43 45 C44 55 45 65 44 73 C43 82 48 91 58 91 C68 91 73 82 69 74 C66 69 59 70 58 75 C57 79 61 82 65 80" stroke="url(#ganeshaSaffron)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M57 45 C56 53 53 60 52 68" stroke="url(#ganeshaSaffron)" strokeWidth="2.6" strokeLinecap="round" />

          {/* Sacred Trunk Folds */}
          <path d="M44 51 Q48 53 55 51" stroke="url(#ganeshaGold)" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M44 57 Q48 59 54 57" stroke="url(#ganeshaGold)" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M45 63 Q48 65 53 63" stroke="url(#ganeshaGold)" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M45 69 Q48 71 52 69" stroke="url(#ganeshaGold)" strokeWidth="1.4" strokeLinecap="round" />

          {/* Sacred Modak / Laddu */}
          <ellipse cx="64" cy="74" rx="3.5" ry="3" fill="url(#ganeshaGold)" stroke="#E65100" strokeWidth="0.6" />
          <path d="M62 72.5 Q64 69.5 66 72.5" fill="url(#ganeshaGold)" stroke="#E65100" strokeWidth="0.6" />
          <circle cx="64" cy="73.5" r="0.8" fill="#FFF9C4" />
        </svg>
        <h1>{settings.festivalName}</h1>
        <p>{settings.committeeName} welcomes you to join the grand celebrations!</p>

        <div style={{ margin: '1rem 0' }}>
          <span style={{ background: 'rgba(255,102,0,0.15)', color: 'var(--accent)', border: '1px solid rgba(255,102,0,0.3)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
            🗓️ Dates: {settings.festivalDates}
          </span>
        </div>

        {/* Live Countdown */}
        <div style={{ marginTop: '2rem' }}>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem' }}>
            Countdown to Sthapana Muhurtham
          </span>
          {countdown.finished ? (
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
              🌺 The Festival is Underway! Lord Ganesha Bless You! 🌺
            </div>
          ) : (
            <div className="countdown-container">
              <div className="countdown-box">
                <span className="number">{countdown.days}</span>
                <span className="label">Days</span>
              </div>
              <div className="countdown-box">
                <span className="number">{countdown.hours}</span>
                <span className="label">Hours</span>
              </div>
              <div className="countdown-box">
                <span className="number">{countdown.minutes}</span>
                <span className="label">Mins</span>
              </div>
              <div className="countdown-box">
                <span className="number">{countdown.seconds}</span>
                <span className="label">Secs</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        {/* Welcome message card */}
        <div className="card card-festive-border" style={{ gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>🌺 Welcome & Invitation</h2>
          <p style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.05rem' }}>
            Vinayaka Chavithi, the auspicious festival celebrating the birth of Lord Ganesha, represents the initiation of wisdom, prosperity, and the removal of obstacles.
          </p>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
            This year, our committee is putting together grand decorations, daily special homams, cultural competitions for youth and kids, community Annadanam dinners, and a vibrant immersion procession. We cordially invite you with family and friends to participate in the events, seek the blessings of Vinayaka, and contribute to this local festival.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/events" className="btn btn-primary btn-sm">View Event Schedule</Link>
            <Link to="/gallery" className="btn btn-secondary btn-sm">See Gallery</Link>
          </div>
        </div>

        {/* Collections Summary Card */}
        <div className="card card-festive-border" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={20} fill="var(--primary)" /> Donation Fund
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Your contributions support Puja materials, stage decorations, and feeding hundreds of devotees in the local community.
            </p>
          </div>

          <div style={{ background: 'hsl(30, 20%, 96%)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center', margin: '1rem 0' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Collection</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>
              ₹{donationsInfo.totalAmount.toLocaleString('en-IN')}
            </span>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              from approved donor records
            </span>
          </div>

          {/* Donation Bank / UPI Details */}
          <div style={{ background: 'hsl(0, 0%, 98%)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>💳</span> Bank / UPI details for donation
            </div>
            <div style={{ marginBottom: '0.1rem' }}>Account Name: <strong style={{ color: 'var(--text-main)' }}>{settings.accountName || 'UPPUTURI VENKATA GANESH'}</strong></div>
            <div>Payment Number: <strong style={{ color: 'var(--text-main)' }}>{settings.paymentNumber || '9948050484'}</strong></div>
          </div>

          <Link to="/collections" className="btn btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center' }}>
            View Donor List
          </Link>
        </div>
      </div>

      {/* Grid of Announcements & Events */}
      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        {/* Latest Announcements */}
        <div className="card">
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <Bell size={20} /> Latest Updates & Notices
          </h2>
          {announcements.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No announcements published yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {announcements.map((ann) => (
                <div key={ann._id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{ann.title}</h3>
                    <span className={`badge badge-${ann.priority.toLowerCase()}`}>{ann.priority}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{ann.description}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    📅 {new Date(ann.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events preview */}
        <div className="card">
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <Calendar size={20} /> Highlight Events
          </h2>
          {events.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No events published yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {events.map((evt) => (
                <div key={evt._id} className="event-card" style={{ paddingLeft: '0.75rem', borderLeft: '3px solid var(--primary)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{evt.eventName}</h3>
                  <div className="event-details">
                    <span className="event-detail-item"><Clock size={12} /> {evt.startTime} - {evt.endTime}</span>
                    <span className="event-detail-item"><MapPin size={12} /> {evt.venue}</span>
                  </div>
                  {evt.registrationRequired && (
                    <span className="badge badge-submitted" style={{ marginTop: '0.25rem', fontSize: '0.7rem' }}>
                      Registration Required
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gallery Section Preview */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="action-header">
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>📸 Festival Gallery</h2>
          <Link to="/gallery" className="btn btn-secondary btn-sm">View All Photos</Link>
        </div>
        {gallery.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
            No images uploaded to the gallery yet.
          </p>
        ) : (
          <div className="gallery-grid">
            {gallery.map((item) => (
              <div key={item._id} className="gallery-card">
                <div className="gallery-img-container">
                  {isVideoUrl(item.imageUrl) ? (
                    <video
                      src={getMediaUrl(item.imageUrl)}
                      controls
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <img src={getMediaUrl(item.imageUrl)} alt={item.caption} />
                  )}
                  <span className="gallery-badge">{item.eventCategory}</span>
                </div>
                <div className="gallery-details">
                  <p>{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Section */}
      <div className="card glass-panel" style={{ padding: '2rem', border: '1px solid rgba(255, 102, 0, 0.15)' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1rem', textAlign: 'center' }}>📞 Contact Festival Committee</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          For volunteer enrollment, puja sponsorship, and details on events, feel free to reach out.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
            <Phone size={18} style={{ color: 'var(--primary)' }} />
            <span>{settings.contactInfo || '+91 98765 43210'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
            <Mail size={18} style={{ color: 'var(--primary)' }} />
            <span>info@vinayakahome.org</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
            <MapPin size={18} style={{ color: 'var(--primary)' }} />
            <span>Central Mandap Arena</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicHome;
