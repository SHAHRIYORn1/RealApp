// backend/src/controllers/comment.controller.js
const prisma = require('../config/prisma');

// GET /api/cakes/:cakeId/comments - Get comments for a cake
exports.getCommentsByCake = async (req, res) => {
  try {
    const cakeId = parseInt(req.params.cakeId);
    const { limit = 50 } = req.query;

    const comments = await prisma.comment.findMany({
      where: { cakeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: { reports: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.json({ success: true, data: { comments } });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
  }
};

// POST /api/cakes/:cakeId/comments - Create comment (MAX 2 per user per cake)
exports.createComment = async (req, res) => {
  try {
    const cakeId = parseInt(req.params.cakeId);
    const { text, rating } = req.body;
    const userId = req.user.id;

    console.log('📝 Create comment request:', { userId, cakeId, text: text?.substring(0, 50) });

    // ✅ VALIDATION 1: Text majburiy
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Fikr matni majburiy' });
    }

    // ✅ VALIDATION 2: Bir user bir tortga maksimal 2 ta comment
    const userCommentCount = await prisma.comment.count({
      where: { userId: userId, cakeId: cakeId }
    });

    console.log('📊 User ' + userId + ' ning ' + cakeId + ' tortga ' + userCommentCount + ' ta comment bor');

    if (userCommentCount >= 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Siz bu tortga allaqachon 2 ta fikr qoldirgansiz. Boshqa tortlarga fikr yozishingiz mumkin.' 
      });
    }

    // ✅ VALIDATION 3: Rating 1-5 orasida
    if (rating !== undefined && rating !== null) {
      const ratingNum = parseInt(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ success: false, message: 'Rating 1 dan 5 gacha bo\'lishi kerak' });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        rating: rating ? parseInt(rating) : null,
        cakeId: cakeId,
        userId: userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    console.log('✅ Comment created:', comment.id);

    res.status(201).json({ success: true, data: { comment: comment }, message: 'Fikr qo\'shildi' });
  } catch (error) {
    console.error('❌ Create comment error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
  }
};

// DELETE /api/comments/:id - Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ success: true, message: 'Fikr o\'chirildi' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
  }
};

// POST /api/comments/:id/report - Report a comment
exports.reportComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const { reason } = req.body;
    const userId = req.user.id;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Shikoyat sababi majburiy' });
    }

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Fikr topilmadi' });
    }

    // O'z commentini shikoyat qilolmaydi
    if (comment.userId === userId) {
      return res.status(400).json({ success: false, message: 'O\'z fikringizni shikoyat qila olmaysiz' });
    }

    // Avval shikoyat qilganmi?
    const existingReport = await prisma.commentReport.findUnique({
      where: { 
        commentId_userId: { 
          commentId: commentId, 
          userId: userId 
        } 
      }
    });

    if (existingReport) {
      return res.status(400).json({ success: false, message: 'Siz bu fikrni allaqachon shikoyat qilgansiz' });
    }

    // Shikoyat yaratish
    const report = await prisma.commentReport.create({
      data: { 
        commentId: commentId, 
        userId: userId, 
        reason: reason.trim() 
      },
      include: {
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true 
          } 
        }
      }
    });

    // Shikoyatlar sonini tekshirish
    const reportCount = await prisma.commentReport.count({ 
      where: { commentId: commentId } 
    });

    console.log('🚨 Comment ' + commentId + ' ga ' + reportCount + ' ta shikoyat tushdi');

    // ✅ Agar 3 ta yoki undan ko'p shikoyat bo'lsa, avtomatik o'chirish
    if (reportCount >= 3) {
      await prisma.comment.delete({ where: { id: commentId } });

      console.log('🗑️ Comment ' + commentId + ' avtomatik o\'chirildi (' + reportCount + ' ta shikoyat)');

      return res.json({ 
        success: true, 
        message: 'Fikr shikoyat qilindi va avtomatik o\'chirildi',
        autoDeleted: true
      });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Fikr shikoyat qilindi',
      reportCount: reportCount,
      data: { report: report }
    });
  } catch (error) {
    console.error('Report comment error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
  }
};

// GET /api/comments/reported - Get reported comments (Admin only)
exports.getReportedComments = async (req, res) => {
  try {
    const reportedComments = await prisma.comment.findMany({
      where: {
        reports: { 
          some: {} 
        }
      },
      include: {
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true 
          } 
        },
        cake: { 
          select: { 
            id: true, 
            name: true 
          } 
        },
        reports: {
          include: {
            user: { 
              select: { 
                id: true, 
                name: true, 
                email: true 
              } 
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const commentsWithCount = reportedComments.map(function(comment) {
      return {
        ...comment,
        reportCount: comment.reports.length
      };
    }).sort(function(a, b) { 
      return b.reportCount - a.reportCount; 
    });

    res.json({ success: true, data: { comments: commentsWithCount } });
  } catch (error) {
    console.error('Get reported comments error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
  }
};