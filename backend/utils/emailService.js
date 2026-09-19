const nodemailer = require('nodemailer');

const getSmtpConfig = () => {
  const user = (process.env.SMTP_USER || 'sk61398sny@gmail.com').trim();
  const rawPass = process.env.SMTP_PASS || 'hcfg wjnm vgtu mxbz';
  const pass = rawPass.replace(/\s+/g, '');
  return { user, pass };
};

const createTransporter = () => {
  const { user, pass } = getSmtpConfig();
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
  });
};

const createFallbackTransporter = () => {
  const { user, pass } = getSmtpConfig();
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
  });
};

/**
 * High-Reliability Central Mail Dispatcher.
 * Automatically tries HTTPS Cloud Relay over port 443 (bypassing Render's SMTP port 587/465 block)
 * and falls back to direct Nodemailer for local and unblocked environments.
 */
const dispatchEmail = async ({ to, subject, html, text }) => {
  const { user } = getSmtpConfig();
  const RELAY_SECRET = process.env.RELAY_SECRET || 'swastik_internal_mail_secret_2026';
  const relayUrl = process.env.MAIL_RELAY_URL || 'https://swastikphotography.in/api/send-email';

  let lastError = null;

  // 1. Try HTTPS Relay (port 443 - works everywhere, guaranteed to bypass cloud SMTP blocks)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const relayRes = await fetch(relayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-relay-secret': RELAY_SECRET,
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        text,
        secret: RELAY_SECRET,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const relayData = await relayRes.json();
    if (relayRes.ok && relayData.success) {
      console.log(`[Email Dispatched via HTTPS Cloud Relay]: To ${to} (ID: ${relayData.messageId})`);
      return { success: true, provider: 'https_relay', messageId: relayData.messageId };
    }
    console.warn(`[HTTPS Cloud Relay returned]:`, relayData.error || relayData.message);
    lastError = relayData.error || relayData.message;
  } catch (relayErr) {
    console.warn(`[HTTPS Cloud Relay unavailable (${relayErr.message}), falling back to direct Nodemailer]`);
    lastError = relayErr.message;
  }

  // 2. Try Direct Nodemailer (service: 'gmail')
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"Swastik Photography" <${user}>`,
      to,
      subject,
      text: text || '',
      html: html || '',
      priority: 'high',
      headers: { 'X-Priority': '1' },
    });
    console.log(`[Email Dispatched via Direct Gmail]: To ${to} (ID: ${info.messageId})`);
    return { success: true, provider: 'direct_gmail', messageId: info.messageId };
  } catch (directErr) {
    console.warn(`[Direct Gmail failed (${directErr.message}), attempting Port 465 SSL]`);
    lastError = directErr.message;
  }

  // 3. Try Port 465 SSL Direct
  try {
    const fallbackTransporter = createFallbackTransporter();
    const info = await fallbackTransporter.sendMail({
      from: `"Swastik Photography" <${user}>`,
      to,
      subject,
      text: text || '',
      html: html || '',
      priority: 'high',
      headers: { 'X-Priority': '1' },
    });
    console.log(`[Email Dispatched via Port 465 SSL]: To ${to} (ID: ${info.messageId})`);
    return { success: true, provider: 'port_465_ssl', messageId: info.messageId };
  } catch (sslErr) {
    console.error(`[CRITICAL: All Email Transports Failed]:`, sslErr.message);
    lastError = sslErr.message;
  }

  return { success: false, error: lastError || 'Email delivery failed' };
};

/**
 * Send email notification to Admin for a new booking
 */
const sendBookingNotification = async (booking) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'sk61398sny@gmail.com';
  const transporter = createTransporter();

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(booking.packagePrice);

  const subject = `📸 NEW BOOKING RECEIVED: [${booking.bookingReference}] - ${booking.customerName}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f3f4f6; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #374151; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #1e1b4b 0%, #31101e 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #e11d48; }
        .brand { font-size: 24px; letter-spacing: 3px; font-weight: 800; color: #ffffff; text-transform: uppercase; margin: 0; }
        .tagline { color: #fda4af; font-size: 13px; letter-spacing: 1px; margin-top: 6px; }
        .badge { display: inline-block; padding: 6px 14px; background-color: #e11d48; color: #ffffff; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 14px; }
        .content { padding: 28px; }
        .field-group { margin-bottom: 14px; display: flex; border-bottom: 1px solid #1f2937; padding-bottom: 10px; }
        .label { width: 140px; color: #9ca3af; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { flex: 1; color: #f9fafb; font-size: 15px; font-weight: 500; }
        .price-tag { color: #34d399; font-weight: 700; font-size: 18px; }
        .message-box { background-color: #1f2937; padding: 16px; border-radius: 8px; border-left: 4px solid #e11d48; margin-top: 18px; }
        .footer { background-color: #090d16; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="brand">SWASTIK PHOTOGRAPHY</h1>
          <div class="tagline">Premium Photography & Cinematic Videography</div>
          <div class="badge">NEW BOOKING RECEIVED</div>
        </div>
        <div class="content">
          <div class="field-group">
            <div class="label">Booking ID</div>
            <div class="value"><strong style="color: #fbbf24;">${booking.bookingReference}</strong></div>
          </div>
          <div class="field-group">
            <div class="label">Customer Name</div>
            <div class="value">${booking.customerName}</div>
          </div>
          <div class="field-group">
            <div class="label">Phone</div>
            <div class="value"><a href="tel:${booking.customerPhone}" style="color: #60a5fa; text-decoration: none;">${booking.customerPhone}</a></div>
          </div>
          <div class="field-group">
            <div class="label">Email</div>
            <div class="value"><a href="mailto:${booking.customerEmail}" style="color: #60a5fa; text-decoration: none;">${booking.customerEmail}</a></div>
          </div>
          <div class="field-group">
            <div class="label">Event Type</div>
            <div class="value">${booking.eventType}${booking.isCustomEvent && booking.customEventName ? ` (${booking.customEventName})` : ''}</div>
          </div>
          ${booking.isCustomEvent ? `
          <div class="field-group" style="background:#451a03; padding:10px; border-radius:8px; border: 1px solid #b45309;">
            <div class="label" style="color:#fbbf24;">⚡ CUSTOM EVENT QUOTE</div>
            <div class="value" style="color:#fef08a;"><strong>${booking.customEventName || 'Custom Celebration'}</strong> — Price will be updated to client within 24 hours.</div>
          </div>` : ''}
          <div class="field-group">
            <div class="label">Package</div>
            <div class="value">${booking.packageName}</div>
          </div>
          <div class="field-group">
            <div class="label">Price</div>
            <div class="value price-tag">${booking.isCustomEvent && booking.packagePrice === 0 ? 'Pending Quote (Update within 24h)' : formattedPrice}</div>
          </div>
          <div class="field-group">
            <div class="label">${booking.isMultiDay ? 'Dates (' + (booking.totalDays || booking.eventDates?.length || 1) + ' Days)' : 'Date'}</div>
            <div class="value">
              ${
                booking.isMultiDay && booking.eventDates && booking.eventDates.length > 0
                  ? booking.eventDates.map((d, i) => `<span style="display:inline-block; margin:2px; padding:2px 8px; background:#1e293b; border-radius:4px; font-weight:bold; color:#fde68a;">Day ${i + 1}: ${d}</span>`).join(' ')
                  : `<strong>${booking.eventDate}</strong>`
              }
            </div>
          </div>
          ${booking.dayShifts && booking.dayShifts.length > 0 ? `
          <div class="field-group">
            <div class="label">Shifts Per Day</div>
            <div class="value">
              ${booking.dayShifts.map((ds, idx) => `<div style="margin:2px 0;"><strong style="color:#fbbf24;">Day ${idx + 1} (${ds.date}):</strong> ${ds.timeSlot}</div>`).join('')}
            </div>
          </div>` : ''}
          <div class="field-group">
            <div class="label">Time Slot</div>
            <div class="value">${booking.eventTimeSlot}</div>
          </div>
          <div class="field-group">
            <div class="label">Location</div>
            <div class="value">${booking.eventLocation}</div>
          </div>
          ${
            booking.additionalMessage
              ? `<div class="message-box">
                  <div style="font-size: 12px; color: #9ca3af; text-transform: uppercase; margin-bottom: 6px;">Customer Notes:</div>
                  <div style="color: #e5e7eb; font-style: italic;">"${booking.additionalMessage}"</div>
                </div>`
              : ''
          }
        </div>
        <div class="footer">
          Swastik Photography Admin Notification System • Confidential
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"Swastik Photography" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject,
        html: htmlContent,
      });
      console.log(`[Email Sent to Admin]: ${adminEmail}, MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('[Nodemailer Admin Error]:', error.message);
      return { success: false, error: error.message };
    }
  } else {
    console.log('\n================== [ADMIN EMAIL DISPATCH PREVIEW] ==================');
    console.log(`To: ${adminEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Booking ID: ${booking.bookingReference}`);
    console.log(`Customer: ${booking.customerName} (${booking.customerPhone}, ${booking.customerEmail})`);
    console.log(`Event: ${booking.eventType} | ${booking.packageName} | ${formattedPrice}`);
    console.log(`Date & Time: ${booking.eventDate} - ${booking.eventTimeSlot}`);
    console.log(`Location: ${booking.eventLocation}`);
    console.log('Notice: Configure SMTP_USER and SMTP_PASS in .env for live inbox delivery.');
    console.log('====================================================================\n');
    return { success: true, simulated: true };
  }
};

/**
 * Send email confirmation receipt to Customer
 */
const sendCustomerBookingConfirmation = async (booking) => {
  const transporter = createTransporter();
  const customerEmail = booking.customerEmail;
  if (!customerEmail) return;

  const subject = `✨ Booking Request Confirmed: [${booking.bookingReference}] - Swastik Photography`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background: #07090e; color: #f8fafc; padding: 24px;">
      <div style="max-width: 550px; margin: 0 auto; background: #111827; border: 1px solid #374151; border-radius: 12px; padding: 24px;">
        <h2 style="color: #f43f5e; margin-top: 0; text-align: center;">SWASTIK PHOTOGRAPHY</h2>
        <p style="text-align: center; color: #cbd5e1; font-size: 14px;">Thank you for reserving your special date with us, <strong>${booking.customerName}</strong>!</p>
        <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Your Booking Reference:</span><br/>
          <strong style="font-size: 22px; color: #fbbf24; letter-spacing: 2px;">${booking.bookingReference}</strong>
        </div>
        <p style="font-size: 13px; color: #cbd5e1;"><strong>Event:</strong> ${booking.eventType} (${booking.packageName})</p>
        <p style="font-size: 13px; color: #cbd5e1;"><strong>${booking.isMultiDay ? 'Celebration Dates (' + (booking.totalDays || 1) + ' Days):' : 'Date:'}</strong> ${
          booking.isMultiDay && booking.eventDates && booking.eventDates.length > 0
            ? booking.eventDates.join(', ')
            : booking.eventDate
        } • ${booking.eventTimeSlot}</p>
        <p style="font-size: 13px; color: #cbd5e1;"><strong>Venue:</strong> ${booking.eventLocation}</p>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #374151; padding-top: 16px;">
          Our lead photographer will contact you at <strong>${booking.customerPhone}</strong> within 24 hours. For urgent questions, call/WhatsApp us at <strong>+91 9608782890</strong>.
        </p>
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Swastik Photography" <${process.env.SMTP_USER}>`,
        to: customerEmail,
        subject,
        html: htmlContent,
      });
      console.log(`[Email Sent to Customer]: ${customerEmail}`);
    } catch (err) {
      console.error('[Nodemailer Customer Confirmation Error]:', err.message);
    }
  } else {
    console.log(`[Customer Confirmation Email Preview]: Sent to ${customerEmail} (Ref: ${booking.bookingReference})`);
  }
};

/**
 * Send email status update to Customer (e.g. Confirmed / Completed)
 */
const sendBookingStatusUpdate = async (booking) => {
  const transporter = createTransporter();
  const customerEmail = booking.customerEmail;
  if (!customerEmail) return;

  const subject = `📢 Status Update: [${booking.bookingReference}] is now ${booking.status.toUpperCase()}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background: #07090e; color: #f8fafc; padding: 24px;">
      <div style="max-width: 550px; margin: 0 auto; background: #111827; border: 1px solid #374151; border-radius: 12px; padding: 24px;">
        <h2 style="color: #f43f5e; margin-top: 0;">SWASTIK PHOTOGRAPHY</h2>
        <p>Dear <strong>${booking.customerName}</strong>,</p>
        <p>The status of your booking <strong>${booking.bookingReference}</strong> for <strong>${booking.eventType}</strong> on <strong>${booking.eventDate}</strong> has been updated to:</p>
        <div style="display: inline-block; padding: 8px 18px; border-radius: 20px; font-weight: bold; font-size: 16px; background: ${booking.status === 'Confirmed' ? '#065f46; color: #6ee7b7' : '#1f2937; color: #fbbf24'}; margin: 12px 0;">
          ${booking.status.toUpperCase()}
        </div>
        ${booking.adminNotes ? `<p style="background: #1e293b; padding: 12px; border-left: 4px solid #f43f5e; border-radius: 4px; font-style: italic;">Studio Note: "${booking.adminNotes}"</p>` : ''}
        <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">Questions? Contact us directly at +91 9608782890 or reply to this email.</p>
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Swastik Photography" <${process.env.SMTP_USER}>`,
        to: customerEmail,
        subject,
        html: htmlContent,
      });
      console.log(`[Status Update Email Sent]: To ${customerEmail}, Status: ${booking.status}`);
    } catch (err) {
      console.error('[Status Email Error]:', err.message);
    }
  } else {
    console.log(`[Status Update Email Preview]: Sent to ${customerEmail}, New Status: ${booking.status}`);
  }
};

