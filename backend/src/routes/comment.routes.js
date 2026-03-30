// backend/src/routes/comment.routes.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { protect } = require('../middleware/auth');

// GET /api/cakes/:cakeId/comments - Commentlarni olish
router.get('/:cakeId/comments', commentController.getCakeComments);

// POST /api/cakes/:cakeId/comments - Yangi comment
router.post('/:cakeId/comments', protect, commentController.createComment);

// DELETE /api/comments/:id - Commentni o'chirish
router.delete('/:id', protect, commentController.deleteComment);

module.exports = router;