const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Settings = require('../models/Settings');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const logActivity = require('../utils/logger');

// @route   GET /api/settings
// @desc    Get festival settings (Public: current year idol sponsor only; Super Admin: all upcoming years)
// @access  Public (with optional Super Admin privileges)
router.get('/', async (req, res, next) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create({});
    }

    // Check optional authentication to see if user is Super Admin
    let isSuperAdmin = false;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_vinayaka_key_123');
        const user = await User.findById(decoded.id);
        if (user && user.role === 'Super Admin' && user.status === 'Active') {
          isSuperAdmin = true;
        }
      } catch (err) {
        // Unauthenticated or invalid token, treat as public
      }
    }

    const settingsObj = settings.toObject();
    const currentYear = settingsObj.festivalYear || 2026;

    // Ensure current year sponsor exists in idolSponsors array if not present
    if (!Array.isArray(settingsObj.idolSponsors) || settingsObj.idolSponsors.length === 0) {
      settingsObj.idolSponsors = [
        {
          year: currentYear,
          name: settingsObj.idolSponsorName || 'UPPUTURI VENKATA GANESH',
          details: settingsObj.idolSponsorDetails || 'Grand 9ft Eco-Friendly Clay Ganesha Idol Seva',
          message: settingsObj.idolSponsorMessage || 'Heartfelt gratitude and Lord Vinayaka blessings to the sponsor family for divine patronage.',
          amount: settingsObj.idolSponsorAmount || '',
          photoUrl: settingsObj.idolSponsorPhotoUrl || '',
          active: settingsObj.idolSponsorActive !== false,
        },
      ];
    }

    // Sync top-level fields to the current year's entry
    const currentSponsor = settingsObj.idolSponsors.find((s) => s.year === currentYear);
    if (currentSponsor) {
      settingsObj.idolSponsorName = currentSponsor.name;
      settingsObj.idolSponsorDetails = currentSponsor.details;
      settingsObj.idolSponsorMessage = currentSponsor.message;
      settingsObj.idolSponsorPhotoUrl = currentSponsor.photoUrl;
      settingsObj.idolSponsorActive = currentSponsor.active;
    }

    // If NOT Super Admin, filter upcoming years (year > currentYear)
    if (!isSuperAdmin) {
      settingsObj.idolSponsors = settingsObj.idolSponsors.filter((s) => s.year <= currentYear && s.active);
    }

    res.json(settingsObj);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/settings
// @desc    Update festival settings (Super Admin only)
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

    const currentYear = settings.festivalYear || 2026;

    // Synchronize top-level fields with current year entry in idolSponsors
    if (!Array.isArray(settings.idolSponsors) || settings.idolSponsors.length === 0) {
      settings.idolSponsors = [
        {
          year: currentYear,
          name: settings.idolSponsorName || 'UPPUTURI VENKATA GANESH',
          details: settings.idolSponsorDetails || 'Grand 9ft Eco-Friendly Clay Ganesha Idol Seva',
          message: settings.idolSponsorMessage || 'Heartfelt gratitude and Lord Vinayaka blessings to the sponsor family for divine patronage.',
          amount: settings.idolSponsorAmount || '',
          photoUrl: settings.idolSponsorPhotoUrl || '',
          active: settings.idolSponsorActive !== false,
        },
      ];
    } else {
      // Find or add current year entry
      let currentEntry = settings.idolSponsors.find((s) => s.year === currentYear);
      if (currentEntry) {
        // If top-level fields were directly updated (e.g. sponsor photo upload), sync to currentEntry
        if (req.body.idolSponsorPhotoUrl !== undefined) currentEntry.photoUrl = req.body.idolSponsorPhotoUrl;
        if (req.body.idolSponsorName !== undefined) currentEntry.name = req.body.idolSponsorName;
        if (req.body.idolSponsorDetails !== undefined) currentEntry.details = req.body.idolSponsorDetails;
        if (req.body.idolSponsorMessage !== undefined) currentEntry.message = req.body.idolSponsorMessage;
        if (req.body.idolSponsorActive !== undefined) currentEntry.active = req.body.idolSponsorActive;

        // Also ensure top level reflects currentEntry
        settings.idolSponsorName = currentEntry.name;
        settings.idolSponsorPhotoUrl = currentEntry.photoUrl;
        settings.idolSponsorDetails = currentEntry.details;
        settings.idolSponsorMessage = currentEntry.message;
        settings.idolSponsorActive = currentEntry.active;
      } else {
        settings.idolSponsors.push({
          year: currentYear,
          name: settings.idolSponsorName || 'UPPUTURI VENKATA GANESH',
          details: settings.idolSponsorDetails || '',
          message: settings.idolSponsorMessage || '',
          photoUrl: settings.idolSponsorPhotoUrl || '',
          active: settings.idolSponsorActive !== false,
        });
      }
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
