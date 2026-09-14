const express = require('express');
const router = express.Router();
const {
  getReviews,
  getAllReviewsAdmin,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getReviews);

// Admin protected routes
router.get('/admin/all', protect, getAllReviewsAdmin);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
