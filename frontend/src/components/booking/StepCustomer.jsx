import React from 'react';
import { User, Phone, Mail, MapPin, MessageSquare, Check, AlertCircle } from 'lucide-react';
import { sanitizePhoneNumber, isValidPhoneNumber, isValidEmail } from '../../utils/validation';

const StepCustomer = ({ customerData, onChange }) => {
  const phoneLength = customerData.customerPhone ? customerData.customerPhone.length : 0;
  const isPhoneComplete = phoneLength === 10;
  const isPhoneValid = isPhoneComplete && isValidPhoneNumber(customerData.customerPhone);
  const isEmailValid = customerData.customerEmail ? isValidEmail(customerData.customerEmail) : null;

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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Mobile Number *
              </label>
              <span
                className={`text-[10px] font-mono font-medium ${
                  isPhoneComplete ? 'text-emerald-400' : phoneLength > 0 ? 'text-amber-400' : 'text-slate-500'
                }`}
              >
                {phoneLength}/10 digits
              </span>
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                maxLength={10}
                inputMode="numeric"
                value={customerData.customerPhone}
                onChange={(e) => onChange('customerPhone', sanitizePhoneNumber(e.target.value))}
                placeholder="10-digit number (e.g. 9608782890)"
                className={`w-full pl-11 pr-10 py-3 rounded-xl bg-slate-900 border text-white text-sm focus:outline-none transition-colors font-mono ${
                  phoneLength > 0 && !isPhoneComplete
                    ? 'border-amber-500/70 focus:border-amber-500'
                    : isPhoneComplete
                    ? 'border-emerald-500/70 focus:border-emerald-500'
                    : 'border-slate-700 focus:border-brand-accent'
                }`}
              />
              {isPhoneComplete && (
                <Check className="absolute right-3.5 top-3.5 w-4 h-4 text-emerald-400" />
              )}
            </div>
            {phoneLength > 0 && !isPhoneComplete && (
              <p className="text-[11px] text-amber-400 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>Phone number must be exactly 10 digits.</span>
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Email Address *
              </label>
              {customerData.customerEmail && isEmailValid && (
                <span className="text-[10px] text-emerald-400 flex items-center space-x-0.5">
                  <Check className="w-3 h-3" />
                  <span>Valid Email</span>
                </span>
              )}
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={customerData.customerEmail}
                onChange={(e) => onChange('customerEmail', e.target.value.trim())}
                placeholder="e.g. priya.sharma@example.com"
                className={`w-full pl-11 pr-10 py-3 rounded-xl bg-slate-900 border text-white text-sm focus:outline-none transition-colors ${
                  customerData.customerEmail && !isEmailValid
                    ? 'border-amber-500/70 focus:border-amber-500'
                    : customerData.customerEmail && isEmailValid
                    ? 'border-emerald-500/70 focus:border-emerald-500'
                    : 'border-slate-700 focus:border-brand-accent'
                }`}
              />
              {customerData.customerEmail && isEmailValid && (
                <Check className="absolute right-3.5 top-3.5 w-4 h-4 text-emerald-400" />
              )}
            </div>
            {customerData.customerEmail && !isEmailValid && (
              <p className="text-[11px] text-amber-400 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>Please enter a valid email (e.g. name@domain.com).</span>
              </p>
            )}
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
