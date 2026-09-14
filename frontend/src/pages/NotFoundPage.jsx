import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Home } from 'lucide-react';
import AnimatedBrand from '../components/common/AnimatedBrand';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-center">
      <AnimatedBrand size="default" />
      <div className="mt-12 p-10 rounded-3xl bg-brand-card border border-slate-800 max-w-md w-full shadow-2xl space-y-5">
        <Camera className="w-16 h-16 text-brand-accent mx-auto animate-bounce" />
        <h1 className="text-4xl font-cinematic font-bold text-white">404</h1>
        <h2 className="text-lg font-serif text-slate-300">Page Not Captured In Our Frames</h2>
        <p className="text-xs text-slate-400 font-light">
          The link you followed might be misplaced or the page has moved to our main gallery.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-accent text-white font-bold text-xs uppercase tracking-widest shadow-glow-red hover:bg-rose-700 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return To Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
