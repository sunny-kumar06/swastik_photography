import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, MessageSquare, Check, AlertCircle, ShieldCheck, KeyRound, Clock, Sparkles } from 'lucide-react';
import { sanitizePhoneNumber, isValidPhoneNumber, isValidEmail } from '../../utils/validation';
import { bookingsApi } from '../../api/client';

const StepCustomer = ({ customerData, onChange }) => {
  const phoneLength = customerData.customerPhone ? customerData.customerPhone.length : 0;
  const isPhoneComplete = phoneLength === 10;
  const isEmailValid = customerData.customerEmail ? isValidEmail(customerData.customerEmail) : null;

  // OTP Verification state
  const [otpState, setOtpState] = useState({
    sent: false,
    otp: '',
    loading: false,
    verifying: false,
    error: '',
    successMsg: '',
    demoOtp: '',
    countdown: 0,
  });

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (otpState.countdown > 0) {
      timer = setInterval(() => {
        setOtpState((prev) => ({ ...prev, countdown: prev.countdown - 1 }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpState.countdown]);

  const handleSendOtp = async () => {
    const cleanPhone = sanitizePhoneNumber(customerData.customerPhone);
    if (cleanPhone.length !== 10) {
      setOtpState((prev) => ({
        ...prev,
        error: 'Please enter a valid 10-digit mobile number before requesting an OTP.',
      }));
      return;
    }

    setOtpState((prev) => ({ ...prev, loading: true, error: '', successMsg: '' }));

    try {
      const res = await bookingsApi.sendOtp(cleanPhone);
      if (res.data && res.data.success) {
        setOtpState((prev) => ({
          ...prev,
          sent: true,
          demoOtp: res.data.demoOtp || '',
          successMsg: `OTP has been sent to +91 ${cleanPhone}.`,
          countdown: 60,
          otp: res.data.demoOtp ? String(res.data.demoOtp) : '', // Pre-fill in demo mode for frictionless testing
        }));
      }
    } catch (err) {
      setOtpState((prev) => ({
        ...prev,
        error: err.response?.data?.message || 'Failed to send OTP. Please try again or check connection.',
      }));
    } finally {
      setOtpState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpState.otp || otpState.otp.trim().length !== 6) {
      setOtpState((prev) => ({
        ...prev,
        error: 'Please enter the complete 6-digit verification code.',
      }));
      return;
    }

    setOtpState((prev) => ({ ...prev, verifying: true, error: '' }));

    try {
      const cleanPhone = sanitizePhoneNumber(customerData.customerPhone);
      const res = await bookingsApi.verifyOtp(cleanPhone, otpState.otp.trim());
      if (res.data && res.data.success) {
        onChange('isPhoneVerified', true);
        setOtpState((prev) => ({
          ...prev,
          successMsg: 'Mobile number verified successfully! You can now proceed to confirm booking.',
          error: '',
        }));
      }
    } catch (err) {
      setOtpState((prev) => ({
        ...prev,
        error: err.response?.data?.message || 'Invalid or expired OTP. Please check the code and try again.',
      }));
    } finally {
      setOtpState((prev) => ({ ...prev, verifying: false }));
    }
  };

  const handlePhoneChange = (newVal) => {
    const sanitized = sanitizePhoneNumber(newVal);
    onChange('customerPhone', sanitized);
    if (customerData.isPhoneVerified) {
      onChange('isPhoneVerified', false);
      setOtpState({
        sent: false,
        otp: '',
        loading: false,
        verifying: false,
        error: '',
        successMsg: '',
        demoOtp: '',
        countdown: 0,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h4 className="text-xl sm:text-2xl font-cinematic font-bold text-white">
          Step 4: Customer & Venue Details
        </h4>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
          Verify your mobile number via OTP to authenticate your event reservation.
        </p>
      </div>

      <div className="space-y-5">
        {/* Full Name */}
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

        {/* Mobile Number & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
          {/* Mobile Number Field + OTP Flow */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Mobile Number *
              </label>
              <div className="flex items-center space-x-1">
                {customerData.isPhoneVerified ? (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified ✓</span>
                  </span>
                ) : (
                  <span
                    className={`text-[10px] font-mono font-medium ${
                      isPhoneComplete ? 'text-amber-400' : phoneLength > 0 ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    {phoneLength}/10 digits
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                maxLength={10}
                disabled={customerData.isPhoneVerified}
                inputMode="numeric"
                value={customerData.customerPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="10-digit number (e.g. 9608782890)"
                className={`w-full pl-11 pr-10 py-3 rounded-xl bg-slate-900 border text-white text-sm focus:outline-none transition-colors font-mono ${
                  customerData.isPhoneVerified
                    ? 'border-emerald-500/80 bg-emerald-950/20 text-emerald-200'
                    : phoneLength > 0 && !isPhoneComplete
                    ? 'border-amber-500/70 focus:border-amber-500'
                    : isPhoneComplete
                    ? 'border-amber-400/80 focus:border-amber-400'
                    : 'border-slate-700 focus:border-brand-accent'
                }`}
              />
              {customerData.isPhoneVerified ? (
                <ShieldCheck className="absolute right-3.5 top-3.5 w-4 h-4 text-emerald-400" />
              ) : isPhoneComplete ? (
                <KeyRound className="absolute right-3.5 top-3.5 w-4 h-4 text-amber-400" />
              ) : null}
            </div>

            {/* OTP Status & Trigger */}
            {customerData.isPhoneVerified ? (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 flex items-center space-x-1 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Number verified for booking</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onChange('isPhoneVerified', false);
                    setOtpState({
                      sent: false,
                      otp: '',
                      loading: false,
                      verifying: false,
                      error: '',
                      successMsg: '',
                      demoOtp: '',
                      countdown: 0,
                    });
                  }}
                  className="text-[10px] text-slate-400 hover:text-amber-400 underline font-medium"
                >
                  Change Number
                </button>
              </div>
            ) : (
              <div className="mt-2">
                {isPhoneComplete && !otpState.sent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpState.loading}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 shadow-md disabled:opacity-50"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{otpState.loading ? 'Sending OTP...' : 'Verify Number with OTP *'}</span>
                  </button>
                )}
              </div>
            )}

            {/* OTP Entry Card (when OTP is sent and phone not yet verified) */}
            {otpState.sent && !customerData.isPhoneVerified && (
              <div className="mt-3 p-3.5 rounded-2xl bg-slate-950 border border-amber-500/60 shadow-xl space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Enter 6-Digit OTP</span>
                  </div>
                  {otpState.demoOtp && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                      Code: {otpState.demoOtp}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    inputMode="numeric"
                    value={otpState.otp}
                    onChange={(e) => setOtpState((p) => ({ ...p, otp: e.target.value.replace(/\D/g, '') }))}
                    placeholder="6-digit OTP"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-center tracking-[0.25em] font-bold text-sm focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    disabled={otpState.verifying || otpState.otp.length !== 6}
                    onClick={handleVerifyOtp}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition-colors whitespace-nowrap shadow-md"
                  >
                    {otpState.verifying ? 'Verifying...' : 'Verify'}
                  </button>
                </div>

                {otpState.error && (
                  <div className="text-[11px] text-rose-400 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{otpState.error}</span>
                  </div>
                )}

                {otpState.successMsg && (
                  <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
                    <Check className="w-3 h-3 flex-shrink-0" />
                    <span>{otpState.successMsg}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>
                    {otpState.countdown > 0 ? (
                      <span>Resend in <strong className="text-white font-mono">{otpState.countdown}s</strong></span>
                    ) : (
                      <span>Didn't receive code?</span>
                    )}
                  </span>
                  <button
                    type="button"
                    disabled={otpState.countdown > 0 || otpState.loading}
                    onClick={handleSendOtp}
                    className="text-amber-400 hover:text-amber-300 font-semibold disabled:text-slate-600 transition-colors"
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Email Address */}
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

        {/* Venue Location */}
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

        {/* Special Requests */}
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
