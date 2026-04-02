// backend/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'olaja-tort-super-secret-key-2026-fixed';

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Tizimga kirish kerak' 
      });
    }

    console.log('🔐 Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('🔐 Token decoded:', { id: decoded.id, role: decoded.role });

    if (!decoded || !decoded.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token noto\'g\'ri formatda' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
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

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.name, error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token noto\'g\'ri yoki buzilgan' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token muddati tugagan' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Avtorizatsiya xatosi' 
    });
  }
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin ruxsati kerak' 
    });
  }
};