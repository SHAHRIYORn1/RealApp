// backend/src/config/prisma.js — Production Optimized
const { PrismaClient } = require('@prisma/client');

// ✅ Production uchun log darajasini sozlash
const isProduction = process.env.NODE_ENV === 'production';

const prisma = new PrismaClient({
  // Development da barcha querylarni ko'ramiz, production da faqat xatolar
  log: isProduction 
    ? ['error'] 
    : ['query', 'info', 'warn', 'error'],
  
  // ✅ Connection pool optimallashtirish
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// ✅ Graceful shutdown uchun avtomatik uzilish
prisma.$on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;