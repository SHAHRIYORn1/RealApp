// backend/src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// POST /api/auth/register - Yangi user ro'yxatdan o'tkazish
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validatsiya
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Ism, email va parol majburiy'
      });
    }

    // Email allaqachon mavjudligini tekshirish
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email allaqachon ro\'yxatdan o\'tgan'
      });
    }

    // Passwordni hashlash
    const hashedPassword = await bcrypt.hash(password, 10);

    // User yaratish
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
        phone: phone || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true
      }
    });

    // Token yaratish
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: { user, token },
      message: 'Foydalanuvchi muvaffaqiyatli ro\'yxatdan o\'tdi'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// POST /api/auth/login - User login qilish
exports.login = async (req, res) => {
  try {
    // ✅ Faqat email va password olish
    const { email, password } = req.body;

    // Validatsiya
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email va parol majburiy'
      });
    }

    // ✅ Userni email (string) bo'yicha topish
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email yoki password noto'g'ri"
      });
    }

    // ✅ Passwordni solishtirish
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Email yoki password noto'g'ri"
      });
    }

    // ✅ Token yaratish
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ User ma'lumotlari (passwordsiz)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt
    };

    // ✅ Javob qaytarish
    res.json({
      success: true,
      data: { user: userData, token },
      message: 'Muvaffaqiyatli kirishingiz'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// GET /api/auth/profile - User profilini olish
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        avatar: true,
        createdAt: true
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