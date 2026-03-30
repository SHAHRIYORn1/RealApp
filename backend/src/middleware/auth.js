// backend/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// ✅ Protect route - faqat authenticated users uchun
exports.protect = async (req, res, next) => {
  try {
    // Tokenni tekshirish
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Tizimga kiring'
      });
    }

    const token = authHeader.split(' ')[1];

    // Tokenni verify qilish
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Userni topish
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // User ma'lumotlarini req ga qo'shish
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token noto\'g\'ri yoki muddati tugagan'
    });
  }
};

// ✅ Admin only - faqat admin users uchun
exports.admin = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Faqat adminlar uchun'
      });
    }
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(403).json({
      success: false,
      message: 'Ruxsat yo\'q'
    });
  }
};