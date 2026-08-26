const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/authMiddleware');

// Restrict to Super Admin only
router.get('/', protect, authorize('Super Admin'), async (req, res, next) => {
  try {
    const logs = await AuditLog.find({}).sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
