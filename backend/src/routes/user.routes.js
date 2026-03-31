// backend/src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

// GET /api/users - Get all users (Admin only)
router.get('/', protect, admin, userController.getAllUsers);

// GET /api/users/me - Get current user profile
router.get('/me', protect, userController.getProfile);

// PUT /api/users/me - Update current user profile
router.put('/me', protect, userController.updateProfile);

// GET /api/users/:id - Get user details with activity (Admin only)
router.get('/:id', protect, admin, userController.getUserDetails);

// DELETE /api/users/:id - Delete user (Admin only)
router.delete('/:id', protect, admin, userController.deleteUser);

module.exports = router;