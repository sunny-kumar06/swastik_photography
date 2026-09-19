const Review = require('../models/Review');

// @desc    Get active reviews for public site
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews including inactive (Admin)
// @route   GET /api/reviews/admin/all
// @access  Private (Admin)
const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Create review (Admin / Public with default active)
// @route   POST /api/reviews
// @access  Private (Admin)
const createReview = async (req, res, next) => {
  try {
    const { customerName, eventType, rating, comment, customerPhoto, eventDate, isActive, isFeatured } = req.body;

    if (!customerName || !comment || rating === undefined) {
      return res.status(400).json({ success: false, message: 'Name, rating, and review text are required' });
    }

    const review = await Review.create({
      customerName: customerName.trim(),
      eventType: eventType || 'Wedding',
      rating: Number(rating),
      comment: comment.trim(),
      customerPhoto: customerPhoto || '',
      eventDate: eventDate || '',
      isActive: isActive !== undefined ? (isActive === true || isActive === 'true') : true,
      isFeatured: isFeatured !== undefined ? (isFeatured === true || isFeatured === 'true') : true,
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review (Admin)
// @route   PUT /api/reviews/:id
// @access  Private (Admin)
const updateReview = async (req, res, next) => {
  try {
    const { customerName, eventType, rating, comment, customerPhoto, eventDate, isActive, isFeatured } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (customerName) review.customerName = customerName.trim();
    if (eventType) review.eventType = eventType;
    if (rating !== undefined) review.rating = Number(rating);
    if (comment) review.comment = comment.trim();
    if (customerPhoto !== undefined) review.customerPhoto = customerPhoto;
    if (eventDate !== undefined) review.eventDate = eventDate;
    if (isActive !== undefined) review.isActive = isActive === true || isActive === 'true';
    if (isFeatured !== undefined) review.isFeatured = isFeatured === true || isFeatured === 'true';

    const updatedReview = await review.save();

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review (Admin)
// @route   DELETE /api/reviews/:id
// @access  Private (Admin)
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviews,
  getAllReviewsAdmin,
  createReview,
  updateReview,
  deleteReview,
};
