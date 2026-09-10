import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, Tag } from 'lucide-react';
import { getMediaUrl } from '../context/AuthContext';

const ImageLightboxModal = ({
  isOpen,
  onClose,
  src,
  caption,
  category,
  date,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev && onPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext && onNext) onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext, hasPrev, hasNext]);

  if (!isOpen || !src) return null;

  const resolvedUrl = getMediaUrl(src);

  return (
    <div
      className="sponsor-modal-overlay"
      style={{
        zIndex: 11000,
        background: 'rgba(10, 5, 0, 0.92)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          background: 'rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          cursor: 'pointer',
          zIndex: 11002,
          transition: 'all 0.2s ease',
        }}
        aria-label="Close preview"
      >
        <X size={22} />
      </button>

      {/* Prev button */}
      {hasPrev && onPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          style={{
            position: 'fixed',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
            zIndex: 11002,
          }}
          aria-label="Previous image"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Next button */}
      {hasNext && onNext && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          style={{
            position: 'fixed',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
            zIndex: 11002,
          }}
          aria-label="Next image"
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Content wrapper */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '92vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <img
          src={resolvedUrl}
          alt={caption || 'Preview'}
          style={{
            maxWidth: '90vw',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.8)',
            border: '2px solid rgba(255, 179, 0, 0.4)',
          }}
        />

        {(caption || category || date) && (
          <div
            style={{
              marginTop: '0.85rem',
              background: 'rgba(20, 10, 5, 0.85)',
              border: '1px solid rgba(255, 179, 0, 0.3)',
              borderRadius: '16px',
              padding: '0.65rem 1.25rem',
              color: 'white',
              textAlign: 'center',
              maxWidth: '650px',
              backdropFilter: 'blur(10px)',
            }}
          >
            {caption && (
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#FFF8E1' }}>
                {caption}
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.35rem', fontSize: '0.8rem', color: '#FFE082' }}>
              {category && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Tag size={13} /> {category}
                </span>
              )}
              {date && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'rgba(255,255,255,0.7)' }}>
                  <Calendar size={13} /> {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLightboxModal;
