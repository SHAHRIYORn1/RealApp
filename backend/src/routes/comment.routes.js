// backend/src/routes/comment.routes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.middleware');
const commentController = require('../controllers/comment.controller');

// GET /api/cakes/:cakeId/comments - Get comments for a cake
router.get('/:cakeId/comments', commentController.getCommentsByCake);

// POST /api/cakes/:cakeId/comments - Create comment
router.post('/:cakeId/comments', protect, commentController.createComment);

module.exports = router;