import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { getMediaUrl } from '../../api/client';

const Lightbox = ({ isOpen, photos, currentIndex, onClose, onPrev, onNext }) => {
  const currentPhoto = photos && photos.length > 0 ? photos[currentIndex] : null;

  // Keyboard navigation (Escape, ArrowLeft, ArrowRight)
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    },
    [isOpen, onClose, onPrev, onNext]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !currentPhoto) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md">
        {/* Top bar controls */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-accent/30 text-rose-300 border border-brand-accent/40 flex items-center space-x-1.5">
              <Tag className="w-3 h-3" />
              <span>{currentPhoto.category}</span>
            </span>
            <span className="text-slate-400 text-xs sm:text-sm">
              {currentIndex + 1} / {photos.length}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-slate-900/80 hover:bg-rose-600/80 text-white transition-all border border-slate-700"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Previous Button */}
        {photos.length > 1 && (
          <button
            onClick={onPrev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 hover:border-brand-accent transition-all z-10"
            aria-label="Previous Photo"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Main Image Container */}
        <motion.div
          key={currentPhoto._id || currentPhoto.imageUrl}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-5xl max-h-[82vh] w-full px-2 sm:px-4 flex flex-col items-center justify-center"
        >
          <img
            src={currentPhoto.imageUrl ? (currentPhoto.imageUrl.includes('images.unsplash.com') ? `${currentPhoto.imageUrl}&auto=format&fit=crop&q=82&w=1600` : getMediaUrl(currentPhoto.imageUrl)) : 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600'}
            alt={currentPhoto.title || 'Swastik Photography Showcase'}
            fetchpriority="high"
            decoding="async"
            className="max-h-[62vh] sm:max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl border border-slate-800"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200';
            }}
          />

          {/* Photo Info Caption */}
          <div className="mt-3 sm:mt-4 text-center max-w-xl px-2">
            <h3 className="text-base sm:text-xl font-cinematic font-bold text-white tracking-wide">
              {currentPhoto.title}
            </h3>
            {currentPhoto.description && (
              <p className="text-[11px] sm:text-sm text-slate-400 mt-1 line-clamp-2">
                {currentPhoto.description}
              </p>
            )}
          </div>
        </motion.div>

        {/* Next Button */}
        {photos.length > 1 && (
          <button
            onClick={onNext}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 hover:border-brand-accent transition-all z-10"
            aria-label="Next Photo"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
      </div>
    </AnimatePresence>
  );
};

export default Lightbox;
