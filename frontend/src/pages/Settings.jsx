import React, { useState, useEffect } from 'react';
import { useAuth, API_URL, getMediaUrl, getYouTubeEmbedUrl, extractYouTubeId, formatInstagramUrl, InstagramIcon } from '../context/AuthContext';
import { Settings as SettingsIcon, Save, Globe, Lock, Info, Video, Tv, Radio, ExternalLink, Sparkles, MapPin, Phone, Mail, Crown } from 'lucide-react';

const Settings = () => {
  const { user, settings, fetchSettings, triggerToast } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingLogo(true);
    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setForm((prev) => ({
        ...prev,
        logoUrl: data.fileUrl
      }));
      triggerToast('Logo uploaded successfully!', 'success');
    } catch (error) {
      console.error(error);
      triggerToast(error.message, 'danger');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingBanner(true);
    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setForm((prev) => ({
        ...prev,
        ganeshaImageUrl: data.fileUrl
      }));
      triggerToast('Banner image uploaded successfully!', 'success');
    } catch (error) {
      console.error(error);
      triggerToast(error.message, 'danger');
    } finally {
      setUploadingBanner(false);
    }
  };

  // Form state
  const [form, setForm] = useState({
    festivalName: '',
    committeeName: '',
    festivalYear: 2026,
    festivalDates: '',
    logoUrl: '',
    ganeshaImageUrl: '',
    contactInfo: '',
    contactPhone: '+91 9948050484',
    contactEmail: 'srinarahari4@gmail.com',
    contactLocation: 'Central Mandap Arena',
    liveStreamActive: false,
    liveStreamUrl: '',
    liveStreamTitle: 'Vinayaka Chavithi Mahotsavam - Live Darshanam',
    liveStreamDescription: 'Watch live morning & evening aarti, special homam, and cultural celebrations directly from the mandap.',
    paymentNumber: '',
    accountName: '',
    publicCollectionVisibility: true,
    registrationSettings: true,
    announcementSettings: true,
    idolSponsorActive: true,
    idolSponsorName: 'UPPUTURI VENKATA GANESH',
    idolSponsorDetails: 'Grand 9ft Eco-Friendly Clay Ganesha Idol Seva',
    idolSponsorMessage: 'Heartfelt gratitude and Lord Vinayaka blessings to the sponsor family for divine patronage.',
    idolSponsorAmount: '',
    instagramUrl: 'https://instagram.com/',
    instagramHandle: '@vinayaka_utsav',
  });

  useEffect(() => {
    if (settings) {
      // Split legacy contactInfo if exists and new fields aren't populated
      let defaultPhone = settings.contactPhone || '+91 9948050484';
      let defaultEmail = settings.contactEmail || 'srinarahari4@gmail.com';
      if (settings.contactInfo && (!settings.contactPhone || !settings.contactEmail)) {
        const parts = settings.contactInfo.split(',').map((s) => s.trim());
        if (parts.length > 1) {
          const emailPart = parts.find((p) => p.includes('@'));
          const phonePart = parts.find((p) => !p.includes('@'));
          if (emailPart) defaultEmail = emailPart;
          if (phonePart) defaultPhone = phonePart;
        } else if (settings.contactInfo.includes('@')) {
          defaultEmail = settings.contactInfo;
        } else if (settings.contactInfo) {
          defaultPhone = settings.contactInfo;
        }
      }

      setForm({
        festivalName: settings.festivalName || '',
        committeeName: settings.committeeName || '',
        festivalYear: settings.festivalYear || 2026,
        festivalDates: settings.festivalDates || '',
        logoUrl: settings.logoUrl || '',
        ganeshaImageUrl: settings.ganeshaImageUrl || '',
        contactInfo: settings.contactInfo || '',
        contactPhone: defaultPhone,
        contactEmail: defaultEmail,
        contactLocation: settings.contactLocation || 'Central Mandap Arena',
        liveStreamActive: settings.liveStreamActive !== undefined ? settings.liveStreamActive : false,
        liveStreamUrl: settings.liveStreamUrl || '',
        liveStreamTitle: settings.liveStreamTitle || 'Vinayaka Chavithi Mahotsavam - Live Darshanam',
        liveStreamDescription: settings.liveStreamDescription || 'Watch live morning & evening aarti, special homam, and cultural celebrations directly from the mandap.',
        paymentNumber: settings.paymentNumber || '',
        accountName: settings.accountName || '',
        publicCollectionVisibility: settings.publicCollectionVisibility !== undefined ? settings.publicCollectionVisibility : true,
        registrationSettings: settings.registrationSettings !== undefined ? settings.registrationSettings : true,
        announcementSettings: settings.announcementSettings !== undefined ? settings.announcementSettings : true,
        idolSponsorActive: settings.idolSponsorActive !== undefined ? settings.idolSponsorActive : true,
        idolSponsorName: settings.idolSponsorName || 'UPPUTURI VENKATA GANESH',
        idolSponsorDetails: settings.idolSponsorDetails || 'Grand 9ft Eco-Friendly Clay Ganesha Idol Seva',
        idolSponsorMessage: settings.idolSponsorMessage || 'Heartfelt gratitude and Lord Vinayaka blessings to the sponsor family for divine patronage.',
        idolSponsorAmount: settings.idolSponsorAmount || '',
        instagramUrl: settings.instagramUrl || 'https://instagram.com/',
        instagramHandle: settings.instagramHandle || '@vinayaka_utsav',
      });
      setLoading(false);
    }
  }, [settings]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      // Keep contactInfo synchronized for backward compatibility
      if (name === 'contactPhone' || name === 'contactEmail') {
        const phone = name === 'contactPhone' ? value : prev.contactPhone;
        const email = name === 'contactEmail' ? value : prev.contactEmail;
        updated.contactInfo = `${phone}${email ? ` , ${email}` : ''}`;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.festivalName || !form.committeeName) {
      triggerToast('Festival name and committee name cannot be empty', 'warning');
      return;
    }

    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to save settings');
      }

      triggerToast('Festival settings updated successfully!', 'success');
      fetchSettings(); // Refresh AuthContext settings
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  const youtubeVideoId = extractYouTubeId(form.liveStreamUrl);
  const previewEmbedUrl = getYouTubeEmbedUrl(form.liveStreamUrl);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--primary)' }}>Loading configuration...</div>;
  }

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span>⚙️</span> Global Festival Settings
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Super Admin control panel to configure festival details, calendar dates, YouTube live streaming, branding, and public portal visibility.</p>
        </div>
      </div>

      <div className="grid-3">
        {/* Left Column: Form Settings (Span 2) */}
        <div className="span-2">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* 1. Basic Details Card */}
            <div className="card card-festive-border">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <SettingsIcon size={18} /> Configuration Details
              </h2>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="festivalName">Festival Celebration Name *</label>
                  <input
                    type="text"
                    id="festivalName"
                    name="festivalName"
                    className="form-control"
                    placeholder="E.g. Vinayaka Chavithi Celebration"
                    value={form.festivalName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="committeeName">Organizing Committee Name *</label>
                  <input
                    type="text"
                    id="committeeName"
                    name="committeeName"
                    className="form-control"
                    placeholder="E.g. Sri Vinayaka Seva Samiti"
                    value={form.committeeName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="festivalYear">Celebration Year *</label>
                  <input
                    type="number"
                    id="festivalYear"
                    name="festivalYear"
                    className="form-control"
                    placeholder="E.g. 2026"
                    value={form.festivalYear}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="festivalDates">Festival Date Range *</label>
                  <input
                    type="text"
                    id="festivalDates"
                    name="festivalDates"
                    className="form-control"
                    placeholder="E.g. September 14 - September 19, 2026"
                    value={form.festivalDates}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="logoUrl">Committee Logo Image</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <input
                      type="text"
                      id="logoUrl"
                      name="logoUrl"
                      className="form-control"
                      placeholder="Logo URL or uploaded path"
                      value={form.logoUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <label className="btn btn-secondary btn-sm" style={{ margin: 0, display: 'inline-flex', cursor: 'pointer', position: 'relative' }}>
                      {uploadingLogo ? 'Uploading...' : '📁 Upload Logo'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                      />
                    </label>
                  </div>
                </div>
                {form.logoUrl && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img
                      src={getMediaUrl(form.logoUrl)}
                      alt="Preview Logo"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>Previewing: {form.logoUrl}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="ganeshaImageUrl">Lord Ganesha Main Painting / Welcome Banner Image</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <input
                      type="text"
                      id="ganeshaImageUrl"
                      name="ganeshaImageUrl"
                      className="form-control"
                      placeholder="Banner URL or uploaded path"
                      value={form.ganeshaImageUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <label className="btn btn-secondary btn-sm" style={{ margin: 0, display: 'inline-flex', cursor: 'pointer', position: 'relative' }}>
                      {uploadingBanner ? 'Uploading...' : '📁 Upload Banner'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                        onChange={handleBannerUpload}
                        disabled={uploadingBanner}
                      />
                    </label>
                  </div>
                </div>
                {form.ganeshaImageUrl && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img
                      src={getMediaUrl(form.ganeshaImageUrl)}
                      alt="Preview Banner"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      style={{ height: 40, width: 'auto', borderRadius: '4px', objectFit: 'contain', border: '1px solid var(--border-color)' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>Previewing: {form.ganeshaImageUrl}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. YouTube Live Video Broadcast Settings Card */}
            <div className="card card-festive-border" style={{ borderTop: '4px solid hsl(0, 85%, 55%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'hsl(0, 80%, 45%)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Radio size={20} className="pulse-icon" style={{ color: 'hsl(0, 85%, 55%)' }} /> 
                  YouTube Live Video Broadcast
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label className="live-toggle-label" htmlFor="liveStreamActive" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      id="liveStreamActive"
                      name="liveStreamActive"
                      checked={form.liveStreamActive}
                      onChange={handleInputChange}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: form.liveStreamActive ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {form.liveStreamActive ? '🔴 Broadcast LIVE on Public Site' : '⚪ Stream Inactive (Hidden)'}
                    </span>
                  </label>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Share your YouTube live stream URL to broadcast pujas, cultural dances, and procession directly onto the public portal screen in real-time.
              </p>

              <div className="form-group">
                <label htmlFor="liveStreamUrl" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>YouTube Live Video URL or Video ID</span>
                  {youtubeVideoId && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                      ✓ Detected Video ID: {youtubeVideoId}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  id="liveStreamUrl"
                  name="liveStreamUrl"
                  className="form-control"
                  placeholder="E.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/... or https://www.youtube.com/live/..."
                  value={form.liveStreamUrl}
                  onChange={handleInputChange}
                />
                <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Supported formats: Standard watch links (<code>youtube.com/watch?v=...</code>), Short links (<code>youtu.be/...</code>), Live stream links (<code>youtube.com/live/...</code>), or 11-character Video ID.
                </span>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="liveStreamTitle">Live Broadcast Title</label>
                  <input
                    type="text"
                    id="liveStreamTitle"
                    name="liveStreamTitle"
                    className="form-control"
                    placeholder="E.g. Maha Ganapathi Homam & Aarti - Live"
                    value={form.liveStreamTitle}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="liveStreamDescription">Stream Subtitle / Status</label>
                  <input
                    type="text"
                    id="liveStreamDescription"
                    name="liveStreamDescription"
                    className="form-control"
                    placeholder="E.g. Live darshanam broadcast from main stage mandap"
                    value={form.liveStreamDescription}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Real-time preview player */}
              {previewEmbedUrl ? (
                <div style={{ marginTop: '1rem', background: 'hsl(30, 10%, 12%)', borderRadius: 'var(--radius-md)', padding: '1rem', color: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Tv size={16} /> Live Preview in Admin Panel
                    </span>
                    <span className="badge badge-high" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                      Ready to Broadcast
                    </span>
                  </div>
                  <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
                    <iframe
                      src={previewEmbedUrl}
                      title="YouTube Live Stream Preview"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              ) : form.liveStreamUrl ? (
                <div style={{ padding: '0.75rem', background: 'rgba(255, 0, 0, 0.05)', border: '1px solid rgba(255,0,0,0.15)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.85rem' }}>
                  ⚠️ Unable to detect YouTube Video ID from the link provided. Please check the URL format.
                </div>
              ) : null}
            </div>

            {/* 3. Contact & Banking Details Card */}
            <div className="card card-festive-border">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={18} /> Contact & Donation Info
              </h2>

              <div className="grid-3">
                <div className="form-group">
                  <label htmlFor="contactPhone">Committee Phone Number *</label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    className="form-control"
                    placeholder="E.g. +91 9948050484"
                    value={form.contactPhone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contactEmail">Committee Contact Email</label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    className="form-control"
                    placeholder="E.g. info@festival.org"
                    value={form.contactEmail}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contactLocation">Festival Mandap Location</label>
                  <input
                    type="text"
                    id="contactLocation"
                    name="contactLocation"
                    className="form-control"
                    placeholder="E.g. Central Mandap Arena, Main Road"
                    value={form.contactLocation}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="accountName">Donation Account Name</label>
                  <input
                    type="text"
                    id="accountName"
                    name="accountName"
                    className="form-control"
                    placeholder="E.g. UPPUTURI VENKATA GANESH"
                    value={form.accountName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="paymentNumber">Donation Payment / UPI Number</label>
                  <input
                    type="text"
                    id="paymentNumber"
                    name="paymentNumber"
                    className="form-control"
                    placeholder="E.g. 9948050484"
                    value={form.paymentNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Vinayaka Idol Sponsor Configuration Card */}
            <div className="card card-festive-border">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Crown size={20} style={{ color: '#FFB300' }} /> 👑 Vinayaka Idol Sponsor Management
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="idolSponsorActive"
                    name="idolSponsorActive"
                    checked={form.idolSponsorActive}
                    onChange={handleInputChange}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="idolSponsorActive" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', margin: 0 }}>
                    Show Idol Sponsor on Public Portal
                  </label>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Highlight the prominent devotee, family, or organization sponsoring the sacred Vinayaka Idol. Users can click the button to view their name and blessings.
              </p>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="idolSponsorName">Idol Sponsor Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input
                    type="text"
                    id="idolSponsorName"
                    name="idolSponsorName"
                    className="form-control"
                    placeholder="E.g. UPPUTURI VENKATA GANESH & Family"
                    value={form.idolSponsorName}
                    onChange={handleInputChange}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Displayed prominently when devotees click "Vinayaka Idol Sponsor".
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="idolSponsorDetails">Sponsorship Title / Idol Description</label>
                  <input
                    type="text"
                    id="idolSponsorDetails"
                    name="idolSponsorDetails"
                    className="form-control"
                    placeholder="E.g. Grand 9ft Eco-Friendly Clay Ganesha Idol Seva"
                    value={form.idolSponsorDetails}
                    onChange={handleInputChange}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Subtitle detailing the idol size or special puja contribution.
                  </small>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="idolSponsorMessage">Sponsor Blessing Note / Committee Acknowledgment</label>
                <textarea
                  id="idolSponsorMessage"
                  name="idolSponsorMessage"
                  className="form-control"
                  rows="2"
                  placeholder="E.g. Special prayers and heartfelt gratitude to the sponsor family for divine patronage."
                  value={form.idolSponsorMessage}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              {/* Sponsor Badge Live Preview */}
              {form.idolSponsorName && (
                <div style={{ background: 'hsl(38, 100%, 97%)', border: '1px solid hsl(38, 90%, 75%)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>
                    ✨ Public Button & Modal Live Preview:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="idol-sponsor-hero-btn" style={{ cursor: 'default' }}>
                      <Crown size={16} /> 👑 Idol Sponsor: {form.idolSponsorName}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      • {form.idolSponsorDetails || 'Idol Seva'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Social Media & Instagram Configuration Card */}
            <div className="card">
              <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <InstagramIcon size={20} color="#E1306C" /> 📸 Instagram & Social Media Integration
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Direct devotees and visitors to your official Instagram page from the navigation bar, hero banner, and contact section.
              </p>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="instagramUrl">Instagram Profile Link or Username</label>
                  <input
                    type="text"
                    id="instagramUrl"
                    name="instagramUrl"
                    className="form-control"
                    placeholder="E.g. https://instagram.com/vinayaka_utsav or @vinayaka_utsav"
                    value={form.instagramUrl}
                    onChange={handleInputChange}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Devotees clicking the Instagram icon will be redirected to this link.
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="instagramHandle">Instagram Display Tag / Name</label>
                  <input
                    type="text"
                    id="instagramHandle"
                    name="instagramHandle"
                    className="form-control"
                    placeholder="E.g. @vinayaka_utsav"
                    value={form.instagramHandle}
                    onChange={handleInputChange}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Label shown beside the Instagram button.
                  </small>
                </div>
              </div>

              {form.instagramUrl && (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <a
                    href={formatInstagramUrl(form.instagramUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="instagram-btn"
                    style={{ textDecoration: 'none' }}
                  >
                    <InstagramIcon size={16} /> <span>Test Link: {form.instagramHandle || 'Open Profile'}</span>
                  </a>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Target: {formatInstagramUrl(form.instagramUrl)}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 102, 0, 0.05)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,102,0,0.1)', fontSize: '0.85rem' }}>
              <Info size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div>
                Updating these settings updates the public home page, live stream section, PDF receipts, and contact cards instantly across all devices.
              </div>
            </div>

            <div>
              <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
                <Save size={16} /> Save All Settings
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Portal Visibility Configurations (Span 1) */}
        <div>
          <div className="card">
            <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Globe size={18} /> Public Portal Controls
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Control public visibility of sections on the devotee portal. Edits save with the main configuration form.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  id="publicCollectionVisibility"
                  name="publicCollectionVisibility"
                  checked={form.publicCollectionVisibility}
                  onChange={handleInputChange}
                  style={{ marginTop: '0.2rem' }}
                />
                <label htmlFor="publicCollectionVisibility" style={{ cursor: 'pointer' }}>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Show Donor List Publicly</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Controls individual donor list table visibility on the public collections page. Total donation fund summary and UPI banking info remain visible at all times.
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  id="registrationSettings"
                  name="registrationSettings"
                  checked={form.registrationSettings}
                  onChange={handleInputChange}
                  style={{ marginTop: '0.2rem' }}
                />
                <label htmlFor="registrationSettings" style={{ cursor: 'pointer' }}>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Enable Public Registration</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Permit public users to submit registrations for drawing, sloka, or music events requiring registrations.
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  id="announcementSettings"
                  name="announcementSettings"
                  checked={form.announcementSettings}
                  onChange={handleInputChange}
                  style={{ marginTop: '0.2rem' }}
                />
                <label htmlFor="announcementSettings" style={{ cursor: 'pointer' }}>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Show Public Announcements</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Display the announcements update board on the public home page and bulletin routes.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
