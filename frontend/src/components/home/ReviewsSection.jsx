import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, Heart } from 'lucide-react';
import { reviewsApi } from '../../api/client';

const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await reviewsApi.getAll();
        if (res.data && res.data.data) {
          setReviews(res.data.data);
        }
      } catch (err) {
        console.error('[Reviews fetch error]:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Auto rotate carousel every 6s
  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  if (loading || reviews.length === 0) return null;

  const current = reviews[currentIndex];

  return (
    <section id="reviews" className="py-24 bg-brand-navy/50 relative border-t border-slate-900 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.3em] inline-block mb-3">
            Words of Love
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-white">
            Client Testimonials
          </h2>
          <p className="mt-4 text-sm text-slate-400 font-light">
            Real stories and reflections from couples who trusted us with their precious memories.
          </p>
        </div>

        {/* Carousel Card */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current._id || currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="p-8 sm:p-12 rounded-3xl bg-brand-card/90 border border-slate-800 shadow-2xl text-center relative max-w-3xl mx-auto backdrop-blur-md"
            >
              <Quote className="w-12 h-12 text-brand-accent/20 mx-auto mb-6" />

              {/* Star Rating */}
              <div className="flex items-center justify-center space-x-1 mb-6">
                {[...Array(current.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Comment */}
              <p className="text-base sm:text-lg text-slate-200 font-serif italic leading-relaxed mb-8">
                “{current.comment}”
              </p>

              {/* Customer details */}
              <div className="flex flex-col items-center">
                {current.customerPhoto && (
                  <img
                    src={current.customerPhoto}
                    alt={current.customerName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-brand-accent mb-3 shadow-md"
                  />
                )}
                <h4 className="text-base font-cinematic font-bold text-white tracking-wide">
                  {current.customerName}
                </h4>
                <span className="text-xs text-brand-accent font-medium mt-0.5">
                  {current.eventType} {current.eventDate ? `• ${current.eventDate}` : ''}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {reviews.length > 1 && (
            <div className="flex items-center justify-center space-x-4 mt-8">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-full bg-slate-900 border border-slate-800 hover:border-brand-accent text-slate-300 hover:text-white transition-all"
                aria-label="Previous Review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentIndex === i ? 'w-6 bg-brand-accent' : 'w-2 bg-slate-700'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="p-2.5 rounded-full bg-slate-900 border border-slate-800 hover:border-brand-accent text-slate-300 hover:text-white transition-all"
                aria-label="Next Review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
