import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Film, Users, Award, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import OptimizedImage from '../common/OptimizedImage';

const AboutSection = () => {
  const { settings } = useSettings();

  const stats = [
    {
      label: 'Years of Artistry',
      value: `${settings.experienceYears || 8}+`,
      icon: Award,
      color: 'text-amber-400',
    },
    {
      label: 'Signature Events',
      value: `${settings.eventsCount || 650}+`,
      icon: Camera,
      color: 'text-rose-400',
    },
    {
      label: 'Delighted Couples',
      value: `${settings.happyClientsCount || 1200}+`,
      icon: Users,
      color: 'text-sky-400',
    },
    {
      label: 'Cinematic Films',
      value: `${settings.cinematicFilmsCount || 250}+`,
      icon: Film,
      color: 'text-emerald-400',
    },
  ];

  return (
    <section id="about" className="py-24 bg-brand-dark relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Visual Story / Images */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Portrait Frame */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl z-10 group h-[450px] sm:h-[500px]">
                <OptimizedImage
                  src={settings.aboutImage || 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&q=75&w=1000'}
                  alt="Swastik Photography Master Behind the Lens"
                  width={1000}
                  quality={75}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  containerClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Behind The Lens</span>
                  <h4 className="text-xl font-cinematic font-bold">Pure Passion for Authentic Emotion</h4>
                </div>
              </div>

              {/* Offset Decorative Card */}
              <div className="absolute -bottom-6 -right-4 sm:-right-6 w-48 p-4 rounded-xl bg-brand-navy border border-slate-700 shadow-2xl z-20 backdrop-blur-md hidden sm:block">
                <div className="flex items-center space-x-2 text-brand-accent mb-1">
                  <Camera className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Gear & Tech</span>
                </div>
                <p className="text-[11px] text-slate-400">Sony FX & Alpha series, G-Master lenses & 4K Cinema Drones.</p>
              </div>

              {/* Decorative Blur */}
              <div className="absolute -top-10 -left-10 w-48 h-48 bg-brand-accent/20 rounded-full blur-3xl -z-10" />
            </div>
          </motion.div>

          {/* Right Column: Narrative & Stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-6"
          >
            <div>
              <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.3em] inline-block mb-2">
                About The Studio
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-white leading-tight">
                {settings.aboutTitle || 'Capturing Timeless Stories With Cinematic Artistry'}
              </h2>
            </div>

            <p className="text-slate-300 leading-relaxed text-sm sm:text-base font-light">
              {settings.aboutText ||
                'At Swastik Photography, we believe every frame tells a unique story. With years of passionate dedication, cutting-edge camera gear, and an editorial eye for raw emotion, we turn fleeting celebrations into timeless cinematic art. From intimate vows to grand weddings, we capture the soul of your most cherished moments.'}
            </p>

            {/* Core Values / Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                'Unobtrusive candid captures',
                'Masterful color science & grading',
                'Cinema-grade prime optics & sound',
                'Heirloom album production',
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-2.5 text-slate-300 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Animated Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center hover:border-slate-700 transition-colors"
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-2xl sm:text-3xl font-bold text-white font-cinematic">
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
