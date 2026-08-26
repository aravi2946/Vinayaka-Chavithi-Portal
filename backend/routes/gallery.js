const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protect, authorize } = require('../middleware/authMiddleware');
const logActivity = require('../utils/logger');

// @route   GET /api/gallery
// @desc    Get gallery items (Public see published; Committee see all)
// @access  Public / Private
router.get('/', async (req, res, next) => {
  try {
    const isCommittee = req.headers.authorization && req.headers.authorization.startsWith('Bearer');
    let user = null;

    if (isCommittee) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_vinayaka_key_123');
        const User = require('../models/User');
        user = await User.findById(decoded.id);
      } catch (err) {
        // treat as public
      }
    }

    if (user && ['Super Admin', 'Content Manager'].includes(user.role)) {
      const items = await Gallery.find({}).sort({ date: -1 });
      return res.json(items);
    } else {
      const items = await Gallery.find({ isPublished: true }).sort({ date: -1 });
      return res.json(items);
    }
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/gallery
// @desc    Add new gallery image
// @access  Private (Super Admin, Content Manager)
router.post('/', protect, authorize('Super Admin', 'Content Manager'), async (req, res, next) => {
  const { imageUrl, caption, eventCategory, date, isPublished } = req.body;

  try {
    const galleryItem = await Gallery.create({
      imageUrl,
      caption,
      eventCategory: eventCategory || 'Other',
      date,
      isPublished: isPublished !== undefined ? isPublished : true,
    });

    await logActivity({
      user: req.user.username,
      action: `Added gallery image "${caption}"`,
      recordType: 'Gallery',
      recordId: galleryItem._id,
      newValue: galleryItem.toObject(),
    });

    res.status(201).json(galleryItem);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/gallery/:id
// @desc    Edit gallery image caption/details
// @access  Private (Super Admin, Content Manager)
router.put('/:id', protect, authorize('Super Admin', 'Content Manager'), async (req, res, next) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);

    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    const prevValue = galleryItem.toObject();
    Object.assign(galleryItem, req.body);
    const updatedItem = await galleryItem.save();

    await logActivity({
      user: req.user.username,
      action: `Updated gallery image "${galleryItem.caption}"`,
      recordType: 'Gallery',
      recordId: galleryItem._id,
      previousValue: prevValue,
      newValue: updatedItem.toObject(),
    });

    res.json(updatedItem);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete gallery image
// @access  Private (Super Admin, Content Manager)
router.delete('/:id', protect, authorize('Super Admin', 'Content Manager'), async (req, res, next) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);

    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    const caption = galleryItem.caption;
    await Gallery.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user.username,
      action: `Deleted gallery image "${caption}"`,
      recordType: 'Gallery',
      recordId: req.params.id,
      previousValue: galleryItem.toObject(),
    });

    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
