const express = require('express');
const router = express.Router();
const {
  createBooking,
  checkSlotAvailability,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getDashboardStats,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/', createBooking);
router.get('/check-availability', checkSlotAvailability);

// Admin protected routes
router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/', protect, getAllBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id', protect, updateBookingStatus);
router.delete('/:id', protect, deleteBooking);

module.exports = router;
