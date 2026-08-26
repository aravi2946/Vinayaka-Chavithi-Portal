const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const { protect, authorize } = require('../middleware/authMiddleware');
const logActivity = require('../utils/logger');

// Restrict to Super Admin and Volunteer Manager
router.use(protect);
router.use(authorize('Super Admin', 'Volunteer Manager'));

// @route   GET /api/volunteers
// @desc    Get all volunteers
// @access  Private (Super Admin, Volunteer Manager)
router.get('/', async (req, res, next) => {
  try {
    const volunteers = await Volunteer.find({}).sort({ createdAt: -1 });
    res.json(volunteers);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/volunteers
// @desc    Create new volunteer
// @access  Private (Super Admin, Volunteer Manager)
router.post('/', async (req, res, next) => {
  const { name, phone, area, skills, availability, assignedResponsibility, status } = req.body;

  try {
    const volunteer = await Volunteer.create({
      name,
      phone,
      area,
      skills,
      availability,
      assignedResponsibility: assignedResponsibility || 'None',
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
router.put('/:id', async (req, res, next) => {
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
router.delete('/:id', async (req, res, next) => {
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
