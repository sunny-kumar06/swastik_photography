import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Cake, Gem, User, Film, Camera } from 'lucide-react';

const eventOptions = [
  {
    id: 'Wedding',
    title: 'Wedding Ceremony',
    desc: 'Grand traditional, modern & destination weddings.',
    icon: Heart,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'Pre-Wedding',
    title: 'Pre-Wedding Shoot',
    desc: 'Romantic outdoor cinematic storytelling & scenic concepts.',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'Engagement',
    title: 'Engagement & Roka',
    desc: 'Intimate ring exchanges, blessing rituals & glam portraits.',
    icon: Gem,
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'Birthday',
    title: 'Birthday Gala',
    desc: 'Joyful milestone birthdays, cake smashing & family cheers.',
    icon: Cake,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'Portrait',
    title: 'Portrait / Editorial',
    desc: 'High-fashion, personal branding & studio aesthetics.',
    icon: User,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'Cinematic',
    title: 'Cinematic Film Only',
    desc: '4K cinema production, drone aerials & music video edits.',
    icon: Film,
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600&auto=format&fit=crop',
  },
];

const StepEvent = ({ selectedEvent, onSelect }) => {
  return (
    <div>
      <div className="text-center mb-8">
        <h4 className="text-xl sm:text-2xl font-cinematic font-bold text-white">
          Step 1: Choose Your Celebration
        </h4>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
          Select the type of occasion you want Swastik Photography to document.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {eventOptions.map((event) => {
          const Icon = event.icon;
          const isSelected = selectedEvent === event.id;

          return (
            <motion.div
              key={event.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(event.id)}
              className={`relative rounded-2xl overflow-hidden p-5 cursor-pointer border transition-all duration-300 flex flex-col justify-between h-52 group ${
                isSelected
                  ? 'border-brand-accent bg-brand-card shadow-glow-red ring-2 ring-brand-accent/40'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              {/* Subtle background photo */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                style={{ backgroundImage: `url(${event.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/40" />

              <div className="relative z-10 flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-brand-accent text-white'
                      : 'bg-slate-800 text-slate-300 group-hover:text-amber-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {isSelected && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-accent text-white">
                    Selected
                  </span>
                )}
              </div>

              <div className="relative z-10">
                <h5 className="text-base font-cinematic font-bold text-white group-hover:text-amber-200 transition-colors">
                  {event.title}
                </h5>
                <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed line-clamp-2">
                  {event.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StepEvent;
