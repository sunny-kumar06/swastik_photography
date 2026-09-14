import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { packagesApi } from '../../api/client';

const categories = ['All', 'Wedding', 'Pre-Wedding', 'Birthday'];

const PackagesSection = ({ onSelectPackageForBooking }) => {
  const [packages, setPackages] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await packagesApi.getAll();
        if (res.data && res.data.data) {
          setPackages(res.data.data);
        }
      } catch (err) {
        console.error('[Packages fetch error]:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filteredPackages =
    activeCategory === 'All'
      ? packages
      : packages.filter((pkg) => pkg.category === activeCategory);

  const handlePackageSelect = (pkg) => {
    if (onSelectPackageForBooking) {
      onSelectPackageForBooking(pkg);
    } else {
      const bookElem = document.querySelector('#booking');
      if (bookElem) bookElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="packages" className="py-24 bg-brand-navy/40 relative border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.3em] inline-block mb-3">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-white">
            Curated Investment Packages
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 font-light">
            Designed to fit every scale of celebration without compromising on cinema-grade quality.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {filteredPackages.map((pkg, index) => (
              <motion.div
                key={pkg._id || pkg.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className={`rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  pkg.isPopular
                    ? 'bg-gradient-to-b from-slate-900 via-brand-card to-slate-950 border-2 border-brand-accent shadow-glow-red'
                    : 'bg-brand-card/70 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Popular Badge */}
                {pkg.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-accent to-pink-600 text-white text-[11px] font-extrabold uppercase tracking-widest flex items-center space-x-1 shadow-md">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                      {pkg.category}
                    </span>
                    {pkg.deliveryDays && (
                      <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>~{pkg.deliveryDays} Days Delivery</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-cinematic font-bold text-white mt-2">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="mt-6 mb-8 pb-6 border-b border-slate-800">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-cinematic">
                      {formatPrice(pkg.price)}
                    </span>
                    <span className="text-xs text-slate-400 block mt-1">all inclusive / customized deliverables</span>
                  </div>

                  {/* Feature list */}
                  <div className="space-y-3 mb-8">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Included In Package:
                    </div>
                    {pkg.features?.map((feat, idx) => (
                      <div key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handlePackageSelect(pkg)}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-2 ${
                    pkg.isPopular
                      ? 'bg-brand-accent hover:bg-rose-700 text-white shadow-glow-red'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  <span>Select & Book Package</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PackagesSection;
