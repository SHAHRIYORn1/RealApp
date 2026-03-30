// backend/src/controllers/like.controller.js
const prisma = require('../config/prisma');

// GET /api/likes/cake/:cakeId - Check like status
exports.checkLike = async (req, res) => {
  try {
    const cakeId = parseInt(req.params.cakeId);
    const userId = req.user.id;

    const like = await prisma.like.findUnique({
      where: { userId_cakeId: { userId, cakeId } }
    });

    const totalLikes = await prisma.like.count({
      where: { cakeId }
    });

    res.json({
      success: true,
      data: {
        isLiked: !!like,
        totalLikes
      }
    });
  } catch (error) {
    console.error('Check like error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
  }
};

// POST /api/likes/cake/:cakeId - Toggle like
exports.toggleLike = async (req, res) => {
  try {
    const cakeId = parseInt(req.params.cakeId);
    const userId = req.user.id;

    const existingLike = await prisma.like.findUnique({
      where: { userId_cakeId: { userId, cakeId } }
    });

    let like;
    if (existingLike) {
      // Unlike
      like = await prisma.like.delete({
        where: { id: existingLike.id }
      });
    } else {
      // Like
      like = await prisma.like.create({
        data: { userId, cakeId }
      });
    }

    const totalLikes = await prisma.like.count({ where: { cakeId } });

    res.json({
      success: true,
      data: {
        isLiked: !existingLike,
        totalLikes
      },
      message: existingLike ? 'Like o\'chirildi' : 'Like qo\'shildi'
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
  }
};

// ✅ GET /api/likes/my - Get all liked cakes by current user
exports.getMyLikes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;

    const likes = await prisma.like.findMany({
      where: { userId },
      include: {
        cake: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            imageUrl: true,
            category: true,
            weight: true,
            rating: true,
            isAvailable: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    // Faqat cake ma'lumotlarini qaytarish
    const likedCakes = likes.map(like => like.cake).filter(cake => cake !== null);

    res.json({
      success: true,
      data: { likes: likedCakes }
    });
  } catch (error) {
    console.error('Get my likes error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
  }
};