import React, { useState, useEffect } from 'react';
import { useAuth, API_URL, getMediaUrl, isVideoUrl } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Calendar } from 'lucide-react';

const ManageGallery = () => {
  const { user, triggerToast } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    imageUrl: '',
    caption: '',
    eventCategory: 'Other',
    date: new Date().toISOString().substring(0, 10),
    isPublished: true,
  });

  const categories = ['Sthapana', 'Cultural Programs', 'Annadanam', 'Competitions', 'Decorations', 'Nimajjanam', 'Other'];

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/gallery`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      triggerToast('Error loading gallery photos', 'danger');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setUploadMode('url');
    setUploading(false);
    setForm({
      imageUrl: '',
      caption: '',
      eventCategory: 'Other',
      date: new Date().toISOString().substring(0, 10),
      isPublished: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item._id);
    setUploadMode(item.imageUrl && (item.imageUrl.startsWith('/uploads') || item.imageUrl.startsWith('/api/upload')) ? 'file' : 'url');
    setUploading(false);
    setForm({
      imageUrl: item.imageUrl,
      caption: item.caption,
      eventCategory: item.eventCategory,
      date: new Date(item.date).toISOString().substring(0, 10),
      isPublished: item.isPublished,
    });
    setModalOpen(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
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
        imageUrl: data.fileUrl
      }));
      triggerToast('File uploaded successfully!', 'success');
    } catch (error) {
      console.error(error);
      triggerToast(error.message, 'danger');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.imageUrl || !form.caption) {
      triggerToast('Please provide a media URL/file and caption', 'warning');
      return;
    }

    try {
      const token = user.token;
      const url = editingId ? `${API_URL}/gallery/${editingId}` : `${API_URL}/gallery`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Operation failed');
      }

      triggerToast(editingId ? 'Gallery photo updated!' : 'Photo added to gallery!', 'success');
      setModalOpen(false);
      fetchGallery();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this photo from the gallery?')) {
      return;
    }

    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Delete failed');
      }

      triggerToast('Photo deleted from gallery', 'info');
      fetchGallery();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>📸 Photo Gallery Manager</h1>
          <p style={{ color: 'var(--text-muted)' }}>Upload image URLs, write captions, and categorize media folders.</p>
        </div>
        <div>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={16} /> Upload Photo
          </button>
        </div>
      </div>

      {/* Gallery Grid view */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary)' }}>Loading gallery...</div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No photos uploaded yet.</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {items.map((item) => (
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
              <div className="gallery-details" style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.caption}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span className={`badge ${item.isPublished ? 'badge-approved' : 'badge-draft'}`} style={{ fontSize: '0.7rem' }}>
                      {item.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Calendar size={12} />
                      {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleOpenEdit(item)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem' }}>
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="btn btn-danger btn-sm" style={{ padding: '0.2rem 0.4rem' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                {editingId ? '📝 Edit Image Caption' : '📸 Upload Gallery Photo'}
              </h2>
              <button className="btn btn-link" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Image or Video Source *</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${uploadMode === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setUploadMode('url')}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      Link URL
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${uploadMode === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setUploadMode('file')}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      Upload File
                    </button>
                  </div>

                  {uploadMode === 'url' ? (
                    <div>
                      <input
                        type="url"
                        id="imageUrl"
                        name="imageUrl"
                        className="form-control"
                        placeholder="E.g. https://images.unsplash.com/photo-... or video URL"
                        value={form.imageUrl}
                        onChange={handleInputChange}
                        required
                      />
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Provide an absolute web URL of the image/video file.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="form-control"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                      {uploading && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span className="spinner" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          Uploading file to server...
                        </div>
                      )}
                      {form.imageUrl && !uploading && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span>✓ Media set:</span>
                          <span style={{ wordBreak: 'break-all', fontWeight: 600 }}>{form.imageUrl}</span>
                        </div>
                      )}
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Select an image or video file from your device (Max 50MB).
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="caption">Photo Caption / Description *</label>
                  <input
                    type="text"
                    id="caption"
                    name="caption"
                    className="form-control"
                    placeholder="Describe this photo"
                    value={form.caption}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="eventCategory">Album Folder / Category *</label>
                    <select
                      id="eventCategory"
                      name="eventCategory"
                      className="form-control"
                      value={form.eventCategory}
                      onChange={handleInputChange}
                      required
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="date">Date Taken *</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      className="form-control"
                      value={form.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
                  <label htmlFor="isPublished" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', margin: 0 }}>
                    <input
                      type="checkbox"
                      id="isPublished"
                      name="isPublished"
                      checked={form.isPublished}
                      onChange={handleInputChange}
                    />
                    Publish immediately (Devotees see in public gallery album)
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingId ? 'Save Caption' : 'Upload Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGallery;