/**
 * Send email notification for a new contact message
 */
const sendContactNotification = async (contact) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'sk61398sny@gmail.com';
  const transporter = createTransporter();

  const subject = `📩 NEW CONTACT ENQUIRY: from ${contact.name}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px;">
      <h2 style="color: #f43f5e; border-bottom: 2px solid #f43f5e; padding-bottom: 8px;">New Contact Message Received</h2>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      <p><strong>Phone:</strong> ${contact.phone}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background: #1e293b; padding: 12px; border-left: 4px solid #f43f5e; border-radius: 4px;">
        ${contact.message}
      </blockquote>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Swastik Photography" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject,
        html: htmlContent,
      });
      console.log(`[Email Sent]: Contact enquiry sent to ${adminEmail}`);
    } catch (err) {
      console.error('[Nodemailer Contact Error]:', err.message);
    }
  } else {
    console.log('\n============== [CONTACT ENQUIRY NOTIFICATION] ==============');
    console.log(`To: ${adminEmail}`);
    console.log(`From: ${contact.name} (${contact.phone}, ${contact.email})`);
    console.log(`Message: ${contact.message}`);
    console.log('============================================================\n');
  }
};

/**
 * Send Security OTP to customer's email address
 */
const sendOtpEmail = async ({ email, otp, name }) => {
  const customerEmail = String(email).trim().toLowerCase();
  const customerName = name ? String(name).trim() : 'Valued Customer';
  const { user } = getSmtpConfig();

  const subject = `🔐 ${otp} is your Swastik Photography Verification Code`;

  const textContent = `Hello ${customerName},

