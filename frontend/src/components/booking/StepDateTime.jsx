import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
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
    desc: 'Ideal for sangeet, reception, birthdays & twilight dinners.',
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
  const [checking, setChecking] = useState(false);

  // Minimum date: today (prevent past dates)
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (eventDate) {
      const checkAvailability = async () => {
        setChecking(true);
        try {
          const res = await bookingsApi.checkAvailability(eventDate);
          if (res.data && res.data.unavailableSlots) {
            setUnavailableSlots(res.data.unavailableSlots);
            // If current selected slot is booked, reset it
            if (res.data.unavailableSlots.includes(eventTimeSlot)) {
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
    }
  }, [eventDate]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h4 className="text-xl sm:text-2xl font-cinematic font-bold text-white">
          Step 3: Select Date & Time Slot
        </h4>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
          Lock in your preferred date. Our slot checker ensures you never face double bookings.
        </p>
      </div>

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
              className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-base focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all cursor-pointer"
            />
          </div>

          {eventDate && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                Selected: <strong className="text-white">{eventDate}</strong>
              </span>
            </div>
          )}

          <div className="text-[11px] text-slate-400 leading-relaxed">
            💡 Tip: Peak wedding dates between November and February book out months in advance. Early reservation is recommended.
          </div>
        </div>

        {/* Time Slot Selection */}
        <div className="md:col-span-7 space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Preferred Time Slot *
          </label>

          {!eventDate ? (
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-400">
              Please select a calendar date first to view real-time slot availability.
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
                        <Clock className={`w-4 h-4 ${isSelected ? 'text-brand-accent' : 'text-slate-400'}`} />
                        <div>
                          <h6 className="text-sm font-semibold text-white">{slot.label}</h6>
                          <span className="text-xs text-amber-400/90 font-medium">{slot.hours}</span>
                        </div>
                      </div>

                      <div>
                        {isBooked ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950 text-rose-300 border border-rose-800">
                            Booked
                          </span>
                        ) : isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-brand-accent" />
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-semibold uppercase">
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
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500 text-xs text-rose-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>This date/time is already booked. Please select another time.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepDateTime;
