import React, { useState, useEffect } from 'react';
import { useAuth, API_URL, getMediaUrl, isVideoUrl } from '../context/AuthContext';
import { Image as ImageIcon, Calendar, Filter } from 'lucide-react';

const PublicGallery = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'Sthapana', 'Cultural Programs', 'Annadanam', 'Competitions', 'Decorations', 'Nimajjanam', 'Other'];

  useEffect(() => {
    fetch(`${API_URL}/gallery`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setFilteredItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleFilterClick = (cat) => {
    setActiveFilter(cat);
    if (cat === 'All') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter((item) => item.eventCategory === cat));
    }
  };

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>📸 Festival Photo Gallery</h1>
          <p style={{ color: 'var(--text-muted)' }}>Visual memories of prayers, decorations, feasts, and immersion celebrations.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.5rem' }}>
          <Filter size={16} /> Filters:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleFilterClick(cat)}
            className={`btn btn-secondary btn-sm`}
            style={{
              background: activeFilter === cat ? 'var(--grad-festive)' : 'none',
              color: activeFilter === cat ? 'white' : 'var(--text-main)',
              border: activeFilter === cat ? 'none' : '1px solid var(--border-color)',
              fontWeight: 600,
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
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No photos found under the "{activeFilter}" category.</p>
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