Your Swastik Photography verification code is: ${otp}

This security code is valid for 10 minutes.
For your security, do not share this code with anyone.

Swastik Photography
Ranchi & Jamshedpur, Jharkhand
Phone: +91 9608782890
Website: https://swastikphotography.in`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f3f4f6; margin: 0; padding: 24px; }
        .container { max-width: 580px; margin: 0 auto; background-color: #111827; border: 1px solid #374151; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
        .header { background: linear-gradient(135deg, #1e1b4b 0%, #31101e 100%); padding: 36px 24px; text-align: center; border-bottom: 2px solid #e11d48; }
        .brand { font-size: 24px; letter-spacing: 3px; font-weight: 800; color: #ffffff; text-transform: uppercase; margin: 0; }
        .tagline { color: #fda4af; font-size: 13px; letter-spacing: 1px; margin-top: 6px; }
        .content { padding: 32px 28px; text-align: center; }
        .greeting { font-size: 18px; font-weight: 600; color: #f9fafb; margin-bottom: 12px; }
        .instructions { font-size: 14px; color: #9ca3af; line-height: 1.6; margin-bottom: 28px; }
        .otp-box { display: inline-block; background: #1f2937; border: 2px dashed #f59e0b; border-radius: 12px; padding: 18px 36px; margin: 10px 0 24px 0; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #fbbf24; font-family: 'Courier New', Courier, monospace; }
        .validity { font-size: 12px; color: #f59e0b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 6px; }
        .security-note { background: #1e1b4b/40; border: 1px solid #4338ca; border-radius: 8px; padding: 14px; font-size: 12px; color: #a5b4fc; text-align: left; margin-top: 24px; line-height: 1.5; }
        .footer { background-color: #090d16; padding: 22px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #1f2937; }
        .footer a { color: #f59e0b; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="brand">SWASTIK PHOTOGRAPHY</h1>
          <div class="tagline">Premium Photography & Cinematic Videography</div>
        </div>
        <div class="content">
          <div class="greeting">Hello ${customerName},</div>
          <div class="instructions">
            You are verifying your email address to authenticate your upcoming event reservation with Swastik Photography. Use the 6-digit verification code below:
          </div>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="validity">⏱ Valid for 10 minutes</div>
          </div>

          <div class="security-note">
            <strong>🔒 Security Reminder:</strong> Never share this verification code with anyone. Swastik Photography staff will never contact you to ask for this code. If you did not request this, you can safely ignore this email.
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0 0 6px 0;"><strong>Swastik Photography</strong> | Ranchi & Jamshedpur, Jharkhand</p>
          <p style="margin: 0;">Phone: <a href="tel:9608782890">+91 9608782890</a> | Website: <a href="https://swastikphotography.in">swastikphotography.in</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await dispatchEmail({
    to: customerEmail,
    subject,
    text: textContent,
    html: htmlContent,
  });
};

module.exports = {
  dispatchEmail,
  sendBookingNotification,
  sendCustomerBookingConfirmation,
  sendBookingStatusUpdate,
  sendContactNotification,
  sendOtpEmail,
};
