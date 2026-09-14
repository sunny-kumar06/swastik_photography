const express = require('express');
const router = express.Router();
const {
  getGalleryPhotos,
  getGalleryPhotoById,
  uploadPhoto,
  updatePhoto,
  deletePhoto,
} = require('../controllers/galleryController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', getGalleryPhotos);
router.get('/:id', getGalleryPhotoById);

// Admin protected routes
router.post('/', protect, upload.single('image'), uploadPhoto);
router.put('/:id', protect, upload.single('image'), updatePhoto);
router.delete('/:id', protect, deletePhoto);

module.exports = router;
