import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, AlertCircle } from 'lucide-react';
import { packagesApi } from '../../api/client';

const defaultFallbackPackages = [
  {
    _id: 'pkg-default-1',
    name: 'Wedding Basic',
    category: 'Wedding',
    price: 15000,
    description: 'Ideal for intimate ceremonies or single-day wedding events.',
    features: [
      '1 Senior Candid Photographer',
      '1 Traditional Videographer',
      'Full Day Event Coverage',
      'Up to 250 Color-Corrected High-Res Photos',
      'HD Highlight Video (5-7 mins)',
      'Standard Photo Book (20 Pages)',
    ],
    isPopular: false,
  },
  {
    _id: 'pkg-default-2',
    name: 'Wedding Premium',
    category: 'Wedding',
    price: 25000,
    description: 'Our most requested signature coverage for grand wedding celebrations.',
    features: [
      '2 Senior Candid Photographers',
      '2 Cinematic Videographers (4K Setup)',
      'Drone Aerial Cinematography included',
      'Pre-Wedding Short Session included',
      '400+ Masterfully Retouched Photos',
      'Cinematic Wedding Teaser + Full Wedding Film',
      'Premium Leatherette Photobook (40 Pages)',
    ],
    isPopular: true,
  },
  {
    _id: 'pkg-default-3',
    name: 'Wedding Luxury',
    category: 'Wedding',
    price: 40000,
    description: 'The pinnacle of bespoke royal photography for multi-day weddings.',
    features: [
      'Master Director + 3 Candid Photographers',
      '3 Cinematic Filmmakers with Gimbal & Prime Rigs',
      'Licensed FPV & 4K Drone Coverage',
      'Full Pre-Wedding Concept Shoot with Teaser',
      'Live Instagram Reels on Wedding Day',
      'Unlimited High-Res Retouched Photographs',
      'Luxury Hardcover Royal Album (60 Pages)',
    ],
    isPopular: false,
  },
  {
    _id: 'pkg-default-4',
    name: 'Pre-Wedding Romantic',
    category: 'Pre-Wedding',
    price: 18000,
    description: 'Capture your love story in exotic scenic locations before tying the knot.',
    features: [
      'Full Day Shoot (2 Scenic Locations)',
      'Up to 3 Outfit Changes',
      'Drone Aerial Shots',
      '50 High-End Magazine Retouched Images',
      'Cinematic 3-Minute Love Story Video',
    ],
    isPopular: false,
  },
  {
    _id: 'pkg-default-5',
    name: 'Birthday & Family Gala',
    category: 'Birthday',
    price: 12000,
    description: 'Full of vibrancy, fun, and natural laughter for your celebration.',
    features: [
      '4 Hours Continuous Coverage',
      'Candid & Group Portraits',
      'Cake Cutting Special Reel',
      '150+ Color-Graded Photos',
    ],
    isPopular: false,
  },
  {
    _id: 'pkg-default-6',
    name: 'Signature Portrait Session',
    category: 'Portrait',
    price: 8000,
    description: 'Editorial portrait session with precision lighting & retouched stills.',
    features: [
      'Studio or Outdoor Location',
      'High-Resolution Retouched Photos',
      'Fast Turnaround Delivery',
    ],
    isPopular: false,
  },
];

const StepPackage = ({ eventType, selectedPackage, onSelect }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventType === 'Custom') {
      const customPkg = {
        _id: 'custom-event-quote',
        name: 'Custom Bespoke Quotation',
        category: 'Custom',
        price: 0,
        description: 'Bespoke event package tailored specifically to your custom dates, shifts, and vision.',
        features: [
          'Dedicated Cinematographers & Photographers',
          'Custom Multi-Day & Multi-Shift Coverage',
          'Cinematic Highlights & High-Resolution Retouching',
          'Personalized Schedule Tailored to Your Ceremonies',
        ],
        isCustom: true,
      };
      setPackages([customPkg]);
      onSelect(customPkg);
      setLoading(false);
      return;
    }

    const fetchPackages = async () => {
      try {
        const res = await packagesApi.getAll();
        const allPkgs = res.data?.data && res.data.data.length > 0 ? res.data.data : defaultFallbackPackages;
        const matching = allPkgs.filter(
          (p) => p.category?.toLowerCase() === (eventType || 'Wedding').toLowerCase()
        );
        const activeList = matching.length > 0 ? matching : allPkgs;
        setPackages(activeList);

        // Auto-sync selectedPackage with fresh price & priceUnit from database
        if (selectedPackage && activeList.length > 0) {
          const currentPkg = activeList.find(
            (p) => (selectedPackage._id && p._id === selectedPackage._id) ||
                   (p.name && selectedPackage.name && p.name.toLowerCase() === selectedPackage.name.toLowerCase())
          );
          if (currentPkg) {
            onSelect(currentPkg);
          }
        }
      } catch (err) {
        console.warn('[Booking packages fetch warning, using defaults]:', err.message);
        const matching = defaultFallbackPackages.filter(
          (p) => p.category.toLowerCase() === (eventType || 'Wedding').toLowerCase()
        );
        const activeList = matching.length > 0 ? matching : defaultFallbackPackages;
        setPackages(activeList);

        if (selectedPackage && activeList.length > 0) {
          const currentPkg = activeList.find(
            (p) => (selectedPackage._id && p._id === selectedPackage._id) ||
                   (p.name && selectedPackage.name && p.name.toLowerCase() === selectedPackage.name.toLowerCase())
          );
          if (currentPkg) {
            onSelect(currentPkg);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, [eventType]);

  const formatPrice = (price) => {
    if (!price || price === 0) {
      return 'Quotation on Request';
    }
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
          {eventType === 'Custom'
            ? 'Custom Event pricing is calculated based on your custom dates & shifts.'
            : <span>Showing premium curated collections available for <span className="text-brand-accent font-semibold">{eventType}</span>.</span>}
        </p>
      </div>

      {eventType === 'Custom' && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/50 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div>
            <span className="font-bold text-sm text-white block">Custom Event Quotation Notice</span>
            <p className="text-amber-300 text-xs mt-0.5">
              The price will be updated within 24 hours after booking submission, or contact admin directly for an immediate estimate.
            </p>
          </div>
          <a
            href="https://wa.me/919608782890?text=Hi%20Swastik%20Photography%2C%20I%20would%20like%20a%20custom%20price%20quotation%20for%20my%20event."
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider whitespace-nowrap self-start sm:self-auto transition-colors flex items-center space-x-1.5 shadow"
          >
            <span>WhatsApp Admin</span>
            <span>→</span>
          </a>
        </div>
      )}

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
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-2xl sm:text-3xl font-bold text-white font-cinematic">
                        {formatPrice(pkg.price)}
                      </span>
                      {pkg.priceUnit && pkg.priceUnit !== 'fixed' && !pkg.isCustom && (
                        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                          {pkg.priceUnit === 'per_day' ? '/ Day' : '/ Hour'}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {pkg.priceUnit === 'per_day'
                        ? 'Daily Studio Investment'
                        : pkg.priceUnit === 'per_hour'
                        ? 'Hourly Studio Investment'
                        : 'Estimated Studio Investment'}
                    </span>
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
