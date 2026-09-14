const express = require('express');
const router = express.Router();
const {
  getPackages,
  getAllPackagesAdmin,
  createPackage,
  updatePackage,
  deletePackage,
} = require('../controllers/packageController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getPackages);

// Admin protected routes
router.get('/admin/all', protect, getAllPackagesAdmin);
router.post('/', protect, createPackage);
router.put('/:id', protect, updatePackage);
router.delete('/:id', protect, deletePackage);

module.exports = router;
