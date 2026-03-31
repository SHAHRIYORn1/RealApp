// backend/scripts/delete-all-users.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllUsersExceptAdmin() {
  try {
    console.log('🗑️ Barcha userlarni o\'chirish boshlandi...\n');

    // Admin userlarni saqlab qolish
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, name: true, email: true }
    });

    console.log('👑 Admin userlar (saqlanadi):', adminUsers.length);
    const adminIds = adminUsers.map(u => u.id);

    // Barcha userlarni olish
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            orders: true,
            comments: true,
            likes: true
          }
        }
      }
    });

    const usersToDelete = allUsers.filter(u => !adminIds.includes(u.id));
    console.log('📋 O\'chiriladigan userlar:', usersToDelete.length, '\n');

    // Har bir user uchun
    for (const user of usersToDelete) {
      console.log('🔄 User ' + user.id + ' (' + user.name + ') o\'chirilmoqda...');

      try {
        // 1. OrderItem larni o'chirish
        const orders = await prisma.order.findMany({
          where: { userId: user.id },
          select: { id: true }
        });

        const orderIds = orders.map(o => o.id);
        if (orderIds.length > 0) {
          await prisma.orderItem.deleteMany({
            where: { orderId: { in: orderIds } }
          });
          console.log('   - OrderItem lar o\'chirildi: ' + orderIds.length);
        }

        // 2. Order larni o'chirish
        await prisma.order.deleteMany({
          where: { userId: user.id }
        });
        console.log('   - Order lar o\'chirildi: ' + orders.length);

        // 3. CommentReport larni o'chirish
        await prisma.commentReport.deleteMany({
          where: { 
            OR: [
              { userId: user.id },
              { comment: { userId: user.id } }
            ]
          }
        });
        console.log('   - CommentReport lar o\'chirildi');

        // 4. Comment larni o'chirish
        await prisma.comment.deleteMany({
          where: { userId: user.id }
        });
        console.log('   - Comment lar o\'chirildi');

        // 5. Like larni o'chirish
        await prisma.like.deleteMany({
          where: { userId: user.id }
        });
        console.log('   - Like lar o\'chirildi');

        // 6. User ni o'chirish
        await prisma.user.delete({
          where: { id: user.id }
        });

        console.log('✅ User ' + user.id + ' o\'chirildi\n');
      } catch (error) {
        console.error('❌ User ' + user.id + ' o\'chirishda xato:', error.message);
      }
    }

    // Natija
    const remainingUsers = await prisma.user.count();
    console.log('\n📊 Natija:');
    console.log('   Qolgan userlar: ' + remainingUsers);
    console.log('   Admin userlar: ' + adminUsers.length);

  } catch (error) {
    console.error('❌ Xato:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllUsersExceptAdmin();
