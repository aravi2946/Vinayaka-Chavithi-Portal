const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect, authorize } = require('../middleware/authMiddleware');
const logActivity = require('../utils/logger');

// @route   GET /api/announcements
// @desc    Get announcements (Public see published; Committee see all)
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
      const announcements = await Announcement.find({}).sort({ date: -1 });
      return res.json(announcements);
    } else {
      const announcements = await Announcement.find({ isPublished: true }).sort({ date: -1 });
      return res.json(announcements);
    }
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/announcements
// @desc    Create new announcement
// @access  Private (Super Admin, Content Manager)
router.post('/', protect, authorize('Super Admin', 'Content Manager'), async (req, res, next) => {
  const { title, description, date, priority, isPublished } = req.body;

  try {
    const announcement = await Announcement.create({
      title,
      description,
      date,
      priority,
      isPublished: isPublished !== undefined ? isPublished : true,
    });

    await logActivity({
      user: req.user.username,
      action: `Created announcement "${title}"`,
      recordType: 'Announcement',
      recordId: announcement._id,
      newValue: announcement.toObject(),
    });

    res.status(201).json(announcement);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/announcements/:id
// @desc    Edit announcement
// @access  Private (Super Admin, Content Manager)
router.put('/:id', protect, authorize('Super Admin', 'Content Manager'), async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    const prevValue = announcement.toObject();
    Object.assign(announcement, req.body);
    const updatedAnnouncement = await announcement.save();

    await logActivity({
      user: req.user.username,
      action: `Updated announcement "${announcement.title}"`,
      recordType: 'Announcement',
      recordId: announcement._id,
      previousValue: prevValue,
      newValue: updatedAnnouncement.toObject(),
    });

    res.json(updatedAnnouncement);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Private (Super Admin, Content Manager)
router.delete('/:id', protect, authorize('Super Admin', 'Content Manager'), async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    const title = announcement.title;
    await Announcement.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user.username,
      action: `Deleted announcement "${title}"`,
      recordType: 'Announcement',
      recordId: req.params.id,
      previousValue: announcement.toObject(),
    });

    res.json({ message: `Announcement "${title}" deleted successfully` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
