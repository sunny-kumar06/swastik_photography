import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Calendar, Sparkles, ShieldCheck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import AnimatedBrand from './AnimatedBrand';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Gallery', href: '#gallery' },
  { name: 'Services', href: '#services' },
  { name: 'Packages', href: '#packages' },
  { name: 'About', href: '#about' },
  { name: 'Reviews', href: '#reviews' },
  { name: 'Contact', href: '#contact' },
];

const Navbar = ({ onBookNowClick }) => {
  const { settings } = useSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookingTrigger = () => {
    setMobileMenuOpen(false);
    if (onBookNowClick) {
      onBookNowClick();
    } else {
      const bookElem = document.querySelector('#booking');
      if (bookElem) {
        bookElem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'glass-nav py-3.5 shadow-2xl backdrop-blur-md'
            : 'bg-gradient-to-b from-brand-dark/95 via-brand-dark/60 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <AnimatedBrand size="default" showSubtitle={!isScrolled} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-slate-300 hover:text-white relative py-1 transition-colors duration-200 group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand-accent transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop Right Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Quick Call */}
            <a
              href={`tel:${settings.phone}`}
              className="hidden xl:flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors py-2 px-3 rounded-full border border-slate-800 bg-slate-900/50"
            >
              <Phone className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
              <span>{settings.phone}</span>
            </a>

            {/* Book Now Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleBookingTrigger}
              className="relative inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-accent via-rose-600 to-pink-600 text-white text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-glow-red hover:shadow-lg transition-all duration-300"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Your Date</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </motion.button>
          </div>

          {/* Mobile & Tablet Action & Hamburger Button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={handleBookingTrigger}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-accent to-pink-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm"
            >
              <span className="inline sm:hidden">Book</span>
              <span className="hidden sm:inline">Book Date</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Animated Slide-in Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
            />

            {/* Slide-in Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[82%] max-w-sm z-50 bg-brand-navy border-l border-slate-800/80 p-6 flex flex-col justify-between shadow-2xl lg:hidden overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                  <AnimatedBrand size="sm" showSubtitle={false} />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors flex items-center space-x-1 text-xs font-semibold"
                    aria-label="Close menu"
                  >
                    <X className="w-4 h-4" />
                    <span>Close</span>
                  </button>
                </div>

                {/* Nav Links */}
                <div className="flex flex-col space-y-4 mt-8">
                  {navLinks.map((link, idx) => (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * idx }}
                      className="text-base font-medium text-slate-200 hover:text-brand-accent transition-colors flex items-center justify-between py-2 border-b border-slate-800/40"
                    >
                      <span>{link.name}</span>
                      <span className="text-slate-600 text-xs">0{idx + 1}</span>
                    </motion.a>
                  ))}

                  {/* Admin Portal Direct Option */}
                  <Link
                    to="/admin/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-amber-300 hover:text-amber-200 transition-colors flex items-center justify-between py-2 border-b border-slate-800/40"
                  >
                    <span className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-brand-accent" />
                      <span>Admin Portal</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase font-semibold">
                      Login
                    </span>
                  </Link>
                </div>
              </div>

              {/* Drawer Bottom Details */}
              <div className="pt-6 border-t border-slate-800 space-y-4">
                <button
                  onClick={handleBookingTrigger}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-accent to-pink-600 text-white font-bold text-center text-sm uppercase tracking-widest shadow-glow-red flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reserve Date Now</span>
                </button>

                <div className="text-center text-xs text-slate-400">
                  Direct Line:{' '}
                  <a href={`tel:${settings.phone}`} className="text-amber-400 font-semibold">
                    {settings.phone}
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
