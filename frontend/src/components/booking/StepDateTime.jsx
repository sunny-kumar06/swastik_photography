import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, Lock, Info } from 'lucide-react';
import { bookingsApi } from '../../api/client';

const timeSlots = [
  {
    id: 'Morning (08:00 AM - 01:00 PM)',
    label: 'Morning Slot',
    hours: '08:00 AM - 01:00 PM',
    desc: 'Perfect for morning rituals, haldi, or daylight portraits.',
  },
  {
    id: 'Evening (04:00 PM - 10:00 PM)',
    label: 'Evening Gala',
    hours: '04:00 PM - 10:00 PM',
    desc: 'Ideal for sangeet, reception, birthdays & twilight celebrations.',
  },
  {
    id: 'Full Day (All Day Coverage)',
    label: 'Full Day Signature',
    hours: 'Full Day Event Coverage',
    desc: 'Complete all-day access for royal weddings and comprehensive celebrations.',
  },
];

const StepDateTime = ({ eventDate, eventTimeSlot, onChangeDate, onChangeSlot }) => {
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [isFullyBooked, setIsFullyBooked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [bookedDatesList, setBookedDatesList] = useState([]);
  const [showBookedDatesModal, setShowBookedDatesModal] = useState(false);

  // Minimum date: today (prevent past dates)
  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch upcoming booked dates on mount so client knows upfront
  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const res = await bookingsApi.getBookedDates();
        if (res.data && res.data.bookedDates) {
          setBookedDatesList(res.data.bookedDates);
        }
      } catch (err) {
        console.warn('[Fetch booked dates error]:', err.message);
      }
    };
    fetchBookedDates();
  }, []);

  // Check specific date availability whenever eventDate changes
  useEffect(() => {
    if (eventDate) {
      const checkAvailability = async () => {
        setChecking(true);
        try {
          const res = await bookingsApi.checkAvailability(eventDate);
          if (res.data) {
            const unavail = res.data.unavailableSlots || [];
            const fullyBooked = res.data.isFullyBooked || unavail.length >= timeSlots.length;
            setUnavailableSlots(unavail);
            setIsFullyBooked(fullyBooked);

            // If selected slot is unavailable or date is fully booked, reset slot
            if (fullyBooked || unavail.includes(eventTimeSlot)) {
              onChangeSlot('');
            }
          }
        } catch (err) {
          console.error('[Availability check error]:', err.message);
        } finally {
          setChecking(false);
        }
      };
      checkAvailability();
    } else {
      setUnavailableSlots([]);
      setIsFullyBooked(false);
    }
  }, [eventDate]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-xl sm:text-2xl font-cinematic font-bold text-white">
          Step 3: Select Date & Time Slot
        </h4>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
          Lock in your preferred date. Booked dates and reserved slots are strictly protected to prevent double bookings.
        </p>
      </div>

      {/* Upfront Booked Dates Notice */}
      {bookedDatesList.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>{bookedDatesList.length}</strong> upcoming date{bookedDatesList.length > 1 ? 's are' : ' is'} already booked or reserved by Swastik Photography.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowBookedDatesModal(!showBookedDatesModal)}
            className="text-brand-accent hover:text-rose-400 font-semibold underline self-start sm:self-auto text-[11px]"
          >
            {showBookedDatesModal ? 'Hide Booked Dates' : 'View Booked Dates'}
          </button>
        </div>
      )}

      {/* Dropdown list of already booked dates if user toggles */}
      {showBookedDatesModal && bookedDatesList.length > 0 && (
        <div className="p-4 rounded-2xl bg-brand-navy border border-slate-700/80 space-y-2.5 animate-fadeIn text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
              Reserved & Booked Dates Calendar
            </span>
            <span className="text-[10px] text-slate-500">Synced live with Admin Portal</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
            {bookedDatesList.map((bd) => (
              <div
                key={bd.date}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono font-bold text-white block">{bd.date}</span>
                  <span className="text-[10px] text-slate-400">
                    {bd.isFullyBooked ? 'Full Day Closed' : `${bd.unavailableSlots.length} slot(s) taken`}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    bd.isFullyBooked
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {bd.isFullyBooked ? 'Booked' : 'Partial'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Date Selection Box */}
        <div className="md:col-span-5 space-y-4">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Event Date *
          </label>
          <div className="relative">
            <input
              type="date"
              min={todayStr}
              value={eventDate}
              onChange={(e) => onChangeDate(e.target.value)}
              className={`w-full px-4 py-3.5 rounded-xl bg-slate-900 border text-white text-base focus:outline-none transition-all cursor-pointer font-mono ${
                isFullyBooked
                  ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/40'
                  : 'border-slate-700 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent'
              }`}
            />
          </div>

          {eventDate && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                isFullyBooked
                  ? 'bg-rose-950/70 border-rose-500 text-rose-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className={`w-4 h-4 ${isFullyBooked ? 'text-rose-400' : 'text-amber-400'}`} />
                <span>
                  Date: <strong className="text-white font-mono">{eventDate}</strong>
                </span>
              </div>

              {isFullyBooked ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[9px] uppercase tracking-wider shadow">
                  Already Booked
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold text-[9px] uppercase">
                  Available
                </span>
              )}
            </div>
          )}

          {/* Full Day Booked Warning Alert */}
          {eventDate && isFullyBooked && (
            <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs flex items-start space-x-3 shadow-xl animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <div>
                <h5 className="font-bold text-sm text-white">This Date is Already Booked</h5>
                <p className="mt-1 text-rose-300 leading-relaxed">
                  This date is already booked. Please choose another date, or contact the admin with a query message to get a reply within 24 hours.
                </p>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center space-x-1.5 mt-2.5 px-3.5 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-[11px] uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-sm"
                >
                  <span>Write Query Message to Admin (Reply in 24h)</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          )}

          <div className="text-[11px] text-slate-400 leading-relaxed">
            💡 Tip: Peak wedding dates between November and February book out months in advance. Early reservation is recommended.
          </div>
        </div>

        {/* Time Slot Selection */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Preferred Time Slot *
            </label>
            {checking && (
              <span className="text-[10px] text-amber-400 animate-pulse font-mono">
                Checking availability...
              </span>
            )}
          </div>

          {!eventDate ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-400">
              Please select a calendar date first to view real-time slot availability.
            </div>
          ) : isFullyBooked ? (
            <div className="p-8 rounded-2xl bg-rose-950/30 border border-rose-900/60 text-center space-y-2 text-xs">
              <Lock className="w-8 h-8 mx-auto text-rose-400" />
              <p className="font-bold text-white text-sm">All Slots Are Reserved on This Day</p>
              <p className="text-slate-400 max-w-sm mx-auto">
                Both morning and evening slots have been locked. Please choose a different calendar date to proceed with your booking.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeSlots.map((slot) => {
                const isBooked = unavailableSlots.includes(slot.id);
                const isSelected = eventTimeSlot === slot.id;

                return (
                  <div
                    key={slot.id}
                    onClick={() => {
                      if (!isBooked) onChangeSlot(slot.id);
                    }}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      isBooked
                        ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-900'
                        : isSelected
                        ? 'border-brand-accent bg-brand-card shadow-glow-red cursor-pointer ring-1 ring-brand-accent'
                        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {isBooked ? (
                          <Lock className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Clock className={`w-4 h-4 ${isSelected ? 'text-brand-accent' : 'text-slate-400'}`} />
                        )}
                        <div>
                          <h6 className="text-sm font-semibold text-white">{slot.label}</h6>
                          <span className="text-xs text-amber-400/90 font-medium">{slot.hours}</span>
                        </div>
                      </div>

                      <div>
                        {isBooked ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-950 text-rose-300 border border-rose-800 flex items-center space-x-1">
                            <Lock className="w-3 h-3" />
                            <span>Already Booked</span>
                          </span>
                        ) : isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-brand-accent" />
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60">
                            Available
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 pl-7">{slot.desc}</p>
                  </div>
                );
              })}
            </div>
          )}

          {eventTimeSlot && unavailableSlots.includes(eventTimeSlot) && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500 text-xs text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-md">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>This date is already booked. Please choose another date or write a query message to admin to get a reply within 24 hours.</span>
              </div>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500 text-black font-bold text-[10px] uppercase tracking-wider whitespace-nowrap self-start sm:self-auto hover:bg-amber-400 transition-colors"
              >
                Query Admin ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepDateTime;
