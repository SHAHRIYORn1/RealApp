// backend/src/app.js — Production Ready
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const prisma = require('./config/prisma');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ✅ CORS Configuration — Hamma joydan ruxsat (Development uchun)
// Production da o'z domeningizni qo'yishingiz mumkin
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));

// ✅ Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1y',
  immutable: true,
}));

// ✅ Health check endpoint (Render va Monitoring uchun MUHIM)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend ishlamoqda!',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ✅ Test endpoint
app.get('/api/auth/test', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Backend ishlamoqda!',
    environment: NODE_ENV,
  });
});

// ✅ Routes
const authRoutes = require('./routes/auth.routes');
const cakeRoutes = require('./routes/cake.routes');
const commentRoutes = require('./routes/comment.routes');
const commentAdminRoutes = require('./routes/comment-admin.routes');
const likeRoutes = require('./routes/like.routes');
const userRoutes = require('./routes/user.routes');
const orderRoutes = require('./routes/order.routes');
const uploadRoutes = require('./routes/upload.routes');

app.use('/api/auth', authRoutes);
app.use('/api/cakes', cakeRoutes);
app.use('/api/cakes', commentRoutes);
app.use('/api/comments', commentAdminRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

// ✅ 404 Handler (Not Found)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint topilmadi',
    path: req.originalUrl,
  });
});

// ✅ Global Error Handler — Server crash bo'lmasligi uchun
app.use((err, req, res, next) => {
  console.error('❌ Global Error:', {
    name: err.name,
    message: err.message,
    path: req.path,
  });

  // Prisma xatolari (masalan, unique constraint)
  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: 'Bu ma\'lumot allaqachon mavjud',
      field: err.meta?.target?.[0] || 'unknown',
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: NODE_ENV === 'production' ? 'Server xatosi' : err.message,
    ...(NODE_ENV === 'development' && { error: err.message }),
  });
});

// ✅ Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`👋 ${signal} signal received. Closing server...`);
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// ✅ Server start
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    // ✅ 0.0.0.0 — Internetga ochiq bo'lishi uchun muhim!
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${NODE_ENV}`);
      console.log(`🏥 Health: http://0.0.0.0:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();