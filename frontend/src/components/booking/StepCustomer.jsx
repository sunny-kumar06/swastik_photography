import React from 'react';
import { User, Phone, Mail, MapPin, MessageSquare } from 'lucide-react';

const StepCustomer = ({ customerData, onChange }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h4 className="text-xl sm:text-2xl font-cinematic font-bold text-white">
          Step 4: Customer & Venue Details
        </h4>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
          Where should we send your booking confirmation and schedule the shoot?
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={customerData.customerName}
              onChange={(e) => onChange('customerName', e.target.value)}
              placeholder="e.g. Priya & Rahul Sharma"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Mobile Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                value={customerData.customerPhone}
                onChange={(e) => onChange('customerPhone', e.target.value)}
                placeholder="e.g. 9608782890"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={customerData.customerEmail}
                onChange={(e) => onChange('customerEmail', e.target.value)}
                placeholder="e.g. priya.sharma@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Event Venue / City Location *
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={customerData.eventLocation}
              onChange={(e) => onChange('eventLocation', e.target.value)}
              placeholder="e.g. Taj Resort, Ranchi / Patna / Destination Venue"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Special Requests / Vision Notes
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <textarea
              rows="3"
              value={customerData.additionalMessage}
              onChange={(e) => onChange('additionalMessage', e.target.value)}
              placeholder="Any specific aesthetic, song preferences for the film, or guest count..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors resize-none"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepCustomer;
