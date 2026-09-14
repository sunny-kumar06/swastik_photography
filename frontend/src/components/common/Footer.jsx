import React from 'react';
import { Phone, Mail, MapPin, Instagram, ShieldCheck, Heart } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import AnimatedBrand from './AnimatedBrand';

const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-[#05070b] border-t border-slate-900 pt-16 pb-12 text-slate-400 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-brand-accent/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/60">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="text-left">
              <AnimatedBrand size="default" showSubtitle={true} subtitleText={settings.tagline} />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed pt-2">
              {settings.footerText ||
                'Crafting timeless wedding stories and high-definition cinematic films that immortalize love and happiness.'}
            </p>
            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href={settings.socialLinks?.instagram || 'https://www.instagram.com/swastik__photography__?stkn=MW1iMGR6bDAxbWZudQ=='}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Swastik Photography on Instagram"
                className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-pink-500/50 hover:bg-gradient-to-r hover:from-pink-600/20 hover:to-rose-600/20 transition-all duration-300 group"
              >
                <Instagram className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold tracking-wider font-mono">@swastik__photography__</span>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-cinematic uppercase tracking-widest text-sm font-semibold mb-4 border-b border-brand-accent/30 pb-2 inline-block">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#home" className="hover:text-amber-400 transition-colors">Home</a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-amber-400 transition-colors">Portfolio Gallery</a>
              </li>
              <li>
                <a href="#services" className="hover:text-amber-400 transition-colors">Services Offered</a>
              </li>
              <li>
                <a href="#packages" className="hover:text-amber-400 transition-colors">Pricing & Packages</a>
              </li>
              <li>
                <a href="#booking" className="text-brand-accent hover:text-rose-400 font-medium transition-colors">Book Your Date</a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-amber-400 transition-colors">Client Testimonials</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Services */}
          <div>
            <h4 className="text-white font-cinematic uppercase tracking-widest text-sm font-semibold mb-4 border-b border-brand-accent/30 pb-2 inline-block">
              Specialities
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>Royal Indian Weddings</li>
              <li>Cinematic Pre-Wedding Shoots</li>
              <li>4K Drone Aerial Films</li>
              <li>Engagement & Ring Ceremonies</li>
              <li>Birthday & Anniversary Galas</li>
              <li>Editorial Portrait Sessions</li>
            </ul>
          </div>

          {/* Col 4: Contact & Studio Info */}
          <div>
            <h4 className="text-white font-cinematic uppercase tracking-widest text-sm font-semibold mb-4 border-b border-brand-accent/30 pb-2 inline-block">
              Studio Contact
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-brand-accent mt-1 flex-shrink-0" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">
                  +91 {settings.phone}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                  {settings.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} {settings.businessName}. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-brand-accent fill-brand-accent inline" />
              <span>for timeless memories</span>
            </span>
            <a
              href="/admin/login"
              className="text-slate-400 hover:text-amber-400 flex items-center space-x-1 transition-colors"
              title="Studio Management"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
