import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, RefreshCw, Upload, Image as ImageIcon, Camera, Trash2, Sparkles } from 'lucide-react';
import { settingsApi, getMediaUrl } from '../../api/client';
import { useSettings } from '../../context/SettingsContext';
import { sanitizePhoneNumber, isValidEmail } from '../../utils/validation';
import { compressImage, formatFileSize } from '../../utils/imageCompressor';

const AdminSettings = () => {
  const { settings, updateSettingsState, refreshSettings } = useSettings();
  const [formData, setFormData] = useState({ ...settings });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const [aboutImageFile, setAboutImageFile] = useState(null);
  const [aboutImagePreview, setAboutImagePreview] = useState('');
  const [aboutImageStats, setAboutImageStats] = useState(null);
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'whatsapp') {
      setFormData((prev) => ({ ...prev, [name]: sanitizePhoneNumber(value) }));
    } else if (name === 'email') {
      setFormData((prev) => ({ ...prev, email: value.trim() }));
    } else if (name.includes('.')) {
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

  const handleAboutFileSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setCompressing(true);
    try {
      const result = await compressImage(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.85 });
      setAboutImageFile(result.file);
      setAboutImagePreview(result.previewUrl);
      setAboutImageStats({
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        reductionPercent: result.reductionPercent,
      });
    } catch (err) {
      setAboutImageFile(file);
      setAboutImagePreview(URL.createObjectURL(file));
    } finally {
      setCompressing(false);
    }
  };

  const handleClearAboutFile = () => {
    setAboutImageFile(null);
    setAboutImagePreview('');
    setAboutImageStats(null);
  };

  const handleResetAboutDefault = () => {
    handleClearAboutFile();
    setFormData((prev) => ({
      ...prev,
      aboutImage: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&q=75&w=1000',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg(null);

    const cleanPhone = sanitizePhoneNumber(formData.phone);
    if (cleanPhone.length !== 10) {
      setStatusMsg({
        type: 'error',
        text: 'Primary Phone Number must be exactly 10 digits (e.g. 9608782890).',
      });
      return;
    }

    if (formData.whatsapp) {
      const cleanWhatsapp = sanitizePhoneNumber(formData.whatsapp);
      if (cleanWhatsapp.length !== 10) {
        setStatusMsg({
          type: 'error',
          text: 'WhatsApp Number must be exactly 10 digits.',
        });
        return;
      }
    }

    if (!isValidEmail(formData.email)) {
      setStatusMsg({
        type: 'error',
        text: 'Please enter a valid notification & contact email address.',
      });
      return;
    }

    setLoading(true);

    try {
      let res;
      if (aboutImageFile) {
        const payload = new FormData();
        payload.append('businessName', formData.businessName || '');
        payload.append('tagline', formData.tagline || '');
        payload.append('phone', cleanPhone);
        payload.append('whatsapp', formData.whatsapp ? sanitizePhoneNumber(formData.whatsapp) : '');
        payload.append('email', formData.email.trim().toLowerCase());
        payload.append('address', formData.address || '');
        payload.append('socialLinks[instagram]', formData.socialLinks?.instagram || '');
        payload.append('socialLinks[facebook]', formData.socialLinks?.facebook || '');
        payload.append('socialLinks[youtube]', formData.socialLinks?.youtube || '');
        payload.append('heroHeading', formData.heroHeading || '');
        payload.append('heroSubtitle', formData.heroSubtitle || '');
        payload.append('aboutTitle', formData.aboutTitle || '');
        payload.append('aboutText', formData.aboutText || '');
        payload.append('experienceYears', formData.experienceYears ?? 8);
        payload.append('eventsCount', formData.eventsCount ?? 650);
        payload.append('happyClientsCount', formData.happyClientsCount ?? 1200);
        payload.append('cinematicFilmsCount', formData.cinematicFilmsCount ?? 250);
        payload.append('footerText', formData.footerText || '');
        payload.append('aboutImage', aboutImageFile);

        res = await settingsApi.update(payload);
      } else {
        const cleanPayload = {
          ...formData,
          phone: cleanPhone,
          whatsapp: formData.whatsapp ? sanitizePhoneNumber(formData.whatsapp) : '',
          email: formData.email.trim().toLowerCase(),
        };
        res = await settingsApi.update(cleanPayload);
      }

      if (res.data && res.data.success) {
        updateSettingsState(res.data.data);
        setFormData({ ...res.data.data });
        handleClearAboutFile();
        setStatusMsg({
          type: 'success',
          text: 'Website settings updated successfully! The About section photo and details are now live.',
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-slate-300 font-semibold uppercase tracking-wider">
                  Primary Phone Number *
                </label>
                <span
                  className={`text-[10px] font-mono font-medium ${
                    formData.phone?.length === 10
                      ? 'text-emerald-400'
                      : formData.phone?.length > 0
                      ? 'text-amber-400'
                      : 'text-slate-500'
                  }`}
                >
                  {formData.phone?.length || 0}/10 digits
                </span>
              </div>
              <input
                type="tel"
                name="phone"
                required
                maxLength={10}
                inputMode="numeric"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="10-digit number (e.g. 9608782890)"
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
                placeholder="studio@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: sk61398sny@gmail.com</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-slate-300 font-semibold uppercase tracking-wider">
                  WhatsApp Number
                </label>
                {formData.whatsapp && (
                  <span
                    className={`text-[10px] font-mono font-medium ${
                      formData.whatsapp.length === 10 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {formData.whatsapp.length}/10 digits
                  </span>
                )}
              </div>
              <input
                type="tel"
                name="whatsapp"
                maxLength={10}
                inputMode="numeric"
                value={formData.whatsapp || ''}
                onChange={handleChange}
                placeholder="10-digit number (e.g. 9608782890)"
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

            {/* About Section Photograph Customizer */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <label className="block text-slate-200 font-bold uppercase tracking-wider text-xs">
                    About Section Visual Photo
                  </label>
                  <p className="text-[11px] text-slate-400 font-light mt-0.5">
                    The showcase photograph displayed beside “{formData.aboutTitle || 'Capturing Timeless Stories'}” on the homepage.
                  </p>
                </div>
                {formData.aboutImage && (
                  <button
                    type="button"
                    onClick={handleResetAboutDefault}
                    className="text-[10px] text-slate-400 hover:text-amber-400 transition-colors uppercase font-bold tracking-wider self-start sm:self-auto"
                  >
                    Reset to Default Image
                  </button>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-5 items-start">
                {/* Photo Preview Frame */}
                <div className="relative w-full md:w-56 h-48 rounded-xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-lg flex-shrink-0 group">
                  <img
                    src={aboutImagePreview || getMediaUrl(formData.aboutImage) || 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&q=75&w=1000'}
                    alt="About section preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-2 left-2 text-[10px] uppercase font-bold tracking-wider text-amber-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                    {aboutImageFile ? 'New Selected Photo' : 'Current Photo'}
                  </span>
                  {aboutImageFile && (
                    <button
                      type="button"
                      onClick={handleClearAboutFile}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-900/80 text-rose-200 hover:bg-rose-800 transition-colors"
                      title="Clear selected file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* File Upload / URL Controls */}
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                      Upload Photo from Device (Instant Cloudinary Storage)
                    </label>
                    <label className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 hover:bg-slate-800/80 hover:border-brand-accent cursor-pointer transition-colors text-slate-300 hover:text-white">
                      <Upload className="w-4 h-4 text-brand-accent" />
                      <span className="text-xs font-semibold">
                        {compressing ? 'Compressing photo...' : aboutImageFile ? 'Change Selected Photo' : 'Select Photo from Computer / Phone'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAboutFileSelect}
                        className="hidden"
                      />
                    </label>
                    {aboutImageStats && (
                      <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                        ✓ Photo compressed: {formatFileSize(aboutImageStats.originalSize)} → {formatFileSize(aboutImageStats.compressedSize)} ({aboutImageStats.reductionPercent}% smaller)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                      Or Direct Image URL
                    </label>
                    <input
                      type="url"
                      name="aboutImage"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.aboutImage || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>
              </div>
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
