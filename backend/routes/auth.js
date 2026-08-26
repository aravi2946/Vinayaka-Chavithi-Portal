const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const logActivity = require('../utils/logger');

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_vinayaka_key_123', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (user && user.status === 'Disabled') {
      return res.status(401).json({ message: 'This account has been disabled. Please contact the Super Admin.' });
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        status: user.status,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/users
// @desc    Get all committee users
// @access  Private/Super Admin
router.get('/users', protect, authorize('Super Admin'), async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/users
// @desc    Create a new committee user
// @access  Private/Super Admin
router.post('/users', protect, authorize('Super Admin'), async (req, res, next) => {
  const { username, password, role } = req.body;

  try {
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      password,
      role,
      status: 'Active',
    });

    if (user) {
      await logActivity({
        user: req.user.username,
        action: `Created user ${username} with role ${role}`,
        recordType: 'User',
        recordId: user._id,
        newValue: { username, role, status: 'Active' },
      });

      res.status(201).json({
        _id: user._id,
        username: user.username,
        role: user.role,
        status: user.status,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/users/:id
// @desc    Update committee user role or status
// @access  Private/Super Admin
router.put('/users/:id', protect, authorize('Super Admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.id || req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow Super Admin to disable themselves
    if (user.username === req.user.username && req.body.status === 'Disabled') {
      return res.status(400).json({ message: 'Super Admin cannot disable their own account' });
    }

    const prevValue = { role: user.role, status: user.status };

    if (req.body.role) user.role = req.body.role;
    if (req.body.status) user.status = req.body.status;
    if (req.body.password) user.password = req.body.password; // pre-save hook will hash it

    const updatedUser = await user.save();

    await logActivity({
      user: req.user.username,
      action: `Updated user ${user.username}`,
      recordType: 'User',
      recordId: user._id,
      previousValue: prevValue,
      newValue: { role: updatedUser.role, status: updatedUser.status },
    });

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      role: updatedUser.role,
      status: updatedUser.status,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete committee user
// @access  Private/Super Admin
router.delete('/users/:id', protect, authorize('Super Admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.username === req.user.username) {
      return res.status(400).json({ message: 'Super Admin cannot delete their own account' });
    }

    const username = user.username;
    await User.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user.username,
      action: `Deleted user ${username}`,
      recordType: 'User',
      recordId: req.params.id,
      previousValue: { username: user.username, role: user.role },
    });

    res.json({ message: `User ${username} deleted successfully` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
