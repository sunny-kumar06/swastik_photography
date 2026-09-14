import React from 'react';
import { Calendar, Clock, MapPin, User, Mail, Phone, Sparkles, CheckCircle2 } from 'lucide-react';

const StepSummary = ({ bookingData, onConfirm, submitting, confirmedResult }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  // If already confirmed
  if (confirmedResult) {
    return (
      <div className="text-center py-8 max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-gold animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-emerald-400 font-bold block mb-1">
            Status: Reserved
          </span>
          <h4 className="text-2xl sm:text-3xl font-cinematic font-bold text-white">
            Booking Request Submitted Successfully!
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-light leading-relaxed">
            We have logged your reservation. An instant notification has been dispatched to our lead photographer, and our team will call you within 24 hours to finalize details.
          </p>
        </div>

        {/* Reference Code Card */}
        <div className="p-6 rounded-2xl bg-brand-navy border border-amber-500/40 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Your Booking Reference Number
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-400 mt-2 tracking-widest">
            {confirmedResult.bookingReference}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Please quote this reference ID for any queries or changes.
          </p>
        </div>

        <div className="text-xs text-slate-400">
          Need immediate assistance? Reach us at{' '}
          <a href="tel:9608782890" className="text-brand-accent font-bold">
            +91 9608782890
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h4 className="text-xl sm:text-2xl font-cinematic font-bold text-white">
          Step 5: Review & Confirm Booking
        </h4>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
          Verify your reservation specifics before submitting your date hold.
        </p>
      </div>

      <div className="rounded-2xl bg-slate-900/80 border border-slate-700 p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Ticket Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
              Event Classification
            </span>
            <h5 className="text-xl font-cinematic font-bold text-white">
              {bookingData.eventType}
            </h5>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
              Package Investment
            </span>
            <div className="text-xl sm:text-2xl font-cinematic font-extrabold text-emerald-400">
              {formatPrice(bookingData.packagePrice)}
            </div>
            <span className="text-xs text-slate-400">{bookingData.packageName}</span>
          </div>
        </div>

        {/* Schedule & Location Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <Calendar className="w-4 h-4 text-brand-accent mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">Event Date</span>
              <span className="font-semibold text-white">{bookingData.eventDate}</span>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">Time Slot</span>
              <span className="font-semibold text-white">{bookingData.eventTimeSlot}</span>
            </div>
          </div>
        </div>

        {/* Customer & Location */}
        <div className="space-y-3 pt-2">
          <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
            <User className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">Primary Contact</span>
              <span className="text-white font-medium">
                {bookingData.customerName} ({bookingData.customerPhone} • {bookingData.customerEmail})
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">Venue / Destination</span>
              <span className="text-white font-medium">{bookingData.eventLocation}</span>
            </div>
          </div>
        </div>

        {bookingData.additionalMessage && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 italic">
            "{bookingData.additionalMessage}"
          </div>
        )}

        {/* Confirm Button */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-accent via-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs uppercase tracking-widest shadow-glow-red transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{submitting ? 'Submitting Reservation...' : 'Confirm Booking'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepSummary;
