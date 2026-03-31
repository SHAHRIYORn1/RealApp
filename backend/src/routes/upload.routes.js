// backend/src/routes/upload.routes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const path = require('path');

// POST /api/upload/cake-image - Upload cake image
router.post('/cake-image', protect, admin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rasm fayli topilmadi' 
      });
    }

    // Public URL yaratish
    const imageUrl = req.protocol + '://' + req.get('host') + '/uploads/cakes/' + req.file.filename;

    res.json({
      success: true,
      data: {  // ✅ "data:" kaliti MUHIM!
        imageUrl: imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      message: 'Rasm muvaffaqiyatli yuklandi'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Rasm yuklashda xato',
      error: error.message 
    });
  }
});

module.exports = router;