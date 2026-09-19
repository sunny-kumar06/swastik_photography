const Booking = require('../models/Booking');
const Gallery = require('../models/Gallery');
const Contact = require('../models/Contact');
const {
  sendBookingNotification,
  sendCustomerBookingConfirmation,
  sendBookingStatusUpdate,
} = require('../utils/emailService');
const {
  sendAdminBookingSMS,
  sendCustomerBookingSMS,
  sendCustomerStatusSMS,
  sendOtpSMS,
} = require('../utils/smsService');

// In-memory OTP storage: phone -> { otp, expiresAt, verified, attempts }
const otpStore = new Map();

// Clean up expired OTPs every 5 minutes
const otpCleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(phone);
    }
  }
}, 5 * 60 * 1000);

if (otpCleanupTimer.unref) {
  otpCleanupTimer.unref();
}

// Generate unique human-readable booking reference
const generateBookingRef = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomStr = '';
  for (let i = 0; i < 5; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const year = new Date().getFullYear();
  return `SWK-${year}-${randomStr}`;
};

// @desc    Send OTP to customer mobile number for verification (Public)
// @route   POST /api/bookings/send-otp
// @access  Public
const sendBookingOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Please provide a 10-digit mobile number' });
    }

    const cleanPhone = String(phone).replace(/\D/g, '');
    const finalPhone = cleanPhone.length === 12 && cleanPhone.startsWith('91') ? cleanPhone.slice(2) : cleanPhone;
    if (finalPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be a valid 10-digit mobile number.',
      });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    otpStore.set(finalPhone, {
      otp,
      expiresAt,
      verified: false,
      attempts: 0,
    });

    // Dispatch OTP via SMS to the customer's phone number
    const smsResult = await sendOtpSMS({ phone: finalPhone, otp });

    console.log(`\n🔑 [MOBILE OTP DISPATCH] Phone: +91 ${finalPhone} | Code: ${otp} (Valid 10 mins) | Carrier Sent: ${smsResult.success}\n`);

    res.json({
      success: true,
      message: `OTP has been sent to +91 ${finalPhone} via SMS. Please enter the 6-digit code to verify.`,
      smsDispatched: smsResult.success,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify customer mobile number OTP (Public)
// @route   POST /api/bookings/verify-otp
// @access  Public
const verifyBookingOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const cleanPhone = String(phone).replace(/\D/g, '');
    const finalPhone = cleanPhone.length === 12 && cleanPhone.startsWith('91') ? cleanPhone.slice(2) : cleanPhone;

    const record = otpStore.get(finalPhone);

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'No OTP requested for this phone number or OTP has expired. Please request a new OTP.',
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(finalPhone);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.',
      });
    }

    if (record.attempts >= 5) {
      otpStore.delete(finalPhone);
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.',
      });
    }

    if (record.otp !== String(otp).trim()) {
      record.attempts += 1;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP code. Please check and try again (${5 - record.attempts} attempts remaining).`,
      });
    }

    // Mark as verified
    record.verified = true;
    otpStore.set(finalPhone, record);

    console.log(`✅ [MOBILE OTP VERIFIED] Phone: +91 ${finalPhone} successfully verified.`);

    res.json({
      success: true,
      verified: true,
      message: 'Mobile number verified successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new booking (Public)
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res, next) => {
  try {
    const {
      eventType,
      isCustomEvent = false,
      customEventName = '',
      packageId,
      packageName,
      packagePrice,
      isMultiDay = false,
      totalDays = 1,
      eventDates = [],
      dayShifts = [],
      eventDate,
      eventTimeSlot,
      customerName,
      customerPhone,
      customerEmail,
      eventLocation,
      additionalMessage,
      isPhoneVerified = false,
    } = req.body;

    const effectiveEventName = isCustomEvent ? (customEventName || 'Custom Event') : (packageName || eventType);

    if (
      !eventType ||
      (!packageName && !isCustomEvent) ||
      packagePrice === undefined ||
      !eventDate ||
      (!eventTimeSlot && (!dayShifts || dayShifts.length === 0)) ||
      !customerName ||
      !customerPhone ||
      !customerEmail ||
      !eventLocation
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required booking details',
      });
    }

    // Determine normalized array of dates to reserve
    let allDatesToReserve = [];
    if (isMultiDay && Array.isArray(eventDates) && eventDates.length > 0) {
      allDatesToReserve = Array.from(new Set(eventDates.filter(Boolean)));
    } else {
      allDatesToReserve = [eventDate];
    }

    // Validate and sanitize phone number (must be 10 digits)
    const cleanPhone = String(customerPhone).replace(/\D/g, '');
    const finalPhone = cleanPhone.length === 12 && cleanPhone.startsWith('91') ? cleanPhone.slice(2) : cleanPhone;
    if (finalPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Customer phone number must be a valid 10-digit mobile number.',
      });
    }

    // Validate email address
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(String(customerEmail).trim().toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid customer email address.',
      });
    }

    // Check if any selected date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const d of allDatesToReserve) {
      const parsedDate = new Date(d);
      if (parsedDate < today) {
        return res.status(400).json({
          success: false,
          message: `Event date (${d}) cannot be in the past.`,
        });
      }
    }

    // MULTI-DATE DOUBLE BOOKING CONFLICT CHECK:
    // Check if a Confirmed booking exists for ANY of the selected dates matching slot or full day
    const conflictingBookings = await Booking.find({
      status: 'Confirmed',
      $or: [
        { eventDate: { $in: allDatesToReserve } },
        { eventDates: { $in: allDatesToReserve } },
      ],
    });

    for (const conf of conflictingBookings) {
      // Find matching date
      const confDates = conf.isMultiDay && conf.eventDates && conf.eventDates.length > 0 ? conf.eventDates : [conf.eventDate];
      const overlapDate = allDatesToReserve.find((d) => confDates.includes(d));

      if (overlapDate) {
        // Determine requested slot for this specific date
        const dayShiftEntry = Array.isArray(dayShifts) ? dayShifts.find((ds) => ds.date === overlapDate) : null;
        const requestedSlotForThisDay = dayShiftEntry?.timeSlot || eventTimeSlot || 'Full Day (All Day Coverage)';

        // Check slot conflict
        if (
          conf.eventTimeSlot === 'Full Day (All Day Coverage)' ||
          requestedSlotForThisDay === 'Full Day (All Day Coverage)' ||
          conf.eventTimeSlot === requestedSlotForThisDay
        ) {
          return res.status(409).json({
            success: false,
            message: `Date ${overlapDate} is already booked for ${conf.eventTimeSlot}. Please select another date/shift or contact the admin with a query message to get a reply within 24 hours.`,
          });
        }
      }
    }

    // Generate unique booking reference
    let bookingReference = generateBookingRef();
    let collisionCheck = await Booking.findOne({ bookingReference });
    while (collisionCheck) {
      bookingReference = generateBookingRef();
      collisionCheck = await Booking.findOne({ bookingReference });
    }

    const calculatedDays = isMultiDay ? Math.max(allDatesToReserve.length, totalDays || 1) : 1;
    const effectivePackageName = isCustomEvent
      ? `Custom Event: ${customEventName || 'Custom Celebration'}`
      : packageName;
    const effectiveEventTimeSlot = isMultiDay && (!eventTimeSlot || eventTimeSlot.includes('Multi-Shift'))
      ? (dayShifts && dayShifts.length > 0 ? `${dayShifts[0].timeSlot} (+${dayShifts.length - 1} shifts)` : 'Multi-Shift Schedule')
      : (eventTimeSlot || 'Full Day (All Day Coverage)');

    const newBooking = await Booking.create({
      bookingReference,
      eventType: isCustomEvent ? 'Custom Event' : eventType,
      isCustomEvent: Boolean(isCustomEvent),
      customEventName: customEventName ? customEventName.trim() : '',
      isPhoneVerified: Boolean(isPhoneVerified),
      packageId: packageId || null,
      packageName: effectivePackageName,
      packagePrice: Number(packagePrice || 0),
      isMultiDay: Boolean(isMultiDay),
      totalDays: calculatedDays,
      eventDates: allDatesToReserve,
      dayShifts: Array.isArray(dayShifts) ? dayShifts : [],
      eventDate: allDatesToReserve[0] || eventDate,
      eventTimeSlot: effectiveEventTimeSlot,
      customerName: customerName.trim(),
      customerPhone: finalPhone,
      customerEmail: customerEmail.toLowerCase().trim(),
      eventLocation: eventLocation.trim(),
      additionalMessage: additionalMessage ? additionalMessage.trim() : '',
      status: 'Pending',
    });

    // Send email notifications (Admin alert + Customer confirmation)
    sendBookingNotification(newBooking).catch((err) => {
      console.error('[Background Admin Email Error]:', err.message);
    });
    sendCustomerBookingConfirmation(newBooking).catch((err) => {
      console.error('[Background Customer Email Error]:', err.message);
    });

    // Send SMS alerts (Admin alert + Customer receipt)
    sendAdminBookingSMS(newBooking).catch((err) => {
      console.error('[Background Admin SMS Error]:', err.message);
    });
    sendCustomerBookingSMS(newBooking).catch((err) => {
      console.error('[Background Customer SMS Error]:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Booking Request Submitted Successfully!',
      data: newBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check slot availability for a given date (Public)
// @route   GET /api/bookings/check-availability?date=YYYY-MM-DD
// @access  Public
// Helper to calculate full unavailable slots based on booked slots
const computeUnavailableSlots = (rawSlots) => {
  const ALL_SLOTS = [
    'Morning (08:00 AM - 01:00 PM)',
    'Evening (04:00 PM - 10:00 PM)',
    'Full Day (All Day Coverage)',
  ];

  const hasFullDay = rawSlots.includes('Full Day (All Day Coverage)');
  const hasMorning = rawSlots.includes('Morning (08:00 AM - 01:00 PM)');
  const hasEvening = rawSlots.includes('Evening (04:00 PM - 10:00 PM)');

  if (hasFullDay || (hasMorning && hasEvening)) {
    return {
      unavailableSlots: ALL_SLOTS,
      isFullyBooked: true,
    };
  }

  const unavailable = new Set(rawSlots);
  if (hasMorning || hasEvening) {
    unavailable.add('Full Day (All Day Coverage)');
  }

  return {
    unavailableSlots: Array.from(unavailable),
    isFullyBooked: false,
  };
};

// @desc    Check slot availability for a specific date (Public)
// @route   GET /api/bookings/check-availability
// @access  Public
const checkSlotAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date query parameter is required' });
    }

    // Find confirmed bookings for that date
    const bookedSlots = await Booking.find({
      eventDate: date,
      status: 'Confirmed',
    }).select('eventTimeSlot customerName eventType isBlockedDate');

    const rawSlots = bookedSlots.map((b) => b.eventTimeSlot);
    const { unavailableSlots, isFullyBooked } = computeUnavailableSlots(rawSlots);

    res.json({
      success: true,
      date,
      unavailableSlots,
      isFullyBooked,
      bookingsCount: bookedSlots.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all booked & reserved dates across upcoming months (Public)
// @route   GET /api/bookings/booked-dates
// @access  Public
const getBookedDates = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { startDate = today, months = 12 } = req.query;

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + Number(months));
    const endDateStr = endDate.toISOString().split('T')[0];

    const bookings = await Booking.find({
      status: 'Confirmed',
      $or: [
        { eventDate: { $gte: startDate, $lte: endDateStr } },
        { eventDates: { $elemMatch: { $gte: startDate, $lte: endDateStr } } },
      ],
    }).select('eventDate eventDates isMultiDay eventTimeSlot customerName eventType packageName isBlockedDate');

    const dateMap = {};
    for (const b of bookings) {
      const datesToProcess = b.isMultiDay && b.eventDates && b.eventDates.length > 0
        ? b.eventDates
        : [b.eventDate];

      for (const d of datesToProcess) {
        if (!d || d < startDate || d > endDateStr) continue;

        if (!dateMap[d]) {
          dateMap[d] = {
            date: d,
            rawSlots: [],
            reasons: [],
          };
        }
        dateMap[d].rawSlots.push(b.eventTimeSlot);
        const label = b.isBlockedDate
          ? (b.customerName || 'Studio Reserved')
          : `${b.eventType || 'Event'} Booking${b.isMultiDay ? ' (Multi-Day)' : ''}`;
        dateMap[d].reasons.push(label);
      }
    }

    const bookedDates = Object.values(dateMap).map((d) => {
      const { unavailableSlots, isFullyBooked } = computeUnavailableSlots(d.rawSlots);
      return {
        date: d.date,
        unavailableSlots,
        isFullyBooked,
        reasons: d.reasons,
      };
    });

    res.json({
      success: true,
      count: bookedDates.length,
      bookedDates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin manually block a date or slot (offline booking, studio off)
// @route   POST /api/bookings/block-date
// @access  Private (Admin)
const blockDateByAdmin = async (req, res, next) => {
  try {
    const { date, slot = 'Full Day (All Day Coverage)', reason, notes } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Please specify the date to block' });
    }

    // Check if slot is already confirmed
    const existingConfirmed = await Booking.findOne({
      eventDate: date,
      status: 'Confirmed',
      $or: [
        { eventTimeSlot: slot },
        { eventTimeSlot: 'Full Day (All Day Coverage)' },
        slot === 'Full Day (All Day Coverage)' ? { status: 'Confirmed' } : { eventTimeSlot: slot },
      ],
    });

    if (existingConfirmed) {
      return res.status(409).json({
        success: false,
        message: `This date/slot is already confirmed or blocked (${existingConfirmed.bookingReference} - ${existingConfirmed.customerName}).`,
      });
    }

    const bookingReference = `BLK-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const blockedRecord = await Booking.create({
      bookingReference,
      eventType: 'Other',
      packageId: null,
      packageName: 'Studio Reserved Date',
      packagePrice: 0,
      eventDate: date,
      eventTimeSlot: slot,
      customerName: reason && reason.trim() ? reason.trim() : 'Studio Reserved by Admin',
      customerPhone: '9608782890',
      customerEmail: 'sk61398sny@gmail.com',
      eventLocation: 'Studio / Reserved',
      additionalMessage: notes ? notes.trim() : 'Admin blocked this date.',
      status: 'Confirmed',
      isBlockedDate: true,
    });

    res.status(201).json({
      success: true,
      message: `Date ${date} has been blocked and marked as unavailable for clients.`,
      data: blockedRecord,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings with filtering & search (Admin)
// @route   GET /api/bookings
// @access  Private (Admin)
const getAllBookings = async (req, res, next) => {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { customerName: searchRegex },
        { customerPhone: searchRegex },
        { customerEmail: searchRegex },
        { bookingReference: searchRegex },
        { eventLocation: searchRegex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      count: bookings.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID (Admin)
// @route   GET /api/bookings/:id
// @access  Private (Admin)
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status & notes (Admin)
// @route   PUT /api/bookings/:id
// @access  Private (Admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // If changing to Confirmed, check if there's already another Confirmed booking for the same slot
    if (status === 'Confirmed' && booking.status !== 'Confirmed') {
      const conflict = await Booking.findOne({
        _id: { $ne: booking._id },
        eventDate: booking.eventDate,
        eventTimeSlot: booking.eventTimeSlot,
        status: 'Confirmed',
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: `Cannot confirm: Another booking (${conflict.bookingReference} - ${conflict.customerName}) is already confirmed for this date and time slot.`,
        });
      }
    }

    if (status) booking.status = status;
    if (adminNotes !== undefined) booking.adminNotes = adminNotes;

    const updatedBooking = await booking.save();

    // Notify customer about status change (e.g. Confirmed / Completed)
    sendBookingStatusUpdate(updatedBooking).catch((err) => {
      console.error('[Background Status Email Error]:', err.message);
    });
    sendCustomerStatusSMS(updatedBooking).catch((err) => {
      console.error('[Background Status SMS Error]:', err.message);
    });

    res.json({
      success: true,
      message: `Booking updated to ${booking.status}`,
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete booking (Admin)
// @route   DELETE /api/bookings/:id
// @access  Private (Admin)
const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await booking.deleteOne();

    res.json({
      success: true,
      message: 'Booking deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics (Admin)
// @route   GET /api/bookings/dashboard-stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'Confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'Completed' });
    const totalPhotos = await Gallery.countDocuments();
    const totalMessages = await Contact.countDocuments();
    const unreadMessages = await Contact.countDocuments({ isRead: false });

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Upcoming confirmed/pending events starting from today
    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingEvents = await Booking.find({
      eventDate: { $gte: todayStr },
      status: { $in: ['Confirmed', 'Pending'] },
    })
      .sort({ eventDate: 1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        totalPhotos,
        totalMessages,
        unreadMessages,
        recentBookings,
        upcomingEvents,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  sendBookingOtp,
  verifyBookingOtp,
  checkSlotAvailability,
  getBookedDates,
  blockDateByAdmin,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getDashboardStats,
};
