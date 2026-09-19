import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Sparkles, ChevronDown } from 'lucide-react';
import { galleryApi, getMediaUrl } from '../../api/client';
import Lightbox from '../common/Lightbox';
import OptimizedImage from '../common/OptimizedImage';
import { getCachedData, setCachedData } from '../../utils/cache';
import { useAppData } from '../../context/AppDataContext';

const categories = [
  'All',
  'Wedding',
  'Pre-Wedding',
  'Birthday',
  'Engagement',
  'Portrait',
  'Cinematic',
];

const DEFAULT_FALLBACK_PHOTOS = [
  {
    _id: 'default_gal_1',
    title: 'Royal Mandap Vows',
    category: 'Wedding',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=70&w=600',
    description: 'Heartfelt exchange of garlands under twilight glow.',
    isFeatured: true,
  },
  {
    _id: 'default_gal_2',
    title: 'Golden Hour Embrace',
    category: 'Pre-Wedding',
    imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=70&w=600',
    description: 'Bespoke romantic pre-wedding editorial in hills.',
    isFeatured: true,
  },
  {
    _id: 'default_gal_3',
    title: 'Bridal Henna & Elegance',
    category: 'Wedding',
    imageUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=70&w=600',
    description: 'Intricate mehendi patterns on bride before the ceremony.',
    isFeatured: true,
  },
  {
    _id: 'default_gal_4',
    title: 'Ring Ceremony Radiance',
    category: 'Engagement',
    imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=70&w=600',
    description: 'Special celebration as couple exchanges rings.',
    isFeatured: true,
  },
  {
    _id: 'default_gal_5',
    title: 'Joyful Cake Celebration',
    category: 'Birthday',
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=70&w=600',
    description: 'Full of laughter and sweet family memories.',
    isFeatured: true,
  },
  {
    _id: 'default_gal_6',
    title: 'Dramatic Monochrome Silhouette',
    category: 'Cinematic',
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=70&w=600',
    description: 'Artistic play of shadows and editorial cinematic lights.',
    isFeatured: true,
  },
];

const GallerySection = () => {
  let appData;
  try {
    appData = useAppData();
  } catch {
    appData = null;
  }

  const cachedPhotos = getCachedData('gallery_photos', null);
  const initialPhotos = appData?.photos?.length ? appData.photos : (cachedPhotos || DEFAULT_FALLBACK_PHOTOS);

  const [photos, setPhotos] = useState(initialPhotos);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(!initialPhotos || initialPhotos.length === 0);
  const [visibleCount, setVisibleCount] = useState(6);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sync with central AppData when ready
  useEffect(() => {
    if (appData?.photos?.length > 0) {
      setPhotos(appData.photos);
      setLoading(false);
    }
  }, [appData?.photos]);

  // Fallback independent fetch only if standalone
  useEffect(() => {
    if (appData) return;
    let isMounted = true;
    const fetchGallery = async () => {
      try {
        const res = await galleryApi.getAll();
        if (res.data && res.data.data && isMounted) {
          setPhotos(res.data.data);
          setCachedData('gallery_photos', res.data.data);
        }
      } catch (err) {
        console.error('[Gallery fetch error]:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchGallery();
    return () => {
      isMounted = false;
    };
  }, [appData]);

  const filteredPhotos =
    activeCategory === 'All'
      ? photos
      : photos.filter((p) => p.category === activeCategory);

  const displayedPhotos = filteredPhotos.slice(0, visibleCount);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredPhotos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
  };

  const handleViewMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <section id="gallery" className="py-24 bg-brand-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.3em] inline-block mb-3">
            Visual Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-white">
            Cinematic Portfolio
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 font-light">
            A curated showcase of royal emotions, candid vows, and timeless moments frozen forever.
          </p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setVisibleCount(6);
                }}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-brand-accent text-white shadow-glow-red scale-105'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <>
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {displayedPhotos.map((photo, index) => (
                  <motion.div
                    key={`${photo._id}_${photo.imageUrl}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => openLightbox(index)}
                    className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-brand-accent/50 cursor-pointer shadow-xl h-80 sm:h-96"
                  >
                    <OptimizedImage
                      src={photo.imageUrl}
                      alt={photo.title}
                      width={500}
                      quality={70}
                      priority={index < 3}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      containerClassName="w-full h-full"
                    />

                    {/* Dark gradient overlay (always visible on touch mobile, on hover for desktop) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div className="pr-2 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                            {photo.category}
                          </span>
                          <h4 className="text-base sm:text-lg font-cinematic font-bold text-white mt-0.5 sm:mt-1 drop-shadow-md truncate">
                            {photo.title}
                          </h4>
                          {photo.description && (
                            <p className="text-xs text-slate-300 line-clamp-1 mt-0.5 font-light">
                              {photo.description}
                            </p>
                          )}
                        </div>

                        <div className="p-2 sm:p-2.5 rounded-full bg-brand-accent text-white shadow-lg transform sm:translate-y-2 group-hover:translate-y-0 transition-transform flex-shrink-0">
                          <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* View More Button */}
            {visibleCount < filteredPhotos.length && (
              <div className="text-center mt-12">
                <button
                  onClick={handleViewMore}
                  className="inline-flex items-center space-x-2 px-8 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs uppercase tracking-widest font-semibold border border-slate-700 hover:border-brand-accent transition-all duration-300"
                >
                  <span>View More Photos</span>
                  <ChevronDown className="w-4 h-4 text-brand-accent" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Lightbox Modal */}
        <Lightbox
          isOpen={lightboxOpen}
          photos={filteredPhotos}
          currentIndex={currentIndex}
          onClose={() => setLightboxOpen(false)}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      </div>
    </section>
  );
};

export default GallerySection;
