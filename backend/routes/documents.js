const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { protect, authorize } = require('../middleware/authMiddleware');
const logActivity = require('../utils/logger');

// @route   GET /api/documents
// @desc    Get documents (Public see Public visibility; Committee see all)
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

    if (user && ['Super Admin', 'Treasurer', 'Event Manager', 'Volunteer Manager', 'Content Manager'].includes(user.role)) {
      const documents = await Document.find({}).sort({ date: -1 });
      return res.json(documents);
    } else {
      // Public access to documents is disabled
      return res.json([]);
    }
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/documents
// @desc    Add new document reference
// @access  Private (Committee)
router.post('/', protect, async (req, res, next) => {
  const { documentName, fileUrl, visibility, documentType, date } = req.body;

  try {
    // Financial documents MUST default to Committee Only
    let finalVisibility = visibility;
    if (documentType === 'Financial Report' || documentType === 'Financial') {
      finalVisibility = 'Committee Only';
    }

    const document = await Document.create({
      documentName,
      fileUrl,
      visibility: finalVisibility || 'Committee Only',
      documentType: documentType || 'Rules',
      addedBy: req.user.username,
      date,
    });

    await logActivity({
      user: req.user.username,
      action: `Uploaded document reference "${documentName}"`,
      recordType: 'Document',
      recordId: document._id,
      newValue: document.toObject(),
    });

    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/documents/:id
// @desc    Update document visibility or name
// @access  Private (Committee)
router.put('/:id', protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const prevValue = document.toObject();
    
    // Financial documents MUST default to Committee Only
    if (req.body.documentType === 'Financial Report' && req.body.visibility !== 'Committee Only') {
      req.body.visibility = 'Committee Only';
    }

    Object.assign(document, req.body);
    const updatedDoc = await document.save();

    await logActivity({
      user: req.user.username,
      action: `Updated document "${document.documentName}"`,
      recordType: 'Document',
      recordId: document._id,
      previousValue: prevValue,
      newValue: updatedDoc.toObject(),
    });

    res.json(updatedDoc);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private (Committee)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const documentName = document.documentName;
    await Document.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user.username,
      action: `Deleted document "${documentName}"`,
      recordType: 'Document',
      recordId: req.params.id,
      previousValue: document.toObject(),
    });

    res.json({ message: `Document "${documentName}" deleted successfully` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
