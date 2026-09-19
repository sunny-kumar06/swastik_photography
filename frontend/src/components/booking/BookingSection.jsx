import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ChevronRight, ChevronLeft, Calendar, AlertCircle } from 'lucide-react';
import StepEvent from './StepEvent';
import StepPackage from './StepPackage';
import StepDateTime from './StepDateTime';
import StepCustomer from './StepCustomer';
import StepSummary from './StepSummary';
import { bookingsApi } from '../../api/client';
import { sanitizePhoneNumber, isValidPhoneNumber, isValidEmail } from '../../utils/validation';

const stepLabels = ['Event', 'Package', 'Date & Time', 'Details', 'Confirm'];

const BookingSection = ({ preselectedEvent, preselectedPackage }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedResult, setConfirmedResult] = useState(null);

  const [bookingData, setBookingData] = useState({
    eventType: preselectedEvent || 'Wedding',
    isCustomEvent: preselectedEvent === 'Custom',
    customEventName: '',
    isPhoneVerified: false,
    packageId: preselectedPackage?._id || null,
    packageName: preselectedPackage?.name || 'Wedding Premium',
    packagePrice: preselectedPackage?.price || 25000,
    basePackagePrice: preselectedPackage?.price || 25000,
    isMultiDay: false,
    totalDays: 1,
    eventDates: [],
    dayShifts: [],
    eventDate: '',
    eventTimeSlot: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    eventLocation: '',
    additionalMessage: '',
  });

  const handleNextStep = () => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!bookingData.eventType) {
        setErrorMsg('Please select an event type to continue.');
        return;
      }
      if (bookingData.eventType === 'Custom' && !bookingData.customEventName.trim()) {
        setErrorMsg('Please enter your custom event name to proceed.');
        return;
      }
    }
    if (currentStep === 2 && !bookingData.packageName) {
      setErrorMsg('Please select a package to continue.');
      return;
    }
    if (currentStep === 3) {
      if (bookingData.isMultiDay) {
        if (!bookingData.eventDates || bookingData.eventDates.length < 2) {
          setErrorMsg('Please select at least 2 event dates for your multi-day celebration.');
          return;
        }
      } else {
        if (!bookingData.eventDate) {
          setErrorMsg('Please select an event date to continue.');
          return;
        }
      }
      if (!bookingData.eventTimeSlot && (!bookingData.dayShifts || bookingData.dayShifts.length === 0)) {
        setErrorMsg(
          'Please select an available time slot or shift for your event, or write a query message to admin.'
        );
        return;
      }
    }
    if (currentStep === 4) {
      if (
        !bookingData.customerName ||
        !bookingData.customerPhone ||
        !bookingData.customerEmail ||
        !bookingData.eventLocation
      ) {
        setErrorMsg('Please fill in all mandatory customer & location fields.');
        return;
      }

      const cleanPhone = sanitizePhoneNumber(bookingData.customerPhone);
      if (cleanPhone.length !== 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number (e.g. 9608782890).');
        return;
      }

      if (!isValidEmail(bookingData.customerEmail)) {
        setErrorMsg('Please enter a valid email address (e.g. yourname@example.com).');
        return;
      }

      // MANDATORY OTP VERIFICATION
      if (!bookingData.isPhoneVerified) {
        setErrorMsg('Please verify your mobile number via OTP before proceeding.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    setErrorMsg('');

    try {
      const cleanData = {
        ...bookingData,
        customerPhone: sanitizePhoneNumber(bookingData.customerPhone),
        customerEmail: bookingData.customerEmail.trim().toLowerCase(),
      };
      const res = await bookingsApi.create(cleanData);
      if (res.data && res.data.success) {
        setConfirmedResult(res.data.data);
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#e11d48', '#f59e0b', '#38bdf8', '#ffffff'],
        });
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Something went wrong while confirming your booking. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="booking" className="py-24 bg-brand-dark relative scroll-mt-16">
      {/* Glow */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.3em] inline-block mb-3">
            Seamless Reservation
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-white">
            Book Your Date
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 font-light">
            Reserve your cinematic photography team in 5 effortless steps with instant calendar availability.
          </p>
        </div>

        {/* Stepper Header */}
        {!confirmedResult && (
          <div className="max-w-3xl mx-auto mb-10">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-slate-800 w-full z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-brand-accent to-pink-500 transition-all duration-500 z-0"
                style={{ width: `${((currentStep - 1) / (stepLabels.length - 1)) * 100}%` }}
              />

              {stepLabels.map((label, idx) => {
                const stepNum = idx + 1;
                const isCompleted = currentStep > stepNum;
                const isCurrent = currentStep === stepNum;

                return (
                  <div key={label} className="relative z-10 flex flex-col items-center">
                    <button
                      onClick={() => {
                        if (isCompleted) setCurrentStep(stepNum);
                      }}
                      disabled={!isCompleted && !isCurrent}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isCurrent
                          ? 'bg-brand-accent text-white shadow-glow-red scale-110'
                          : isCompleted
                          ? 'bg-slate-800 text-amber-400 border border-amber-400/50'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {stepNum}
                    </button>
                    <span
                      className={`text-[10px] sm:text-xs font-medium mt-1.5 uppercase tracking-wider hidden sm:block ${
                        isCurrent ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step Container Card */}
        <div className="p-4 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-brand-card/90 border border-slate-800 shadow-2xl backdrop-blur-md">
          {errorMsg && (
            <div className="p-4 rounded-xl mb-6 bg-rose-950/70 border border-rose-500 text-rose-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-fadeIn">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
              {errorMsg.includes('admin') && (
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider whitespace-nowrap self-start sm:self-auto transition-all shadow-sm flex items-center space-x-1"
                >
                  <span>Query Admin</span>
                  <span>→</span>
                </a>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <StepEvent
                  selectedEvent={bookingData.eventType}
                  onSelect={(ev) =>
                    setBookingData((p) => ({
                      ...p,
                      eventType: ev,
                      isCustomEvent: ev === 'Custom',
                      packagePrice: ev === 'Custom' ? 0 : p.packagePrice,
                      packageName: ev === 'Custom' ? 'Custom Bespoke Quotation' : p.packageName,
                    }))
                  }
                  customEventName={bookingData.customEventName}
                  onCustomEventNameChange={(name) =>
                    setBookingData((p) => ({ ...p, customEventName: name }))
                  }
                />
              )}

              {currentStep === 2 && (
                <StepPackage
                  eventType={bookingData.eventType}
                  selectedPackage={{
                    _id: bookingData.packageId,
                    name: bookingData.packageName,
                    price: bookingData.packagePrice,
                  }}
                  onSelect={(pkg) =>
                    setBookingData((p) => ({
                      ...p,
                      packageId: pkg._id,
                      packageName: pkg.name,
                      packagePrice: pkg.price,
                      basePackagePrice: pkg.price,
                    }))
                  }
                />
              )}

              {currentStep === 3 && (
                <StepDateTime
                  eventType={bookingData.eventType}
                  isMultiDay={bookingData.isMultiDay}
                  eventDates={bookingData.eventDates}
                  dayShifts={bookingData.dayShifts}
                  eventDate={bookingData.eventDate}
                  eventTimeSlot={bookingData.eventTimeSlot}
                  onChangeMultiDayMode={(isMulti) => {
                    const basePrice = bookingData.basePackagePrice || bookingData.packagePrice;
                    const days = isMulti ? Math.max(bookingData.eventDates?.length || 3, 2) : 1;
                    setBookingData((p) => ({
                      ...p,
                      isMultiDay: isMulti,
                      totalDays: days,
                      basePackagePrice: basePrice,
                      packagePrice: p.isCustomEvent ? 0 : (isMulti ? basePrice * days : basePrice),
                      eventTimeSlot: isMulti ? 'Multi-Shift Schedule' : p.eventTimeSlot,
                    }));
                  }}
                  onChangeDates={(dates) => {
                    const basePrice = bookingData.basePackagePrice || (bookingData.isMultiDay ? bookingData.packagePrice / (bookingData.totalDays || 1) : bookingData.packagePrice);
                    const days = Math.max(dates.length, 1);
                    setBookingData((p) => ({
                      ...p,
                      eventDates: dates,
                      totalDays: days,
                      basePackagePrice: basePrice,
                      packagePrice: p.isCustomEvent ? 0 : (p.isMultiDay ? basePrice * days : basePrice),
                    }));
                  }}
                  onChangeDayShifts={(shifts) =>
                    setBookingData((p) => ({
                      ...p,
                      dayShifts: shifts,
                      eventTimeSlot: 'Multi-Shift Schedule',
                    }))
                  }
                  onChangeDate={(date) => setBookingData((p) => ({ ...p, eventDate: date }))}
                  onChangeSlot={(slot) => setBookingData((p) => ({ ...p, eventTimeSlot: slot }))}
                />
              )}

              {currentStep === 4 && (
                <StepCustomer
                  customerData={bookingData}
                  onChange={(field, value) =>
                    setBookingData((p) => ({ ...p, [field]: value }))
                  }
                />
              )}

              {currentStep === 5 && (
                <StepSummary
                  bookingData={bookingData}
                  onConfirm={handleConfirmBooking}
                  submitting={submitting}
                  confirmedResult={confirmedResult}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Stepper Navigation Buttons */}
          {!confirmedResult && (
            <div className="flex items-center justify-between pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-slate-800">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center space-x-1.5 sm:space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider border border-slate-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 5 && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center space-x-1.5 sm:space-x-2 px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-xl bg-brand-accent hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-glow-red transition-all"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Reset / New Booking Button after completion */}
          {confirmedResult && (
            <div className="text-center pt-6">
              <button
                onClick={() => {
                  setConfirmedResult(null);
                  setCurrentStep(1);
                  setBookingData({
                    eventType: 'Wedding',
                    isCustomEvent: false,
                    customEventName: '',
                    isPhoneVerified: false,
                    packageId: null,
                    packageName: 'Wedding Premium',
                    packagePrice: 25000,
                    basePackagePrice: 25000,
                    isMultiDay: false,
                    totalDays: 1,
                    eventDates: [],
                    dayShifts: [],
                    eventDate: '',
                    eventTimeSlot: '',
                    customerName: '',
                    customerPhone: '',
                    customerEmail: '',
                    eventLocation: '',
                    additionalMessage: '',
                  });
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider"
              >
                Book Another Event
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
