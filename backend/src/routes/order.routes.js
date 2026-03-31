// backend/src/routes/order.routes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.middleware');
const orderController = require('../controllers/order.controller');

// ✅ MUHIM: Specific routes first!

// GET /api/orders/admin - Admin route MUST be before /:id
router.get('/admin', protect, admin, orderController.getAllOrders);

// PUT /api/orders/:id/status - MUST be before /:id
router.put('/:id/status', protect, admin, orderController.updateOrderStatus);

// DELETE /api/orders/:id - Delete order (User or Admin)
router.delete('/:id', protect, orderController.deleteOrder);

// GET /api/orders - Get my orders
router.get('/', protect, orderController.getMyOrders);

// POST /api/orders - Create new order
router.post('/', protect, orderController.createOrder);

// GET /api/orders/:id - Get order by ID (LAST!)
router.get('/:id', protect, orderController.getOrderById);

module.exports = router;