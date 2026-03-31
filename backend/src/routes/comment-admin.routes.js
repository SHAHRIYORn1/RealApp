// backend/src/routes/comment-admin.routes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.middleware');
const commentController = require('../controllers/comment.controller');

// DELETE /api/comments/:id - Delete comment (Admin or Owner)
router.delete('/:id', protect, commentController.deleteComment);

// POST /api/comments/:id/report - Report a comment
router.post('/:id/report', protect, commentController.reportComment);

// GET /api/comments/reported - Get reported comments (Admin only)
router.get('/reported', protect, admin, commentController.getReportedComments);

module.exports = router;