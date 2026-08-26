const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const { protect, authorize } = require('../middleware/authMiddleware');
const logActivity = require('../utils/logger');

// ==========================================
// EVENTS MANAGEMENT
// ==========================================

// @route   GET /api/events
// @desc    Get events (Public see published; Committee see all)
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
        // failed token, treat as public
      }
    }

    if (user && ['Super Admin', 'Event Manager'].includes(user.role)) {
      const events = await Event.find({}).sort({ date: 1, startTime: 1 });
      return res.json(events);
    } else {
      // Public see only published events
      const events = await Event.find({ isPublished: true }).sort({ date: 1, startTime: 1 });
      return res.json(events);
    }
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private (Super Admin, Event Manager)
router.post('/', protect, authorize('Super Admin', 'Event Manager'), async (req, res, next) => {
  const { eventName, date, startTime, endTime, venue, description, organizer, maxParticipants, registrationRequired, status, isPublished } = req.body;

  try {
    // Basic Time Validation
    if (startTime && endTime && startTime > endTime) {
      return res.status(400).json({ message: 'Event end time cannot be before start time' });
    }

    const count = await Event.countDocuments({});
    const eventId = `EVT-${1000 + count + 1}`;

    const event = await Event.create({
      eventId,
      eventName,
      date,
      startTime,
      endTime,
      venue,
      description,
      organizer,
      maxParticipants: maxParticipants || 0,
      registrationRequired: registrationRequired || false,
      status: status || 'Active',
      isPublished: isPublished !== undefined ? isPublished : true,
    });

    await logActivity({
      user: req.user.username,
      action: 'Created Event',
      recordType: 'Event',
      recordId: event.eventId,
      newValue: event.toObject(),
    });

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/events/:id
// @desc    Edit event
// @access  Private (Super Admin, Event Manager)
router.put('/:id', protect, authorize('Super Admin', 'Event Manager'), async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (req.body.startTime && req.body.endTime && req.body.startTime > req.body.endTime) {
      return res.status(400).json({ message: 'Event end time cannot be before start time' });
    }

    const prevValue = event.toObject();
    Object.assign(event, req.body);
    const updatedEvent = await event.save();

    await logActivity({
      user: req.user.username,
      action: 'Updated Event',
      recordType: 'Event',
      recordId: event.eventId,
      previousValue: prevValue,
      newValue: updatedEvent.toObject(),
    });

    res.json(updatedEvent);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Super Admin, Event Manager)
router.delete('/:id', protect, authorize('Super Admin', 'Event Manager'), async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const eventId = event.eventId;
    await Event.findByIdAndDelete(req.params.id);

    // Clean up corresponding registrations
    await EventRegistration.deleteMany({ event: req.params.id });

    await logActivity({
      user: req.user.username,
      action: 'Deleted Event',
      recordType: 'Event',
      recordId: eventId,
      previousValue: event.toObject(),
    });

    res.json({ message: `Event ${eventId} deleted successfully` });
  } catch (error) {
    next(error);
  }
});


// ==========================================
// REGISTRATIONS MANAGEMENT
// ==========================================

// @route   POST /api/events/:id/register
// @desc    Register a participant (Public / Committee)
// @access  Public
router.post('/:id/register', async (req, res, next) => {
  const { participantName, age, phone, category } = req.body;

  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.registrationRequired) {
      return res.status(400).json({ message: 'Registration is not required for this event' });
    }

    if (event.status !== 'Active') {
      return res.status(400).json({ message: 'Registration is closed for this event' });
    }

    // Check capacity limit
    if (event.maxParticipants > 0) {
      const currentCount = await EventRegistration.countDocuments({ event: event._id, registrationStatus: { $ne: 'Rejected' } });
      if (currentCount >= event.maxParticipants) {
        return res.status(400).json({ message: 'Registration full. Maximum participants reached.' });
      }
    }

    // Create Registration (Defaults to Pending)
    const registration = await EventRegistration.create({
      participantName,
      age,
      phone,
      event: event._id,
      category: category || 'General',
      registrationStatus: 'Pending',
    });

    res.status(201).json({
      message: 'Registration submitted successfully! Status is currently Pending approval by the committee.',
      registration,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/events/registrations/all
// @desc    Get all event registrations (Committee)
// @access  Private (Super Admin, Event Manager)
router.get('/registrations/all', protect, authorize('Super Admin', 'Event Manager'), async (req, res, next) => {
  try {
    const registrations = await EventRegistration.find({})
      .populate('event', 'eventId eventName date startTime venue')
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/events/registrations/:regId
// @desc    Update registration status
// @access  Private (Super Admin, Event Manager)
router.put('/registrations/:regId', protect, authorize('Super Admin', 'Event Manager'), async (req, res, next) => {
  const { registrationStatus } = req.body;

  try {
    const registration = await EventRegistration.findById(req.params.regId).populate('event', 'eventName');
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const prevValue = registration.toObject();
    registration.registrationStatus = registrationStatus;
    const updatedReg = await registration.save();

    await logActivity({
      user: req.user.username,
      action: `Updated Event Registration status for ${registration.participantName} to ${registrationStatus}`,
      recordType: 'EventRegistration',
      recordId: registration._id,
      previousValue: prevValue,
      newValue: updatedReg.toObject(),
    });

    res.json(updatedReg);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/events/registrations/:regId
// @desc    Delete event registration
// @access  Private (Super Admin, Event Manager)
router.delete('/registrations/:regId', protect, authorize('Super Admin', 'Event Manager'), async (req, res, next) => {
  try {
    const registration = await EventRegistration.findById(req.params.regId);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    await EventRegistration.findByIdAndDelete(req.params.regId);

    await logActivity({
      user: req.user.username,
      action: `Deleted Event Registration for ${registration.participantName}`,
      recordType: 'EventRegistration',
      recordId: req.params.regId,
      previousValue: registration.toObject(),
    });

    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
