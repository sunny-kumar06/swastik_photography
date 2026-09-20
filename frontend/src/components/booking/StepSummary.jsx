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
          Need immediate assistance? Feel free to connect with our team via WhatsApp or email.
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

      <div className="rounded-2xl bg-slate-900/80 border border-slate-700 p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl">
        {/* Ticket Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-800 pb-4 sm:pb-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
              {bookingData.isCustomEvent || bookingData.eventType === 'Custom' ? 'Custom Celebration' : 'Event Classification'}
            </span>
            <h5 className="text-xl font-cinematic font-bold text-white">
              {bookingData.isCustomEvent && bookingData.customEventName
                ? bookingData.customEventName
                : bookingData.eventType}
            </h5>
            {bookingData.isCustomEvent && (
              <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Make An Event (Custom)
              </span>
            )}
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
              Package Investment
            </span>
            <div className="text-xl sm:text-2xl font-cinematic font-extrabold text-emerald-400">
              {bookingData.isCustomEvent || bookingData.packagePrice === 0
                ? 'Pending Quote'
                : formatPrice(bookingData.packagePrice)}
            </div>
            <span className="text-xs text-slate-400 block">
              {bookingData.packageName}
              {bookingData.packagePriceUnit && bookingData.packagePriceUnit !== 'fixed' && !bookingData.isCustomEvent
                ? ` (${bookingData.packagePriceUnit === 'per_day' ? 'Per Day Rate' : 'Hourly Rate'})`
                : ''}
            </span>
          </div>
        </div>

        {/* Custom Event 24h Update / Contact Admin Banner */}
        {(bookingData.isCustomEvent || bookingData.eventType === 'Custom') && (
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="space-y-0.5">
              <span className="font-bold text-white block">Price will be updated in 24 hrs or contact admin</span>
              <p className="text-slate-300 text-[11px]">
                Our lead cinematographer will review your custom event and contact you within 24 hours with exact pricing.
              </p>
            </div>
            <a
              href={`https://wa.me/919608782890?text=Hi%20Swastik%20Photography%2C%20I%20am%20booking%20a%20custom%20event%3A%20${encodeURIComponent(
                bookingData.customEventName || 'Custom Event'
              )}.%20Please%20provide%20a%20pricing%20estimate.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] uppercase tracking-wider whitespace-nowrap self-start sm:self-auto transition-colors"
            >
              WhatsApp Admin
            </a>
          </div>
        )}

        {/* Schedule & Shift Breakdown */}
        <div className="space-y-3">
          {bookingData.isMultiDay && bookingData.eventDates && bookingData.eventDates.length > 0 ? (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-amber-400">
                  Daily Schedule & Shift Breakdown ({bookingData.eventDates.length} Days)
                </span>
                <span className="text-[10px]">Individual Day Shifts</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {bookingData.eventDates.map((d, i) => {
                  const shift = (bookingData.dayShifts || []).find((ds) => ds.date === d)?.timeSlot || bookingData.eventTimeSlot || 'Full Day';
                  return (
                    <div
                      key={d}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold text-[10px]">
                          Day {i + 1}
                        </span>
                        <span className="font-mono text-white font-semibold text-[11px]">{d}</span>
                      </div>
                      <span className="text-amber-400 font-medium text-[11px]">
                        {shift.split(' ')[0]} Shift
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <Calendar className="w-4 h-4 text-brand-accent mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block">Event Date</span>
                  <span className="font-semibold text-white font-mono">{bookingData.eventDate}</span>
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
          )}
        </div>

        {/* Customer & Location */}
        <div className="space-y-3 pt-2">
          <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
            <User className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase text-slate-400 block">Primary Contact</span>
              <span className="text-white font-medium break-words">
                {bookingData.customerName}
                <span className="block text-slate-400 text-xs mt-0.5 sm:inline sm:text-inherit sm:mt-0">
                  {' '}({bookingData.customerEmail})
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase text-slate-400 block">Venue / Destination</span>
              <span className="text-white font-medium break-words">{bookingData.eventLocation}</span>
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
