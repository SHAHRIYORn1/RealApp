// backend/src/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const prisma = require('./config/prisma');  // ✅ PRISMA IMPORT!

dotenv.config();
const app = express();

// CORS sozlamalari
app.use(cors({
  origin: ['http://localhost:8081', 'http://192.168.43.147:8081', 'exp://*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test endpoint
app.get('/api/auth/test', (req, res) => {
  res.json({ status: 'success', message: 'Backend ishlamoqda!' });
});

// Routes
// Routes
const authRoutes = require('./routes/auth.routes');
const cakeRoutes = require('./routes/cake.routes');
const commentRoutes = require('./routes/comment.routes');
const likeRoutes = require('./routes/like.routes');  // ✅ YANGI
const userRoutes = require('./routes/user.routes');  // ✅ YANGI
const orderRoutes = require('./routes/order.routes');

app.use('/api/auth', authRoutes);
app.use('/api/cakes', cakeRoutes);
app.use('/api/cakes', commentRoutes);
app.use('/api/likes', likeRoutes);  // ✅ YANGI
app.use('/api/users', userRoutes);  // ✅ YANGI
app.use('/api/orders', orderRoutes);

// Uploads uchun static folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Server xatosi',
    error: err.message
  });
});

// Server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Local: http://localhost:${PORT}`);
      console.log(`📱 Network: http://192.168.43.147:${PORT}`);
      console.log(`🔐 Auth: /api/auth/register, /login, /profile`);
      console.log(`🍰 Cakes: /api/cakes`);
      console.log(`💬 Comments: /api/cakes/:id/comments`);
      console.log(`❤️ Likes: /api/cakes/:id/like`);
      console.log(`🛒 Orders: /api/orders`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('👋 Server stopped');
  process.exit(0);
});