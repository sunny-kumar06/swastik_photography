import React from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, Sliders, Film, Clock, HeartHandshake } from 'lucide-react';

const reasons = [
  {
    icon: Award,
    title: 'Professional Experience',
    desc: 'Over 8+ years documenting 650+ high-profile weddings, destination events, and family ceremonies with unflinching consistency.',
  },
  {
    icon: BookOpen,
    title: 'Creative Storytelling',
    desc: 'We don’t just take poses; we capture unscripted glances, tears of happiness, and spontaneous laughter in documentary depth.',
  },
  {
    icon: Sliders,
    title: 'Premium Color Grading',
    desc: 'Bespoke tone curves, natural skin tones, and rich editorial contrast designed to look timeless for generations to come.',
  },
  {
    icon: Film,
    title: 'Cinematic Films',
    desc: 'Hollywood-style cinema cameras, gimbal stabilizers, precision audio, and drone cinematography edited with rhythmic soundtracks.',
  },
  {
    icon: Clock,
    title: 'On-Time Delivery',
    desc: 'Prompt digital teasers and cloud access within days, with complete master photobooks delivered on guaranteed timelines.',
  },
  {
    icon: HeartHandshake,
    title: 'Personalized Service',
    desc: 'Dedicated pre-shoot consultations, timeline planning, and customized direction ensuring you feel completely relaxed.',
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-24 bg-brand-navy/60 border-y border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.3em] inline-block mb-3">
            Why Swastik
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-white">
            The Standard of Visual Excellence
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 font-light">
            Every moment of your special day is irreplaceable. Here is why couples and families place their trust in our vision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="p-8 rounded-2xl bg-brand-card/80 border border-slate-800 hover:border-brand-accent/40 shadow-xl transition-all duration-300 relative group overflow-hidden"
              >
                {/* Top Corner Subtle Glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full blur-2xl group-hover:bg-brand-accent/15 transition-all" />

                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-brand-accent mb-6 group-hover:scale-110 group-hover:bg-brand-accent group-hover:text-white transition-all duration-300 shadow-md">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-cinematic font-bold text-white mb-2 tracking-wide group-hover:text-rose-200 transition-colors">
                  {reason.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
                  {reason.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
