const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
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
            <div class="value">${booking.eventType}</div>
          </div>
          <div class="field-group">
            <div class="label">Package</div>
            <div class="value">${booking.packageName}</div>
          </div>
          <div class="field-group">
            <div class="label">Price</div>
            <div class="value price-tag">${formattedPrice}</div>
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

module.exports = {
  sendBookingNotification,
  sendCustomerBookingConfirmation,
  sendBookingStatusUpdate,
  sendContactNotification,
};
