import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera } from 'lucide-react';
import AnimatedBrand from './AnimatedBrand';
import { useAppData } from '../../context/AppDataContext';

const PageOpeningTransition = () => {
  const { isInitialDataLoaded, loadingStage } = useAppData();
  const [isDismissed, setIsDismissed] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Track real elapsed time while loading
  useEffect(() => {
    if (isInitialDataLoaded) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isInitialDataLoaded]);

  // Smoothly dismiss when real API/data finishes loading
  useEffect(() => {
    if (isInitialDataLoaded) {
      // Ensure a brief 350ms delay for DOM paints to settle cleanly
      const timer = setTimeout(() => {
        setIsDismissed(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isInitialDataLoaded]);

  // Dynamic context message based on real connection time
  const getDynamicStatus = () => {
    if (isInitialDataLoaded) {
      return 'Portfolio ready. Welcome to Swastik Photography';
    }
    if (elapsedSeconds >= 10) {
      return 'Fetching high-definition visual stories & cinema...';
    }
    if (elapsedSeconds >= 3) {
      return 'Connecting to cinematic studio server...';
    }
    return loadingStage || 'Preparing royal wedding & cinema showcases...';
  };

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          key="cinematic-preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.05,
            filter: 'blur(12px)',
          }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[999] bg-[#07090e] flex flex-col items-center justify-center select-none overflow-hidden"
          style={{ willChange: 'opacity, transform, filter' }}
        >
          {/* Deep dark cinematic gradients and ambient light glows */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#05070a_90%)] pointer-events-none" />
          <div className="absolute top-1/3 w-[500px] h-[500px] bg-brand-accent/15 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
          <div className="absolute bottom-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

          {/* Center Brand & Shutter Animation */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex flex-col items-center px-6 text-center max-w-lg"
          >
            {/* Camera Aperture / Shutter Emblem */}
            <div className="relative mb-8 flex items-center justify-center">
              {/* Outer rotating decorative ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-dashed border-amber-400/30"
              />

              {/* Inner reverse rotating iris ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-rose-500/30 border-t-brand-accent"
              />

              {/* Central Glowing Camera Core */}
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute p-4 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-glow-red flex items-center justify-center backdrop-blur-md"
              >
                <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
              </motion.div>
            </div>

            {/* Brand Monogram */}
            <AnimatedBrand size="default" showSubtitle={true} subtitleText="CINEMATIC FILMS & SIGNATURE STORIES" />

            {/* Dynamic Status Text */}
            <motion.div
              key={getDynamicStatus()}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-6 flex items-center space-x-2 text-xs sm:text-sm text-slate-300 font-light"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow flex-shrink-0" />
              <span className="tracking-wider">{getDynamicStatus()}</span>
            </motion.div>

            {/* Sleek Golden Hairline Progress Bar */}
            <div className="w-48 sm:w-64 h-1 bg-slate-800/80 rounded-full overflow-hidden mt-4 border border-slate-700/40 relative">
              <motion.div
                animate={
                  isInitialDataLoaded
                    ? { width: '100%', transition: { duration: 0.3 } }
                    : {
                        x: ['-100%', '100%'],
                        transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
                      }
                }
                className="w-full h-full bg-gradient-to-r from-amber-400 via-brand-accent to-pink-500 rounded-full shadow-lg"
              />
            </div>

            {/* Failsafe bypass if user is on extremely degraded network */}
            {elapsedSeconds >= 25 && !isInitialDataLoaded && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setIsDismissed(true)}
                className="mt-8 text-[11px] uppercase tracking-widest text-slate-500 hover:text-amber-400 underline underline-offset-4 transition-colors"
              >
                Slow connection detected? Click to explore now
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageOpeningTransition;
