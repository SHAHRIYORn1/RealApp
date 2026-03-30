// backend/src/routes/like.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const likeController = require('../controllers/like.controller');

// GET /api/likes/cake/:cakeId - Check like status for a cake
router.get('/cake/:cakeId', protect, likeController.checkLike);

// POST /api/likes/cake/:cakeId - Toggle like for a cake
router.post('/cake/:cakeId', protect, likeController.toggleLike);

// ✅ GET /api/likes/my - Get all liked cakes by current user
router.get('/my', protect, likeController.getMyLikes);

module.exports = router;