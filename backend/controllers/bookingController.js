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
} = require('../utils/smsService');

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

// @desc    Create a new booking (Public)
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res, next) => {
  try {
    const {
      eventType,
      packageId,
      packageName,
      packagePrice,
      eventDate,
      eventTimeSlot,
      customerName,
      customerPhone,
      customerEmail,
      eventLocation,
      additionalMessage,
    } = req.body;

    if (
      !eventType ||
      !packageName ||
      packagePrice === undefined ||
      !eventDate ||
      !eventTimeSlot ||
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

    // Check if the date is in the past
    const selectedDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Event date cannot be in the past.',
      });
    }

    // DOUBLE BOOKING PREVENTION:
    // Check if a Confirmed booking already exists for the exact same date and time slot
    const existingConfirmed = await Booking.findOne({
      eventDate,
      eventTimeSlot,
      status: 'Confirmed',
    });

    if (existingConfirmed) {
      return res.status(409).json({
        success: false,
        message: 'This date/time is already booked. Please select another time.',
      });
    }

    // Generate unique booking reference
    let bookingReference = generateBookingRef();
    let collisionCheck = await Booking.findOne({ bookingReference });
    while (collisionCheck) {
      bookingReference = generateBookingRef();
      collisionCheck = await Booking.findOne({ bookingReference });
    }

    const newBooking = await Booking.create({
      bookingReference,
      eventType,
      packageId: packageId || null,
      packageName,
      packagePrice: Number(packagePrice),
      eventDate,
      eventTimeSlot,
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
    }).select('eventTimeSlot');

    const unavailableSlots = bookedSlots.map((b) => b.eventTimeSlot);

    res.json({
      success: true,
      date,
      unavailableSlots,
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
  checkSlotAvailability,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getDashboardStats,
};
