/**
 * SMS Notification Service
 * Supports Fast2SMS (India standard) and Twilio (Global)
 * If credentials are not set, it logs formatted SMS preview to the console.
 */

const sendSMS = async ({ to, message }) => {
  const cleanPhone = to.replace(/\D/g, '');

  // 1. Check for Fast2SMS (India)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: message,
          language: 'english',
          flash: 0,
          numbers: cleanPhone.slice(-10), // 10 digit Indian number
        }),
      });
      const data = await response.json();
      console.log(`[Fast2SMS Sent to +91 ${cleanPhone.slice(-10)}]:`, data.message || 'Dispatched');
      return { success: true, provider: 'fast2sms', data };
    } catch (err) {
      console.error('[Fast2SMS Error]:', err.message);
    }
  }

  // 2. Check for Twilio
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const authHeader = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString('base64');

      const params = new URLSearchParams();
      params.append('To', to.startsWith('+') ? to : `+91${cleanPhone.slice(-10)}`);
      params.append('From', process.env.TWILIO_PHONE_NUMBER);
      params.append('Body', message);

      const twilioRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );
      const data = await twilioRes.json();
      console.log(`[Twilio SMS Sent]: SID ${data.sid}`);
      return { success: true, provider: 'twilio', data };
    } catch (err) {
      console.error('[Twilio SMS Error]:', err.message);
    }
  }

  // 3. Fallback preview in console
  console.log('\n================== [SMS DISPATCH PREVIEW] ==================');
  console.log(`📱 To: ${to}`);
  console.log(`💬 Message:\n${message}`);
  console.log('Notice: Configure FAST2SMS_API_KEY or TWILIO credentials in .env for live carrier delivery.');
  console.log('============================================================\n');
  return { success: true, simulated: true };
};

/**
 * Send SMS alert to Admin when new booking arrives
 */
const sendAdminBookingSMS = async (booking) => {
  const adminPhone = process.env.ADMIN_PHONE || '9608782890';
  const text = `📸 NEW BOOKING: [${booking.bookingReference}] from ${booking.customerName} for ${booking.eventType} on ${booking.eventDate}. Slot: ${booking.eventTimeSlot}. Phone: ${booking.customerPhone}. Check Admin Portal to confirm.`;
  return await sendSMS({ to: adminPhone, message: text });
};

/**
 * Send SMS receipt to Customer when booking is submitted
 */
const sendCustomerBookingSMS = async (booking) => {
  const text = `Hello ${booking.customerName}, your photography booking request (${booking.bookingReference}) for ${booking.eventType} on ${booking.eventDate} has been received by Swastik Photography! Our team will call you shortly at ${booking.customerPhone}. Call/WhatsApp: 9608782890.`;
  return await sendSMS({ to: booking.customerPhone, message: text });
};

/**
 * Send SMS update when Admin updates booking status (e.g. Confirmed)
 */
const sendCustomerStatusSMS = async (booking) => {
  let text = '';
  if (booking.status === 'Confirmed') {
    text = `🎉 GREAT NEWS! Your booking [${booking.bookingReference}] for ${booking.eventType} on ${booking.eventDate} has been CONFIRMED by Swastik Photography! Our lead cinematographers are scheduled for your date. Contact: 9608782890.`;
  } else if (booking.status === 'Completed') {
    text = `✨ Thank you for choosing Swastik Photography for your ${booking.eventType}! Your shoot (${booking.bookingReference}) is marked completed. Your high-res edited files & films are in production.`;
  } else {
    text = `Notice regarding your booking [${booking.bookingReference}] with Swastik Photography: Your status has been updated to ${booking.status}. Please call 9608782890 for inquiries.`;
  }
  return await sendSMS({ to: booking.customerPhone, message: text });
};

/**
 * Send Security OTP to customer's mobile number via SMS
 */
const sendOtpSMS = async ({ phone, otp }) => {
  const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
  const message = `Your Swastik Photography security OTP is: ${otp}. Valid for 10 minutes. For your security, do not share this OTP with anyone.`;

  // 1. Fast2SMS dedicated OTP route
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: String(otp),
          numbers: cleanPhone,
        }),
      });
      const data = await response.json();
      if (data && (data.return === true || data.status_code === 200)) {
        console.log(`[Fast2SMS OTP Sent to +91 ${cleanPhone}]:`, data.message || 'Dispatched');
        return { success: true, provider: 'fast2sms', data };
      }

      // If OTP route failed, try quick SMS route
      const fallbackRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: message,
          language: 'english',
          flash: 0,
          numbers: cleanPhone,
        }),
      });
      const fallbackData = await fallbackRes.json();
      if (fallbackData && (fallbackData.return === true || fallbackData.status_code === 200)) {
        console.log(`[Fast2SMS Quick OTP Sent to +91 ${cleanPhone}]:`, fallbackData.message || 'Dispatched');
        return { success: true, provider: 'fast2sms', data: fallbackData };
      }

      console.warn(`[Fast2SMS Gateway Error]:`, data.message || fallbackData.message);
      return { success: false, error: data.message || fallbackData.message || 'Fast2SMS dispatch failed' };
    } catch (err) {
      console.error('[Fast2SMS Network Error]:', err.message);
      return { success: false, error: err.message };
    }
  }

  // 2. Twilio route
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const authHeader = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString('base64');

      const params = new URLSearchParams();
      params.append('To', `+91${cleanPhone}`);
      params.append('From', process.env.TWILIO_PHONE_NUMBER);
      params.append('Body', message);

      const twilioRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );
      const data = await twilioRes.json();
      if (data.sid) {
        console.log(`[Twilio OTP SMS Sent to +91 ${cleanPhone}]: SID ${data.sid}`);
        return { success: true, provider: 'twilio', data };
      }
      return { success: false, error: data.message || 'Twilio dispatch failed' };
    } catch (err) {
      console.error('[Twilio SMS Error]:', err.message);
      return { success: false, error: err.message };
    }
  }

  // 3. Fallback preview
  console.log('\n================== [SMS OTP SECURITY DISPATCH] ==================');
  console.log(`📱 To: +91 ${cleanPhone}`);
  console.log(`🔐 OTP Code: ${otp}`);
  console.log(`💬 Message:\n${message}`);
  console.log('Notice: Configure active FAST2SMS_API_KEY or TWILIO credentials in .env for live carrier delivery.');
  console.log('=================================================================\n');
  return { success: true, simulated: true };
};

module.exports = {
  sendSMS,
  sendOtpSMS,
  sendAdminBookingSMS,
  sendCustomerBookingSMS,
  sendCustomerStatusSMS,
};
