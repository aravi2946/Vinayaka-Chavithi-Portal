const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const { protect, authorize } = require('../middleware/authMiddleware');
const logActivity = require('../utils/logger');

// @route   GET /api/volunteers
// @desc    Get volunteers (Public sees active volunteers; Committee sees all)
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

    if (user && ['Super Admin', 'Volunteer Manager'].includes(user.role)) {
      const volunteers = await Volunteer.find({}).sort({ createdAt: -1 });
      return res.json(volunteers);
    } else {
      // Public sees active volunteers with their name, responsibility, area, and phone number
      const volunteers = await Volunteer.find({ status: 'Active' })
        .select('name assignedResponsibility area skills phone')
        .sort({ name: 1 });
      return res.json(volunteers);
    }
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/volunteers
// @desc    Create new volunteer
// @access  Private (Super Admin, Volunteer Manager)
router.post('/', protect, authorize('Super Admin', 'Volunteer Manager'), async (req, res, next) => {
  const { name, phone, area, skills, availability, assignedResponsibility, status } = req.body;

  try {
    const volunteer = await Volunteer.create({
      name,
      phone,
      area,
      skills,
      availability,
      assignedResponsibility: assignedResponsibility || 'Other',
      status: status || 'Active',
    });

    await logActivity({
      user: req.user.username,
      action: `Registered volunteer ${name}`,
      recordType: 'Volunteer',
      recordId: volunteer._id,
      newValue: volunteer.toObject(),
    });

    res.status(201).json(volunteer);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/volunteers/:id
// @desc    Update volunteer details/assignment
// @access  Private (Super Admin, Volunteer Manager)
router.put('/:id', protect, authorize('Super Admin', 'Volunteer Manager'), async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    const prevValue = volunteer.toObject();
    Object.assign(volunteer, req.body);
    const updatedVolunteer = await volunteer.save();

    await logActivity({
      user: req.user.username,
      action: `Updated volunteer ${volunteer.name}`,
      recordType: 'Volunteer',
      recordId: volunteer._id,
      previousValue: prevValue,
      newValue: updatedVolunteer.toObject(),
    });

    res.json(updatedVolunteer);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/volunteers/:id
// @desc    Delete volunteer
// @access  Private (Super Admin, Volunteer Manager)
router.delete('/:id', protect, authorize('Super Admin', 'Volunteer Manager'), async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    const name = volunteer.name;
    await Volunteer.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user.username,
      action: `Removed volunteer ${name}`,
      recordType: 'Volunteer',
      recordId: req.params.id,
      previousValue: volunteer.toObject(),
    });

    res.json({ message: `Volunteer ${name} removed successfully` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
