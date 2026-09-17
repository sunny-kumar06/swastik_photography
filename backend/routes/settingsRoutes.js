const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Public route
router.get('/', getSettings);

// Admin protected route (supports JSON and multipart image uploads)
router.put(
  '/',
  protect,
  upload.fields([
    { name: 'aboutImage', maxCount: 1 },
    { name: 'heroImage', maxCount: 1 },
  ]),
  updateSettings
);

module.exports = router;
