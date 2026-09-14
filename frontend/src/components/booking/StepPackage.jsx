import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, AlertCircle } from 'lucide-react';
import { packagesApi } from '../../api/client';

const StepPackage = ({ eventType, selectedPackage, onSelect }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await packagesApi.getAll();
        if (res.data && res.data.data) {
          // If packages exist for selected eventType, match or provide all
          const allPkgs = res.data.data;
          const matching = allPkgs.filter(
            (p) => p.category.toLowerCase() === eventType.toLowerCase()
          );
          setPackages(matching.length > 0 ? matching : allPkgs);
        }
      } catch (err) {
        console.error('[Booking packages fetch error]:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, [eventType]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h4 className="text-xl sm:text-2xl font-cinematic font-bold text-white">
          Step 2: Choose Your Package
        </h4>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
          Showing premium curated collections available for <span className="text-brand-accent font-semibold">{eventType}</span>.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
          <AlertCircle className="w-10 h-10 mx-auto text-amber-400 mb-3" />
          <p>No specific packages found for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {packages.map((pkg) => {
            const isSelected = selectedPackage?._id === pkg._id || selectedPackage?.name === pkg.name;

            return (
              <motion.div
                key={pkg._id || pkg.name}
                whileHover={{ y: -4 }}
                onClick={() => onSelect(pkg)}
                className={`rounded-2xl p-6 cursor-pointer border transition-all duration-300 flex flex-col justify-between relative ${
                  isSelected
                    ? 'border-brand-accent bg-brand-card shadow-glow-red ring-2 ring-brand-accent'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-brand-accent to-pink-600 text-white text-[10px] font-bold uppercase tracking-widest flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Popular</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h5 className="text-xl font-cinematic font-bold text-white">
                      {pkg.name}
                    </h5>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="my-5 pb-5 border-b border-slate-800">
                    <span className="text-2xl sm:text-3xl font-bold text-white font-cinematic">
                      {formatPrice(pkg.price)}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Estimated Studio Investment</span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2 mb-6">
                    {pkg.features?.slice(0, 5).map((feat, i) => (
                      <div key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-center transition-all ${
                    isSelected
                      ? 'bg-brand-accent text-white shadow-glow-red'
                      : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                  }`}
                >
                  {isSelected ? 'Selected Package' : 'Choose This Package'}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StepPackage;
