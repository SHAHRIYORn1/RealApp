const prisma = require('../config/prisma');

// GET /api/cakes/:cakeId/comments - Get comments for a cake
exports.getCakeComments = async (req, res) => {
  try {
    const cakeId = parseInt(req.params.cakeId);
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { cakeId },
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.comment.count({ where: { cakeId } })
    ]);

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// POST /api/cakes/:cakeId/comments - Create comment
exports.createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const cakeId = parseInt(req.params.cakeId);
    const { text, rating } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment matni bo\'sh bo\'lishi mumkin emas'
      });
    }

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        rating: rating ? parseInt(rating) : null,
        userId,
        cakeId
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

    res.status(201).json({
      success: true,
      data: { comment },
      message: 'Fikr qo\'shildi'
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// DELETE /api/comments/:id - Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment topilmadi'
      });
    }

    // Faqat comment muallifi yoki admin o'chira oladi
    if (comment.userId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Ruxsat yo\'q'
      });
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    res.json({
      success: true,
      message: 'Comment o\'chirildi'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};