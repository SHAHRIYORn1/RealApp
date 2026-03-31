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
      data: { user } 
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

    console.log('📝 Update profile request:', { userId, name, phone, address });

    if (!name && !phone && !address) {
      return res.status(400).json({ 
        success: false, 
        message: 'Hech qanday ma\'lumot kiritilmadi' 
      });
    }

    const updateData = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (phone && phone.trim()) updateData.phone = phone.trim();
    if (address && address.trim()) updateData.address = address.trim();

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