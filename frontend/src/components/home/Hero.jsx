import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Image as ImageIcon, ChevronDown, Sparkles, Award, Star } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import AnimatedBrand from '../common/AnimatedBrand';

const serviceTags = [
  'Wedding',
  'Pre-Wedding',
  'Birthday',
  'Engagement',
  'Cinematic Films',
  'Portraits',
];

const Hero = ({ onBookNowClick }) => {
  const { settings } = useSettings();

  const handleBookingScroll = () => {
    if (onBookNowClick) {
      onBookNowClick();
    } else {
      const bookElem = document.querySelector('#booking');
      if (bookElem) bookElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGalleryScroll = () => {
    const galleryElem = document.querySelector('#gallery');
    if (galleryElem) galleryElem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Background with Slow Zoom Animation */}
      <motion.div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?q=85&w=2000&auto=format&fit=crop')`,
        }}
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      >
        {/* Dark Cinematic Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-brand-dark/65" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#07090e_90%)]" />
      </motion.div>

      {/* Floating Sparkles & Light Orbs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-brand-accent/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Quality Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] sm:text-xs font-semibold text-amber-300 uppercase tracking-wider sm:tracking-widest mb-6 backdrop-blur-md max-w-full"
        >
          <Award className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="truncate">Award-Winning Wedding & Cinema Studio</span>
          <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
        </motion.div>

        {/* Prominent Animated Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mb-4"
        >
          <AnimatedBrand size="hero" showSubtitle={false} />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-serif italic text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal max-w-3xl leading-tight drop-shadow-lg"
        >
          “{settings.heroHeading || 'Creating Memories That Last Forever'}”
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl font-light tracking-wide leading-relaxed px-2 sm:px-0"
        >
          {settings.heroSubtitle || 'Premium Photography & Cinematic Videography for Signature Celebrations'}
        </motion.p>

        {/* Service Pill Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 mt-6 sm:mt-8 max-w-2xl"
        >
          {serviceTags.map((tag) => (
            <span
              key={tag}
              className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium bg-slate-900/60 border border-slate-700/60 text-slate-300 hover:border-brand-accent hover:text-white transition-colors backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 w-full max-w-md"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBookingScroll}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-brand-accent via-rose-600 to-pink-600 text-white font-semibold text-xs sm:text-sm tracking-widest uppercase shadow-glow-red hover:shadow-2xl flex items-center justify-center space-x-2 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Your Date</span>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGalleryScroll}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm tracking-widest uppercase border border-slate-700 hover:border-slate-500 flex items-center justify-center space-x-2 transition-all backdrop-blur-sm"
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Explore Gallery</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        onClick={handleGalleryScroll}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center cursor-pointer text-slate-400 hover:text-white transition-colors"
      >
        <span className="text-[10px] uppercase tracking-widest mb-1 text-slate-400 font-medium">Scroll</span>
        <ChevronDown className="w-4 h-4 text-brand-accent" />
      </motion.div>
    </section>
  );
};

export default Hero;
