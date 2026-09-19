const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/', createBooking);
router.post('/send-otp', sendBookingOtp);
router.post('/verify-otp', verifyBookingOtp);
router.get('/check-availability', checkSlotAvailability);
router.get('/booked-dates', getBookedDates);

// Admin protected routes
router.get('/dashboard-stats', protect, getDashboardStats);
router.post('/block-date', protect, blockDateByAdmin);
router.get('/', protect, getAllBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id', protect, updateBookingStatus);
router.delete('/:id', protect, deleteBooking);

module.exports = router;
