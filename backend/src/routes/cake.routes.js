// backend/src/routes/cake.routes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.middleware');
const cakeController = require('../controllers/cake.controller');

// ✅ MUHIM: Specific routes first!

// GET /api/cakes/search - Search cakes
router.get('/search', protect, cakeController.searchCakes);

// POST /api/cakes - Create new cake (Admin)
router.post('/', protect, admin, cakeController.createCake);

// GET /api/cakes - Get all cakes (Public)
router.get('/', cakeController.getAllCakes);

// GET /api/cakes/:id - Get cake by ID (MUST BE LAST!)
router.get('/:id', cakeController.getCakeById);

// PUT /api/cakes/:id - Update cake (Admin)
router.put('/:id', protect, admin, cakeController.updateCake);

// DELETE /api/cakes/:id - Delete cake (Admin)
router.delete('/:id', protect, admin, cakeController.deleteCake);

module.exports = router;