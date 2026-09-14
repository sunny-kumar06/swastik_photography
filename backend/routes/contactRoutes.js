const express = require('express');
const router = express.Router();
const {
  submitContactForm,
  getAllContacts,
  markContactAsRead,
  deleteContact,
} = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

// Public route
router.post('/', submitContactForm);

// Admin protected routes
router.get('/', protect, getAllContacts);
router.put('/:id/read', protect, markContactAsRead);
router.delete('/:id', protect, deleteContact);

module.exports = router;
