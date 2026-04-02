// backend/src/controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'olaja-tort-fixed-secret-key-2026';

// POST /api/auth/register - Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    console.log('📝 Register request:', { name, email, phone });

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ism, email va password majburiy' 
      });
    }

    // 2. Email formatini tekshirish
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Noto\'g\'ri email formati' 
      });
    }

    // 3. Email ni normalize qilish
    const normalizedEmail = email.toLowerCase().trim();

    // 4. Email allaqachon mavjudligini tekshirish
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bu email allaqachon ro\'yxatdan o\'tgan' 
      });
    }

    // 5. Password ni hash qilish
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. User yaratish
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      }
    });

    console.log('✅ User created:', user.id);

    // 7. Token yaratish
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 8. ✅ TO'G'RI JAVOB FORMATI
    res.status(201).json({
      success: true,
      data: {
        user: user,
        token: token
      },
      message: 'Foydalanuvchi muvaffaqiyatli ro\'yxatdan o\'tdi'
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false, 
        message: 'Bu email allaqachon mavjud' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server xatosi',
      error: error.message 
    });
  }
};

// POST /api/auth/login - Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login request:', { email });

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email va password majburiy' 
      });
    }

    // 2. Email ni normalize qilish
    const normalizedEmail = email.toLowerCase().trim();

    // 3. User ni topish
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        phone: true,
        address: true,
        role: true,
        avatar: true,
        createdAt: true,
      }
    });

    console.log('🔍 User found:', user ? '✅' : '❌');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email yoki password noto\'g\'ri' 
      });
    }

    // 4. Password ni tekshirish
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔐 Password valid:', isPasswordValid ? '✅' : '❌');

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email yoki password noto\'g\'ri' 
      });
    }

    // 5. Token yaratish
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 6. Password ni olib tashlash
    const { password: _, ...userWithoutPassword } = user;

    console.log('✅ Login successful:', { id: user.id, role: user.role });

    // 7. ✅ TO'G'RI JAVOB FORMATI
    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token: token
      },
      message: 'Tizimga muvaffaqiyatli kirdingiz'
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server xatosi',
      error: error.message 
    });
  }
};

// GET /api/auth/profile - Get current user profile
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
      data: {
        user: user
      }
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