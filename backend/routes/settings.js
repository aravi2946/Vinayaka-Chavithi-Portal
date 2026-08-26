const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/authMiddleware');
const logActivity = require('../utils/logger');

// @route   GET /api/settings
// @desc    Get festival settings (Public)
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      // Create default
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/settings
// @desc    Update festival settings
// @access  Private/Super Admin
router.put('/', protect, authorize('Super Admin'), async (req, res, next) => {
  try {
    let settings = await Settings.findOne({});
    const prevValue = settings ? settings.toObject() : {};

    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    const updatedSettings = await settings.save();

    await logActivity({
      user: req.user.username,
      action: 'Updated Festival Settings',
      recordType: 'Settings',
      recordId: updatedSettings._id,
      previousValue: prevValue,
      newValue: updatedSettings.toObject(),
    });

    res.json(updatedSettings);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
