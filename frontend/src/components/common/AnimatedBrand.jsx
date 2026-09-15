import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBrand = ({
  size = 'default', // 'sm', 'default', 'lg', 'hero'
  showSubtitle = true,
  subtitleText = 'CINEMATIC FILMS & PHOTOGRAPHY',
  onClick,
  className = '',
}) => {
  const brandWord1 = 'SWASTIK';
  const brandWord2 = 'PHOTOGRAPHY';

  // Container motion variant for staggered letters
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.1,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const sizeClasses = {
    sm: 'text-base sm:text-lg tracking-[0.12em] sm:tracking-[0.2em]',
    default: 'text-base sm:text-2xl tracking-[0.12em] sm:tracking-[0.25em]',
    lg: 'text-xl sm:text-4xl tracking-[0.15em] sm:tracking-[0.3em]',
    hero: 'text-2xl sm:text-5xl md:text-7xl tracking-[0.12em] sm:tracking-[0.25em] md:tracking-[0.35em]',
  };

  const subtitleSize = {
    sm: 'text-[8px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.25em]',
    default: 'text-[8px] sm:text-xs tracking-[0.15em] sm:tracking-[0.3em]',
    lg: 'text-[10px] sm:text-sm tracking-[0.18em] sm:tracking-[0.35em]',
    hero: 'text-[9px] sm:text-sm md:text-base tracking-[0.18em] sm:tracking-[0.4em] md:tracking-[0.5em]',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center select-none cursor-pointer group ${className}`}
    >
      <motion.div
        className={`font-cinematic font-extrabold uppercase flex items-center justify-center flex-wrap ${sizeClasses[size]}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Word 1: SWASTIK */}
        <span className="flex items-center text-white drop-shadow-md group-hover:text-amber-100 transition-colors duration-300">
          {brandWord1.split('').map((char, index) => (
            <motion.span
              key={`w1-${index}`}
              variants={letterVariants}
              whileHover={{ y: -2, color: '#fbbf24', transition: { duration: 0.2 } }}
              className="inline-block transition-transform"
            >
              {char}
            </motion.span>
          ))}
        </span>

        {/* Separator Diamond / Shimmer Dot */}
        <motion.span
          variants={letterVariants}
          className="mx-1.5 sm:mx-3 text-brand-accent text-[10px] sm:text-sm inline-block animate-pulse"
        >
          ✦
        </motion.span>

        {/* Word 2: PHOTOGRAPHY */}
        <span className="flex items-center text-rose-400 group-hover:text-brand-accent transition-colors duration-300">
          {brandWord2.split('').map((char, index) => (
            <motion.span
              key={`w2-${index}`}
              variants={letterVariants}
              whileHover={{ y: -2, color: '#f43f5e', transition: { duration: 0.2 } }}
              className="inline-block transition-transform"
            >
              {char}
            </motion.span>
          ))}
        </span>
      </motion.div>

      {/* Cinematic Tagline / Accent Line */}
      {showSubtitle && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '100%' }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col items-center mt-1 sm:mt-1.5 w-full"
        >
          <div className="w-full flex items-center justify-center space-x-2">
            <span className="h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent flex-1" />
            <span className={`font-sans font-medium text-slate-400 uppercase ${subtitleSize[size]}`}>
              {subtitleText}
            </span>
            <span className="h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent flex-1" />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AnimatedBrand;
