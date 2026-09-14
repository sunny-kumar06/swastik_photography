const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

// Public route
router.get('/', getSettings);

// Admin protected route
router.put('/', protect, updateSettings);

module.exports = router;
