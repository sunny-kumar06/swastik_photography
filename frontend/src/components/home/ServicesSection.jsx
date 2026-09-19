import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { servicesApi, getMediaUrl } from '../../api/client';
import OptimizedImage from '../common/OptimizedImage';
import { getCachedData, setCachedData } from '../../utils/cache';

const DEFAULT_FALLBACK_SERVICES = [
  {
    _id: 'default_srv_1',
    title: 'Wedding Photography',
    description: 'Comprehensive candid and traditional wedding coverage capturing rituals, smiles, tears of joy, and every royal moment.',
    startingPrice: 25000,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=70&w=600&auto=format&fit=crop',
    category: 'Wedding',
    features: ['Candid Photography', 'Traditional Photo & Video', 'Custom Photo Book', 'Online Digital Gallery'],
  },
  {
    _id: 'default_srv_2',
    title: 'Pre-Wedding Shoot',
    description: 'Cinematic romantic outdoor shoots at picturesque locations capturing your love story with editorial flair.',
    startingPrice: 15000,
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=70&w=600&auto=format&fit=crop',
    category: 'Pre-Wedding',
    features: ['Drone Aerial Cinematography', 'Multi-Location Shoot', 'Outfit Change Coverage', 'Romantic Teaser Video'],
  },
  {
    _id: 'default_srv_3',
    title: 'Cinematic Wedding Films',
    description: '4K cinema-grade films with professional color grading, prime lenses, gimbal stabilization, and emotional audio design.',
    startingPrice: 35000,
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=70&w=600&auto=format&fit=crop',
    category: 'Cinematography',
    features: ['4K Ultra HD Master Film', 'Instagram Reels & Teasers', 'Licensed Soundtrack & Foley', 'Raw Footage Hard Drive'],
  },
];

const ServicesSection = ({ onSelectServiceForBooking }) => {
  const cachedServices = getCachedData('services_list', null);
  const [services, setServices] = useState(cachedServices || DEFAULT_FALLBACK_SERVICES);
  const [loading, setLoading] = useState(!cachedServices && !DEFAULT_FALLBACK_SERVICES.length);

  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      try {
        const res = await servicesApi.getAll();
        if (res.data && res.data.data && isMounted) {
          setServices(res.data.data);
          setCachedData('services_list', res.data.data);
        }
      } catch (err) {
        console.error('[Services fetch error]:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchServices();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleServiceBook = (service) => {
    if (onSelectServiceForBooking) {
      onSelectServiceForBooking(service);
    } else {
      const bookElem = document.querySelector('#booking');
      if (bookElem) bookElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-24 bg-brand-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.3em] inline-block mb-3">
            Our Offerings
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-white">
            Signature Services
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 font-light">
            Comprehensive photography & cinema solutions tailored for life’s grandest celebrations.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service._id || service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group rounded-2xl overflow-hidden bg-brand-card/90 border border-slate-800 hover:border-brand-accent/50 shadow-xl transition-all duration-500 flex flex-col justify-between"
              >
                {/* Image Container with Zoom */}
                <div className="relative h-60 sm:h-64 overflow-hidden">
                  <OptimizedImage
                    src={service.image}
                    alt={service.title}
                    width={500}
                    quality={70}
                    priority={index < 3}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-black/60 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                      {service.category || 'Speciality'}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-cinematic font-bold text-white group-hover:text-amber-200 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-2 font-light leading-relaxed line-clamp-3">
                      {service.description}
                    </p>

                    {/* Features checklist */}
                    {service.features && service.features.length > 0 && (
                      <div className="mt-4 space-y-1.5 pt-3 border-t border-slate-800/80">
                        {service.features.slice(0, 3).map((feat, i) => (
                          <div key={i} className="flex items-center space-x-2 text-xs text-slate-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price & Action */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Starting from</span>
                      <span className="text-lg font-bold text-white font-cinematic">
                        {formatPrice(service.startingPrice)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleServiceBook(service)}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-brand-accent text-white text-xs font-bold uppercase tracking-wider transition-colors duration-300 group-hover:shadow-glow-red"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
