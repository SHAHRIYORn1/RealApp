// backend/src/controllers/user.controller.js
const prisma = require('../config/prisma');

// GET /api/users/me - Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        avatar: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Foydalanuvchi topilmadi' 
      });
    }

    res.json({ 
      success: true, 
      data: { user: user } 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server xatosi',
      error: error.message 
    });
  }
};

// PUT /api/users/me - Update current user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user.id;

    console.log('📝 Update profile request:', { userId: userId, name: name, phone: phone, address: address });

    if (!name && !phone && !address) {
      return res.status(400).json({ 
        success: false, 
        message: 'Hech qanday ma\'lumot kiritilmadi' 
      });
    }

    const updateData = {};
    if (name && name.trim()) {
      updateData.name = name.trim();
    }
    if (phone && phone.trim()) {
      updateData.phone = phone.trim();
    }
    if (address && address.trim()) {
      updateData.address = address.trim();
    }

    console.log('📦 Update data:', updateData);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
      }
    });

    console.log('✅ Profile updated:', updatedUser);

    res.json({ 
      success: true, 
      data: { user: updatedUser }, 
      message: 'Profil muvaffaqiyatli yangilandi' 
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server xatosi',
      error: error.message 
    });
  }
};

// GET /api/users - Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { limit = 50, search = '' } = req.query;
    
    const where = {};
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
        { phone: { contains: search.trim(), mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where: where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            comments: true,
            likes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    const total = await prisma.user.count({ where: where });

    res.json({
      success: true,
      data: {
        users: users,
        pagination: {
          total: total,
          limit: parseInt(limit),
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server xatosi',
      error: error.message 
    });
  }
};

// GET /api/users/:id - Get user details with activity (Admin only)
exports.getUserDetails = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        avatar: true,
        createdAt: true,
        // Likes with cake info
        likes: {
          select: {
            id: true,
            createdAt: true,
            cake: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                price: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        // Comments with cake info
        comments: {
          select: {
            id: true,
            text: true,
            rating: true,
            createdAt: true,
            cake: {
              select: {
                id: true,
                name: true,
                imageUrl: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        // Orders with items
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            items: {
              select: {
                quantity: true,
                price: true,
                cake: {
                  select: {
                    id: true,
                    name: true,
                    imageUrl: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Foydalanuvchi topilmadi' 
      });
    }

    res.json({ 
      success: true, 
      data: { user: user } 
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server xatosi',
      error: error.message 
    });
  }
};

// DELETE /api/users/:id - Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const adminId = req.user.id;

    console.log('🗑️ Delete user request:', { userId: userId, adminId: adminId });

    // O'zini o'chira olmaydi
    if (userId === adminId) {
      return res.status(400).json({ 
        success: false, 
        message: 'O\'zingizni o\'chira olmaysiz' 
      });
    }

    // Adminni oddiy user o'chirolmaydi
    const targetUser = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { role: true }
    });

    if (!targetUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Foydalanuvchi topilmadi' 
      });
    }

    if (targetUser.role === 'ADMIN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Adminni o\'chirishga ruxsat yo\'q' 
      });
    }

    // Userni o'chirish (cascade bilan likes, comments, orders ham o'chadi)
    await prisma.user.delete({
      where: { id: userId }
    });

    console.log('✅ User deleted:', userId);

    res.json({ 
      success: true, 
      message: 'Foydalanuvchi muvaffaqiyatli o\'chirildi' 
    });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server xatosi',
      error: error.message 
    });
  }
};