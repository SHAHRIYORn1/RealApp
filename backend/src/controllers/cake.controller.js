// backend/src/controllers/cake.controller.js
const prisma = require('../config/prisma');

// GET /api/cakes - Get all cakes
exports.getAllCakes = async (req, res) => {
  try {
    const { limit = 20, search = '', category = '' } = req.query;
    
    const where = {};
    if (search && search.trim()) {
      where.name = { contains: search.trim(), mode: 'insensitive' };
    }
    if (category && category.trim()) {
      where.category = category.trim();
    }

    const cakes = await prisma.cake.findMany({
      where,
      include: {
        _count: {
          select: { likes: true, comments: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit) || 20
    });

    const total = await prisma.cake.count({ where });

    res.json({
      success: true,
      data: {
        cakes,
        pagination: {
          total,
          limit: parseInt(limit) || 20,
        }
      }
    });
  } catch (error) {
    console.error('Get cakes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// GET /api/cakes/:id - Get cake by ID
exports.getCakeById = async (req, res) => {
  try {
    const cakeId = parseInt(req.params.id);
    
    if (!cakeId || isNaN(cakeId)) {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri cake ID'
      });
    }

    const cake = await prisma.cake.findUnique({
      where: { id: cakeId },
      include: {
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });

    if (!cake) {
      return res.status(404).json({
        success: false,
        message: 'Tort topilmadi'
      });
    }

    res.json({
      success: true,
      data: { cake }
    });
  } catch (error) {
    console.error('Get cake by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// POST /api/cakes - Create new cake
exports.createCake = async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, weight, ingredients, isAvailable } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tort nomi majburiy' });
    }
    if (!price || isNaN(parseFloat(price))) {
      return res.status(400).json({ success: false, message: 'Narx majburiy va raqam bo\'lishi kerak' });
    }

    const cake = await prisma.cake.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price),
        imageUrl: imageUrl?.trim() || null,  // ✅ null bo'lsa null qabul qil
        category: category?.trim() || null,
        weight: weight?.trim() || null,       // ✅ null bo'lsa null qabul qil
        ingredients: ingredients?.trim() || null, // ✅ null bo'lsa null qabul qil
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      }
    });

    res.status(201).json({ success: true, data: { cake }, message: 'Tort qo\'shildi' });
  } catch (error) {
    console.error('Create cake error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
  }
};
// PUT /api/cakes/:id - Update cake
exports.updateCake = async (req, res) => {
  try {
    const cakeId = parseInt(req.params.id);
    const { name, description, price, imageUrl, category, weight, ingredients, isAvailable } = req.body;

    if (!cakeId || isNaN(cakeId)) {
      return res.status(400).json({ success: false, message: 'Noto\'g\'ri cake ID' });
    }

    const updateData = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (price !== undefined && !isNaN(parseFloat(price))) updateData.price = parseFloat(price);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl?.trim() || null;  // ✅
    if (category !== undefined) updateData.category = category?.trim() || null;
    if (weight !== undefined) updateData.weight = weight?.trim() || null;         // ✅
    if (ingredients !== undefined) updateData.ingredients = ingredients?.trim() || null; // ✅
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    const cake = await prisma.cake.update({
      where: { id: cakeId },
      data: updateData
    });

    res.json({ success: true, data: { cake }, message: 'Tort yangilandi' });
  } catch (error) {
    console.error('Update cake error:', error);
    res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
  }
};

// DELETE /api/cakes/:id - Delete cake
exports.deleteCake = async (req, res) => {
  try {
    const cakeId = parseInt(req.params.id);

    if (!cakeId || isNaN(cakeId)) {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri cake ID'
      });
    }

    await prisma.cake.delete({
      where: { id: cakeId }
    });

    res.json({
      success: true,
      message: 'Tort o\'chirildi'
    });
  } catch (error) {
    console.error('Delete cake error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};

// GET /api/cakes/search - Search cakes
exports.searchCakes = async (req, res) => {
  try {
    const { q = '' } = req.query;

    const cakes = await prisma.cake.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } }
        ]
      },
      include: {
        _count: {
          select: { likes: true, comments: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({
      success: true,
      data: { cakes }
    });
  } catch (error) {
    console.error('Search cakes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      error: error.message
    });
  }
};