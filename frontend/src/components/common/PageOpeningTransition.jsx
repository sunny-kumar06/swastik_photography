import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBrand from './AnimatedBrand';

function PageOpeningTransition() {
  const [showloader, setShowLoader] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setShowLoader(false);
    }, 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {showloader && (
        <motion.div
          key="site-opening-curtain"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[199] bg-brand-dark flex flex-col items-center justify-center pointer-events-none overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#07090e_95%)]" />
          <div className="absolute w-96 h-96 bg-brand-accent/15 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center space-y-4 px-4"
          >
            <AnimatedBrand size="default" showSubtitle={true} subtitleText="CINEMATIC FILMS & PHOTOGRAPHY" />
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-brand-accent to-transparent overflow-hidden rounded-full">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                className="w-full h-full bg-amber-400"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PageOpeningTransition;
