const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Settings = require('../models/Settings');
const Gallery = require('../models/Gallery');
const Service = require('../models/Service');
const Package = require('../models/Package');
const Review = require('../models/Review');
const Booking = require('../models/Booking');

const CATEGORY_FALLBACKS = {
  'Pre-Wedding': 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200',
  'Wedding': 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=1200',
  'Engagement': 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=1200',
  'Birthday': 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=1200',
  'Cinematic': 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200',
  'Portrait': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200',
};

// @desc    Get all bootstrap public data in a single parallel query
// @route   GET /api/bootstrap
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [settings, galleryRaw, services, packages, reviews, bookedDates] = await Promise.all([
      Settings.findOne().lean(),
      Gallery.find({}).sort({ order: 1, createdAt: -1 }).lean(),
      Service.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean(),
      Package.find({ isActive: true }).sort({ order: 1, price: 1 }).lean(),
      Review.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
      Booking.find({
        status: { $in: ['confirmed', 'completed', 'blocked'] },
        eventDate: { $gte: today },
      }).select('eventDate status eventType -_id').lean(),
    ]);

    const sanitizedGallery = (galleryRaw || []).map((p) => {
      const pObj = { ...p };
      if (pObj.imageUrl && pObj.imageUrl.startsWith('/uploads/')) {
        const localPath = path.join(__dirname, '..', pObj.imageUrl.replace(/^\//, ''));
        if (!fs.existsSync(localPath)) {
          pObj.imageUrl = CATEGORY_FALLBACKS[pObj.category] || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200';
        }
      }
      return pObj;
    });

    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
    res.json({
      success: true,
      data: {
        settings: settings || {},
        gallery: sanitizedGallery,
        services: services || [],
        packages: packages || [],
        reviews: reviews || [],
        bookedDates: bookedDates || [],
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
