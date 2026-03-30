// backend/src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

// GET /api/users/me - Get current user profile
router.get('/me', protect, userController.getProfile);

// PUT /api/users/me - Update current user profile
router.put('/me', protect, userController.updateProfile);

module.exports = router;