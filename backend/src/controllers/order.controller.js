// backend/src/controllers/order.controller.js
const prisma = require('../config/prisma');

// GET /api/orders - Get my orders
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { cake: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: { orders } });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// GET /api/orders/:id - Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    // ✅ id borligini tekshirish
    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({ success: false, message: 'Noto\'g\'ri order ID' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { cake: true } } }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });
    }

    res.json({ success: true, data: { order } });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// POST /api/orders - Create new order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address, phone, note, additionalInfo, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Buyurtma itemlari majburiy' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const cake = await prisma.cake.findUnique({ where: { id: item.cakeId } });
      if (!cake) {
        return res.status(400).json({ success: false, message: `Tort topilmadi: ${item.cakeId}` });
      }
      totalAmount += cake.price * item.quantity;
      orderItems.push({
        cakeId: item.cakeId,
        quantity: item.quantity,
        price: cake.price,
      });
    }

    

// ✅ YANGI (to'g'ri):
const order = await prisma.order.create({
  data: {
    userId,
    address,
    phone,
    note: note || null,
    // additionalInfo ni olib tashladik!
    totalAmount,
    status: 'PENDING',
    items: { create: orderItems }
  },
  include: {
    items: {
      include: {
        cake: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            price: true
          }
        }
      }
    }
  }
});

    res.status(201).json({ success: true, data: { order }, message: 'Buyurtma yaratildi' });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// GET /api/orders/admin - Get all orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true, 
            phone: true 
          } 
        },
        items: { 
          include: { 
            cake: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                price: true
              }
            }
          } 
        }
      },
      orderBy: { 
        createdAt: 'desc' 
      }
    });

    res.json({ 
      success: true, 
      data: { orders } 
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server xatosi',
      error: error.message 
    });
  }
};

// PUT /api/orders/:id/status - Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    // ✅ ID borligini tekshirish
    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Noto\'g\'ri buyurtma ID' 
      });
    }
    
    const { status } = req.body;
    
    // ✅ Status borligini tekshirish
    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Noto\'g\'ri status' 
      });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { cake: true } }
      }
    });

    res.json({ 
      success: true, 
      data: { order },
      message: 'Buyurtma status yangilandi' 
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server xatosi',
      error: error.message 
    });
  }
};
// PUT /api/orders/:id/status - Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({ success: false, message: 'Noto\'g\'ri order ID' });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    res.json({ success: true, data: { order }, message: 'Status yangilandi' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};