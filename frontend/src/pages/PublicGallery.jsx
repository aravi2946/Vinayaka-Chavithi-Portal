import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth, API_URL, getMediaUrl, isVideoUrl } from '../context/AuthContext';
import { Image as ImageIcon, Calendar, Filter, Film, Layers } from 'lucide-react';

const PublicGallery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'all'; // 'all' | 'photos' | 'videos'

  const [items, setItems] = useState([]);
  const [mediaType, setMediaType] = useState(initialType);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Sthapana', 'Cultural Programs', 'Annadanam', 'Competitions', 'Decorations', 'Nimajjanam', 'Other'];

  useEffect(() => {
    fetch(`${API_URL}/gallery`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const type = searchParams.get('type');
    if (type && ['all', 'photos', 'videos'].includes(type)) {
      setMediaType(type);
    } else if (!type) {
      setMediaType('all');
    }
  }, [searchParams]);

  const handleMediaTypeChange = (type) => {
    setMediaType(type);
    setSearchParams(type === 'all' ? {} : { type });
  };

  const filteredItems = items.filter((item) => {
    // Media type filter
    const isVid = isVideoUrl(item.imageUrl);
    if (mediaType === 'photos' && isVid) return false;
    if (mediaType === 'videos' && !isVid) return false;

    // Category filter
    if (activeCategory !== 'All' && item.eventCategory !== activeCategory) return false;

    return true;
  });

  const photoCount = items.filter((i) => !isVideoUrl(i.imageUrl)).length;
  const videoCount = items.filter((i) => isVideoUrl(i.imageUrl)).length;

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>📸 Festival Gallery</h1>
          <p style={{ color: 'var(--text-muted)' }}>Visual memories of prayers, decorations, feasts, and immersion celebrations.</p>
        </div>
      </div>

      {/* Media Type Tabs: All, Photos, Videos */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => handleMediaTypeChange('all')}
          className="btn btn-sm"
          style={{
            background: mediaType === 'all' ? 'var(--grad-festive)' : 'var(--bg-secondary)',
            color: mediaType === 'all' ? 'white' : 'var(--text-main)',
            border: '1px solid var(--border-color)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Layers size={15} /> All Media ({items.length})
        </button>

        <button
          type="button"
          onClick={() => handleMediaTypeChange('photos')}
          className="btn btn-sm"
          style={{
            background: mediaType === 'photos' ? 'var(--grad-festive)' : 'var(--bg-secondary)',
            color: mediaType === 'photos' ? 'white' : 'var(--text-main)',
            border: '1px solid var(--border-color)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <ImageIcon size={15} /> 📷 Photos ({photoCount})
        </button>

        <button
          type="button"
          onClick={() => handleMediaTypeChange('videos')}
          className="btn btn-sm"
          style={{
            background: mediaType === 'videos' ? 'linear-gradient(135deg, hsl(0, 80%, 45%), hsl(25, 95%, 45%))' : 'var(--bg-secondary)',
            color: mediaType === 'videos' ? 'white' : 'var(--text-main)',
            border: '1px solid var(--border-color)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Film size={15} /> 🎬 Videos & Reels ({videoCount})
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.5rem' }}>
          <Filter size={16} /> Event Category:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`btn btn-secondary btn-sm`}
            style={{
              background: activeCategory === cat ? 'var(--primary)' : 'none',
              color: activeCategory === cat ? 'white' : 'var(--text-main)',
              border: activeCategory === cat ? 'none' : '1px solid var(--border-color)',
              fontWeight: 600,
              fontSize: '0.8rem',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--primary)' }}>Loading gallery items...</div>
      ) : filteredItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <ImageIcon size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No {mediaType === 'all' ? 'media' : mediaType} found under the "{activeCategory}" category.
          </p>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredItems.map((item) => (
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
              <div className="gallery-details" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '80px' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.caption}</p>
                <span className="date" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                  <Calendar size={12} />
                  {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicGallery;
