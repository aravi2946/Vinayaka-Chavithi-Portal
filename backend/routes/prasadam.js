const express = require('express');
const router = express.Router();
const Prasadam = require('../models/Prasadam');
const { protect, authorize } = require('../middleware/authMiddleware');
const logActivity = require('../utils/logger');

// @route   GET /api/prasadam
// @desc    Get Prasadam entries (Public summary + detailed history)
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // All active entries sorted newest date first
    const allEntries = await Prasadam.find({ isDeleted: false })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    // Filter today's donors
    const todayEntries = allEntries.filter((item) => {
      const d = new Date(item.date);
      return d >= startOfToday && d <= endOfToday;
    });

    const totalEntriesCount = allEntries.length;
    const todayDonorsCount = todayEntries.length;

    res.json({
      todayDonors: todayEntries,
      todayCount: todayDonorsCount,
      totalCount: totalEntriesCount,
      allEntries,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/prasadam
// @desc    Add new Prasadam entry
// @access  Private (Super Admin, Food Admin)
router.post('/', protect, authorize('Super Admin', 'Food Admin'), async (req, res, next) => {
  const { date, donorName, item, notes } = req.body;

  try {
    if (!donorName || !donorName.trim()) {
      return res.status(400).json({ message: 'Donor name is required' });
    }
    if (!item || !item.trim()) {
      return res.status(400).json({ message: 'Prasadam item is required' });
    }

    const entry = await Prasadam.create({
      date: date ? new Date(date) : new Date(),
      donorName: donorName.trim(),
      item: item.trim(),
      notes: notes ? notes.trim() : '',
      addedBy: req.user.username,
    });

    await logActivity({
      user: req.user.username,
      action: `Added Prasadam entry for donor ${donorName.trim()} (${item.trim()})`,
      recordType: 'Prasadam',
      recordId: entry._id,
      newValue: entry.toObject(),
    });

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/prasadam/:id
// @desc    Update Prasadam entry
// @access  Private (Super Admin, Food Admin)
router.put('/:id', protect, authorize('Super Admin', 'Food Admin'), async (req, res, next) => {
  const { date, donorName, item, notes } = req.body;

  try {
    const entry = await Prasadam.findById(req.params.id);
    if (!entry || entry.isDeleted) {
      return res.status(404).json({ message: 'Prasadam entry not found' });
    }

    const prevValue = entry.toObject();

    if (date) entry.date = new Date(date);
    if (donorName) entry.donorName = donorName.trim();
    if (item) entry.item = item.trim();
    if (notes !== undefined) entry.notes = notes.trim();

    await entry.save();

    await logActivity({
      user: req.user.username,
      action: `Updated Prasadam entry ${entry._id}`,
      recordType: 'Prasadam',
      recordId: entry._id,
      previousValue: prevValue,
      newValue: entry.toObject(),
    });

    res.json(entry);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/prasadam/:id
// @desc    Delete (soft delete) Prasadam entry
// @access  Private (Super Admin, Food Admin)
router.delete('/:id', protect, authorize('Super Admin', 'Food Admin'), async (req, res, next) => {
  try {
    const entry = await Prasadam.findById(req.params.id);
    if (!entry || entry.isDeleted) {
      return res.status(404).json({ message: 'Prasadam entry not found' });
    }

    entry.isDeleted = true;
    await entry.save();

    await logActivity({
      user: req.user.username,
      action: `Deleted Prasadam entry of donor ${entry.donorName}`,
      recordType: 'Prasadam',
      recordId: entry._id,
      previousValue: entry.toObject(),
    });

    res.json({ message: 'Prasadam entry deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
