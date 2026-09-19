import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Send, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { contactApi } from '../../api/client';
import { sanitizePhoneNumber, isValidEmail } from '../../utils/validation';

const ContactSection = () => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData({ ...formData, phone: sanitizePhoneNumber(value) });
    } else if (name === 'email') {
      setFormData({ ...formData, email: value.trim() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    const cleanPhone = sanitizePhoneNumber(formData.phone);
    if (cleanPhone.length !== 10) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid 10-digit mobile number (e.g. 9608782890).',
      });
      return;
    }

    if (!isValidEmail(formData.email)) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid email address (e.g. yourname@example.com).',
      });
      return;
    }

    setLoading(true);

    try {
      const res = await contactApi.submit({
        ...formData,
        phone: cleanPhone,
        email: formData.email.trim().toLowerCase(),
      });
      if (res.data && res.data.success) {
        setStatus({
          type: 'success',
          title: 'Enquiry Sent Directly to Admin',
          message:
            'Your enquiry has been delivered directly to the Swastik Photography Admin! We have logged your details. Our team will review your message and contact you within 24 hours via Phone or WhatsApp.',
        });
        setFormData({ name: '', email: '', phone: '', message: '' });
      }
    } catch (err) {
      const raw = err.response?.data?.message || err.message || '';
      const isTechnical = /BSONError|Cast to|ObjectId|validation failed|Mongoose|MongoError|SyntaxError|Unhandled/i.test(raw);
      setStatus({
        type: 'error',
        title: 'Unable to Send Message',
        message: isTechnical || !raw ? 'Failed to send message. Please try calling us directly at +91 9608782890.' : raw,
      });
    } finally {
      setLoading(false);
    }
  };

  const cleanWhatsappNumber = (settings.whatsapp || settings.phone || '9608782890').replace(/\D/g, '');

  return (
    <section id="contact" className="py-24 bg-brand-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.3em] inline-block mb-3">
            Get In Touch
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-white">
            Let's Plan Your Visual Legacy
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 font-light">
            Have questions or unique dates in mind? Send an inquiry or reach us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Contact Details & WhatsApp Button */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-8 rounded-3xl bg-brand-card/80 border border-slate-800 shadow-xl space-y-6">
              <h3 className="text-xl font-cinematic font-bold text-white tracking-wide border-b border-slate-800 pb-4">
                Studio Contact Details
              </h3>

              <div className="space-y-5">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-brand-accent flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Phone / Mobile</span>
                    <a href={`tel:${settings.phone}`} className="text-base font-bold text-white hover:text-amber-400 transition-colors">
                      +91 {settings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-rose-400 flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Email Inquiries</span>
                    <a href={`mailto:${settings.email}`} className="text-base font-bold text-white hover:text-amber-400 transition-colors">
                      {settings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Main Studio</span>
                    <p className="text-sm font-medium text-slate-200">
                      {settings.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Callout Button */}
              <div className="pt-4 border-t border-slate-800">
                <a
                  href={`https://wa.me/91${cleanWhatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat With Us on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-brand-card/90 border border-slate-800 shadow-2xl">
              <h3 className="text-2xl font-cinematic font-bold text-white mb-2">
                Send Us A Direct Message
              </h3>
              <p className="text-xs text-slate-400 mb-8 font-light">
                Fill in your event details and our lead cinematographer will respond within 24 hours.
              </p>

              {status && (
                <div
                  className={`p-4 sm:p-5 rounded-2xl mb-6 space-y-2 border text-sm ${
                    status.type === 'success'
                      ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                      : 'bg-rose-950/70 border-rose-500 text-rose-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {status.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                    )}
                    <span className="font-bold text-base text-white">
                      {status.title || (status.type === 'success' ? 'Enquiry Delivered to Admin' : 'Notification')}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-200 pl-7">
                    {status.message}
                  </p>
                  {status.type === 'success' && (
                    <div className="pt-2 pl-7 flex items-center space-x-2 text-xs text-amber-300">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider">
                        Admin Notified
                      </span>
                      <span>Response guaranteed within 24 hours</span>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Verma"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Phone Number *
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
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit number (e.g. 9608782890)"
                      className={`w-full px-4 py-3 rounded-xl bg-slate-900 border text-white text-sm focus:outline-none transition-colors font-mono ${
                        formData.phone?.length > 0 && formData.phone?.length < 10
                          ? 'border-amber-500/70 focus:border-amber-500'
                          : formData.phone?.length === 10
                          ? 'border-emerald-500/70 focus:border-emerald-500'
                          : 'border-slate-800 focus:border-brand-accent'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Message / Event Details *
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your event date, city, expectations..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-accent via-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs uppercase tracking-widest shadow-glow-red transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending Message...' : 'Send Inquiry'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
