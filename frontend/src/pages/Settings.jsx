import React, { useState, useEffect } from 'react';
import { useAuth, API_URL, getMediaUrl } from '../context/AuthContext';
import { Settings as SettingsIcon, Save, Globe, Lock, Info } from 'lucide-react';

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
    paymentNumber: '',
    accountName: '',
    publicCollectionVisibility: true,
    registrationSettings: true,
    announcementSettings: true,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        festivalName: settings.festivalName || '',
        committeeName: settings.committeeName || '',
        festivalYear: settings.festivalYear || 2026,
        festivalDates: settings.festivalDates || '',
        logoUrl: settings.logoUrl || '',
        ganeshaImageUrl: settings.ganeshaImageUrl || '',
        contactInfo: settings.contactInfo || '',
        paymentNumber: settings.paymentNumber || '',
        accountName: settings.accountName || '',
        publicCollectionVisibility: settings.publicCollectionVisibility !== undefined ? settings.publicCollectionVisibility : true,
        registrationSettings: settings.registrationSettings !== undefined ? settings.registrationSettings : true,
        announcementSettings: settings.announcementSettings !== undefined ? settings.announcementSettings : true,
      });
      setLoading(false);
    }
  }, [settings]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--primary)' }}>Loading configuration...</div>;
  }

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>⚙️ Global Festival Settings</h1>
          <p style={{ color: 'var(--text-muted)' }}>Super Admin control panel to configure festival details, calendar dates, branding images, and public visibility.</p>
        </div>
      </div>

      <div className="grid-3">
        {/* Left Column: Form Settings (Span 2) */}
        <div className="span-2">
          <form onSubmit={handleSubmit} className="card card-festive-border">
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
                  placeholder="E.g. Sept 4 - Sept 14, 2026"
                  value={form.festivalDates}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="logoUrl">Committee Logo Image</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ flexGrow: 1 }}>
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
              <label htmlFor="ganeshaImageUrl">Lord Ganesha Main painting / Welcome Banner Image</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ flexGrow: 1 }}>
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

            <div className="form-group">
              <label htmlFor="contactInfo">Contact Numbers & Info</label>
              <input
                type="text"
                id="contactInfo"
                name="contactInfo"
                className="form-control"
                placeholder="E.g. +91 98450 12345, info@festival.org"
                value={form.contactInfo}
                onChange={handleInputChange}
              />
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
                <label htmlFor="paymentNumber">Donation Payment/UPI Number</label>
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

            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 102, 0, 0.05)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,102,0,0.1)', margin: '1.5rem 0', fontSize: '0.85rem' }}>
              <Info size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div>
                Updating these settings affects the public homepage, PDF headers, and title banners immediately.
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={16} /> Save Settings
            </button>
          </form>
        </div>

        {/* Right Column: Portal Visibility Configurations (Span 1) */}
        <div>
          <div className="card">
            <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Globe size={18} /> Public Portal Controls
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Enable or disable public visibility toggles. Edits save inside the main configuration form.
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
