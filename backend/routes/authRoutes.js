const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminProfile, updateCredentials } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.get('/me', protect, getAdminProfile);
router.put('/update-credentials', protect, updateCredentials);

module.exports = router;
