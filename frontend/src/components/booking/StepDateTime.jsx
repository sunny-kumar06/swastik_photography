import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, Lock, Info, Plus, Trash2, Sparkles } from 'lucide-react';
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

const StepDateTime = ({
  eventType,
  isMultiDay,
  eventDates = [],
  eventDate,
  eventTimeSlot,
  onChangeMultiDayMode,
  onChangeDates,
  onChangeDate,
  onChangeSlot,
}) => {
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [isFullyBooked, setIsFullyBooked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [bookedDatesList, setBookedDatesList] = useState([]);
  const [showBookedDatesModal, setShowBookedDatesModal] = useState(false);
  const [conflictDates, setConflictDates] = useState([]);

  const todayStr = new Date().toISOString().split('T')[0];

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

  // Check availability for date(s)
  useEffect(() => {
    const datesToCheck = isMultiDay ? eventDates : (eventDate ? [eventDate] : []);

    if (datesToCheck.length > 0) {
      const checkAll = async () => {
        setChecking(true);
        try {
          const conflicts = [];
          let anyFullyBooked = false;
          const unavailSlotsArray = [];

          for (const d of datesToCheck) {
            const res = await bookingsApi.checkAvailability(d);
            if (res.data) {
              const una = res.data.unavailableSlots || [];
              unavailSlotsArray.push(...una);
              if (res.data.isFullyBooked || una.length >= timeSlots.length) {
                anyFullyBooked = true;
                conflicts.push(d);
              } else if (eventTimeSlot && una.includes(eventTimeSlot)) {
                conflicts.push(d);
              }
            }
          }

          setConflictDates(arrayFromSet(conflicts));
          setUnavailableSlots(arrayFromSet(unavailSlotsArray));
          setIsFullyBooked(anyFullyBooked);

          if (anyFullyBooked || (eventTimeSlot && unavailSlotsArray.includes(eventTimeSlot))) {
            onChangeSlot('');
          }
        } catch (err) {
          console.error('[Availability check error]:', err.message);
        } finally {
          setChecking(false);
        }
      };
      checkAll();
    } else {
      setUnavailableSlots([]);
      setIsFullyBooked(false);
      setConflictDates([]);
    }
  }, [isMultiDay, eventDate, JSON.stringify(eventDates)]);

  function arrayFromSet(arr) {
    return Array.from(new Set(arr));
  }

  // Presets for multi-day events (2 Days, 3 Days, 4 Days)
  const applyDaysPreset = (startDate, numDays) => {
    if (!startDate) return;
    const dates = [];
    for (let i = 0; i < numDays; i++) {
      const next = new Date(startDate);
      next.setDate(next.getDate() + i);
      dates.push(next.toISOString().split('T')[0]);
    }
    onChangeDates(dates);
    onChangeDate(dates[0]);
  };

  const handleAddDate = (addedDate) => {
    if (!addedDate) return;
    if (eventDates.includes(addedDate)) return;
    const sorted = [...eventDates, addedDate].sort();
    onChangeDates(sorted);
    if (!sorted[0] || sorted[0] !== eventDate) {
      onChangeDate(sorted[0]);
    }
  };

  const handleRemoveDate = (dateToRemove) => {
    const filtered = eventDates.filter((d) => d !== dateToRemove);
    onChangeDates(filtered);
    onChangeDate(filtered[0] || '');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-xl sm:text-2xl font-cinematic font-bold text-white">
          Step 3: Select Event Schedule & Dates
        </h4>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
          Book a single day or reserve multiple consecutive days for 2, 3, or 4+ day wedding celebrations.
        </p>
      </div>

      {/* Single vs Multi-Day Toggle Widget */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Celebration Duration</span>
          </span>
          <h5 className="text-sm font-bold text-white">
            {isMultiDay ? 'Multi-Day Wedding / Event Coverage' : 'Single-Day Event Coverage'}
          </h5>
          <p className="text-[11px] text-slate-400">
            {isMultiDay ? 'Book 2 to 7 days at once for Haldi, Mehendi, Sangeet, Wedding & Reception' : 'Ideal for single-day weddings, engagements, or birthdays'}
          </p>
        </div>

        <div className="flex items-center rounded-xl bg-slate-950 p border border-slate-800 flex-shrink-0">
          <button
            type="button"
            onClick={() => onChangeMultiDayMode(false)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isMultiDay ? 'bg-brand-accent text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Single Day
          </button>
          <button
            type="button"
            onClick={() => {
              onChangeMultiDayMode(true);
              if (eventDate && (!eventDates || eventDates.length < 2)) {
                applyDaysPreset(eventDate, 3);
              }
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isMultiDay ? 'bg-amber-500 text-black font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Multi-Day Wedding (3t) 
          </button>
        </div>
      </div>

      {/* Upfront Booked Dates Notice */}
      {bookedDatesList.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>{bookedDatesList.length}</strong> upcoming date{bookedDatesList.length > 1 ? 's are' : ' is'} already reserved.
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

      {/*The calendar list of already booked dates */}
      {showBookedDatesModal && bookedDatesList.length > 0 && (
        <div className="p-4 rounded-2xl bg-brand-navy border border-slate-700/80 space-y-2.5 animate-fadeIn text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
              Reserved & Booked Dates Calendar
            </span>
            <span className="text-[10px] text-slate-500">Synced live with Studio</span>
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
          {!isMultiDay ? (
            <>
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
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Select Wedding / Event Dates ({eventDates.length} Days)
                </label>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onChange={() => {}}
                    onClick={() => applyDaysPreset(eventDate || todayStr, n)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                      eventDates.length === n
                        ? 'bg-amber-500 text-black border-amber-500'
                        : 'bg-slate-900 text-slate-300 border-slate-700'
                    }`}
                  >
                    {n} Days
                  </button>
                ))}
              </div>

              {/* Add Another Date Input */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  min={todayStr}
                  id="multi-date-input"
                  defaultValue={todayStr}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.querySelector('#multi-date-input');
                    if (el && el.value) {
                      handleAddDate(el.value);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-brand-accent hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {/* Chips for every date */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {eventDates.map((d, i) => {
                  const hasConflict = conflictDates.includes(d);
                  return (
                    <div
                      key={d}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        hasConflict
                          ? 'bg-rose-950/90 border-rose-500 text-rose-200'
                          : 'bg-slate-900 border-slate-800 text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 font-bold text-[0.65rem]">
                          Day {i + 1}
                        </span>
                        <span className="font-mono font-semibold">{d}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {hasConflict ? (
                          <span className="text-[0.65rem] font-bold uppercase text-rose-400">Booked</span>
                        ) : (
                          <span className="text-[0.65rem] font-bold uppercase text-emerald-400">Free</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveDate(d)}
                          className="p-1 rounded-md bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conflict Alert */}
          {conflictDates.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs flex items-start space-x-3 shadow-xl animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <div>
                <h5 className="font-bold text-sm text-white">Date Conflict Detected</h5>
                <p className="mt-1 text-rose-300 leading-relaxed">
                  This date is already booked: <strong>{conflictDates.join(', ')}</strong>. Please choose another date, or contact the admin with a query message to get a reply within 24 hours.
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

          {(!eventDate && (!eventDates || eventDates.length === 0)) ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-400">
              Please select calendar date(s) first to view real-time slot availability.
            </div>
          ) : isFullyBooked ? (
            <div className="p-8 rounded-2xl bg-rose-950/30 border border-rose-900/60 text-center space-y-2 text-xs">
              <Lock className="w-8 h-8 mx-auto text-rose-400" />
              <p className="font-bold text-white text-sm">One or more selected dates are fully booked</p>
              <p className="text-slate-400 max-w-sm mx-auto">
                Please adjust your date selection or choose alternative dates to continue.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeSlots.map((slot) => {
                const isUnavail = unavailableSlots.includes(slot.id);
                const isSelected = eventTimeSlot === slot.id;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isUnavail}
                    onClick={() => onChangeSlot(slot.id)}
                    className={`w-full p-4 sm:p-4.5 rounded-2xl border text-left transition-all ${
                      isUnavail
                        ? 'bg-slate-950/50 border-slate-900 opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'bg-brand-accent/10 border-brand-accent ring-1 ring-brand-accent/60 shadow-glow-red'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-younded-xl ${
                            isUnavail
                              ? 'bg-slate-800/50 text-slate-600'
                              : isSelected
                              ? 'bg-brand-accent text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-sm font-bold text-white">{slot.label}</h5>
                          <span className="text-[11px] text-slate-400 font-mono">{slot.hours}</span>
                        </div>
                      </div>

                      <div>
                        {isUnavail ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800 font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1">
                            <Lock className="w-3 h-3" />
                            <span>Reserved</span>
                          </span>
                        ) : isSelected ? (
                          <span className="px-2.5 py-1 rounded-full bg-brand-accent text-white font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Selected</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800 font-semibold text-[10px] uppercase tracking-wider">
                            Available
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-2.5 text-[11px] text-slate-400 font-light pl-1">
                      {slot.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepDateTime;
