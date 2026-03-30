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
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
  }
};

// ✅ PUT /api/users/me - Update current user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        address: address || undefined,
      },
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

    res.json({
      success: true,
      data: { user: updatedUser },
      message: 'Profil muvaffaqiyatli yangilandi'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
  }
};