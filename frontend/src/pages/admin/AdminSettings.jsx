import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { settingsApi } from '../../api/client';
import { useSettings } from '../../context/SettingsContext';

const AdminSettings = () => {
  const { settings, updateSettingsState, refreshSettings } = useSettings();
  const [formData, setFormData] = useState({ ...settings });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await settingsApi.update(formData);
      if (res.data && res.data.success) {
        updateSettingsState(res.data.data);
        setStatusMsg({
          type: 'success',
          text: 'Website settings updated successfully! All public pages are now synchronized with your new information.',
        });
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update settings.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl sm:text-3xl font-cinematic font-bold text-white tracking-wide">
          Studio Brand & Website Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
          Modify contact details, phone numbers, copy headlines, and social links. Any change updates the live website instantly without touching code.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-start space-x-3 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/70 border border-emerald-500 text-emerald-200'
              : 'bg-rose-950/70 border border-rose-500 text-rose-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Business Identity & Contact Info */}
        <div className="p-6 sm:p-8 rounded-3xl bg-brand-card/90 border border-slate-800 space-y-5 shadow-xl">
          <h3 className="text-lg font-cinematic font-bold text-white border-b border-slate-800 pb-3">
            Core Business & Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-2">
                Business Name *
              </label>
              <input
                type="text"
                name="businessName"
                required
                value={formData.businessName || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-2">
                Brand Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-2">
                Primary Phone Number *
              </label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: 9608782890</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-2">
                Notification & Contact Email *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: sk61398sny@gmail.com</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-2">
                WhatsApp Number
              </label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-2">
                Studio Physical Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Social Links */}
        <div className="p-6 sm:p-8 rounded-3xl bg-brand-card/90 border border-slate-800 space-y-5 shadow-xl">
          <h3 className="text-lg font-cinematic font-bold text-white border-b border-slate-800 pb-3">
            Social Media Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-2">
                Instagram URL
              </label>
              <input
                type="url"
                name="socialLinks.instagram"
                value={formData.socialLinks?.instagram || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-2">
                Facebook URL
              </label>
              <input
                type="url"
                name="socialLinks.facebook"
                value={formData.socialLinks?.facebook || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-2">
                YouTube URL
              </label>
              <input
                type="url"
                name="socialLinks.youtube"
                value={formData.socialLinks?.youtube || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Website Copy & Headlines */}
        <div className="p-6 sm:p-8 rounded-3xl bg-brand-card/90 border border-slate-800 space-y-5 shadow-xl">
          <h3 className="text-lg font-cinematic font-bold text-white border-b border-slate-800 pb-3">
            Website Copy & Content Customization
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-2">
                Hero Heading Text
              </label>
              <input
                type="text"
                name="heroHeading"
                value={formData.heroHeading || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-2">
                Hero Subtitle Text
              </label>
              <input
                type="text"
                name="heroSubtitle"
                value={formData.heroSubtitle || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-2">
                About Section Title
              </label>
              <input
                type="text"
                name="aboutTitle"
                value={formData.aboutTitle || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-2">
                About Studio Story Paragraph
              </label>
              <textarea
                name="aboutText"
                rows="4"
                value={formData.aboutText || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-2">
                Footer Tagline / Text
              </label>
              <textarea
                name="footerText"
                rows="2"
                value={formData.footerText || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Statistics Counter Numbers */}
        <div className="p-6 sm:p-8 rounded-3xl bg-brand-card/90 border border-slate-800 space-y-5 shadow-xl">
          <h3 className="text-lg font-cinematic font-bold text-white border-b border-slate-800 pb-3">
            Milestone Statistics Numbers
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Years Experience</label>
              <input
                type="number"
                name="experienceYears"
                value={formData.experienceYears || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Events Captured</label>
              <input
                type="number"
                name="eventsCount"
                value={formData.eventsCount || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Happy Clients</label>
              <input
                type="number"
                name="happyClientsCount"
                value={formData.happyClientsCount || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Cinematic Films</label>
              <input
                type="number"
                name="cinematicFilmsCount"
                value={formData.cinematicFilmsCount || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end space-x-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-accent via-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs uppercase tracking-widest shadow-glow-red transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Publishing Changes...' : 'Publish Changes to Website'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
