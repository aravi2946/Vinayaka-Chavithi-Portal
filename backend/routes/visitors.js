const express = require('express');
const router = express.Router();
const VisitorLog = require('../models/VisitorLog');
const { protect, authorize } = require('../middleware/authMiddleware');

// Format date as YYYY-MM-DD in UTC / local
const getTodayStr = (d = new Date()) => {
  return d.toISOString().split('T')[0];
};

// @route   POST /api/visitors/track
// @desc    Log unique visitor per day (refreshes on same day do not count duplicate)
// @access  Public
router.post('/track', async (req, res, next) => {
  const { visitorId } = req.body;

  if (!visitorId || typeof visitorId !== 'string' || visitorId.trim().length === 0) {
    return res.status(400).json({ message: 'visitorId is required' });
  }

  const dateStr = getTodayStr();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  try {
    // Upsert so if this visitorId has already been recorded today, it updates without creating duplicate
    await VisitorLog.updateOne(
      { visitorId: visitorId.trim(), dateStr },
      {
        $setOnInsert: {
          visitorId: visitorId.trim(),
          dateStr,
          ip: typeof ip === 'string' ? ip.split(',')[0].trim() : '',
          userAgent: userAgent.slice(0, 200),
        },
      },
      { upsert: true }
    );

    res.json({ recorded: true });
  } catch (error) {
    // Ignore duplicate key collision on race condition
    if (error.code === 11000) {
      return res.json({ recorded: true });
    }
    next(error);
  }
});

// @route   GET /api/visitors/stats
// @desc    Get unique visitors statistics (Today, Week, Month, Total)
// @access  Private (Super Admin, Committee)
router.get('/stats', protect, authorize('Super Admin', 'Treasurer', 'Event Manager', 'Volunteer Manager', 'Content Manager'), async (req, res, next) => {
  try {
    const now = new Date();
    const todayStr = getTodayStr(now);

    // 7 days ago string
    const weekAgoDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAgoStr = getTodayStr(weekAgoDate);

    // 30 days ago string
    const monthAgoDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthAgoStr = getTodayStr(monthAgoDate);

    // 1. Today unique visitors
    const todayDistinct = await VisitorLog.distinct('visitorId', { dateStr: todayStr });
    const todayCount = todayDistinct.length;

    // 2. Last 7 Days unique visitors
    const weekDistinct = await VisitorLog.distinct('visitorId', { dateStr: { $gte: weekAgoStr } });
    const weekCount = weekDistinct.length;

    // 3. Last 30 Days unique visitors
    const monthDistinct = await VisitorLog.distinct('visitorId', { dateStr: { $gte: monthAgoStr } });
    const monthCount = monthDistinct.length;

    // 4. All-time unique visitors
    const totalDistinct = await VisitorLog.distinct('visitorId');
    const totalCount = totalDistinct.length;

    res.json({
      today: todayCount,
      week: weekCount,
      month: monthCount,
      total: totalCount,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
