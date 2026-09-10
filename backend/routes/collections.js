const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/authMiddleware');
const logActivity = require('../utils/logger');
const { getNextCollectionId } = require('../utils/idGenerator');

// @route   GET /api/collections
// @desc    Get all collections (public/committee access with filters)
// @access  Public / Private (Committee)
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
        // Token verification failed, treat as public
      }
    }

    // Build filter query
    const filter = { isDeleted: false };
    
    // Committee members with correct roles can view all collections (Draft, Submitted, Approved)
    if (user && ['Super Admin', 'Treasurer', 'Event Manager', 'Volunteer Manager', 'Content Manager'].includes(user.role)) {
      if (req.query.approvalStatus) {
        filter.approvalStatus = req.query.approvalStatus;
      }
      if (req.query.paymentMode) {
        filter.paymentMode = req.query.paymentMode;
      }
      if (req.query.search) {
        filter.donorName = { $regex: req.query.search, $options: 'i' };
      }
      
      const collections = await Collection.find(filter).sort({ date: -1, createdAt: -1 });
      return res.json(collections);
    } else {
      // Public view
      const settings = await Settings.findOne({});
      const showDonorsList = settings && settings.publicCollectionVisibility !== undefined ? settings.publicCollectionVisibility : true;

      // Calculate total approved collections for public view (always public)
      const allApproved = await Collection.find({ approvalStatus: 'Approved', isDeleted: false });
      const totalAmount = allApproved.reduce((sum, item) => sum + item.amount, 0);
      const donorsCount = allApproved.length;

      let collections = [];
      if (showDonorsList) {
        // Fetch approved collections details. Hidden donors show as "Anonymous"
        const fetchedCollections = await Collection.find({ approvalStatus: 'Approved', isDeleted: false })
          .select('date donorName amount showPublicly')
          .sort({ date: -1, createdAt: -1 });

        collections = fetchedCollections.map(coll => ({
          _id: coll._id,
          date: coll.date,
          donorName: coll.showPublicly ? coll.donorName : 'Anonymous',
          amount: coll.amount,
        }));
      }

      return res.json({
        publicVisible: true, // Donation fund is always public
        showDonorsList,      // Setting toggle for detailed donor list
        totalAmount,
        donorsCount,
        collections,
      });
    }
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/collections/public-donate
// @desc    Submit an online UPI donation from public portal (creates Pending record for admin verification)
// @access  Public
router.post('/public-donate', async (req, res, next) => {
  const { donorName, amount, phone, paymentMode, paymentApp, transactionRef, purpose, notes, showPublicly } = req.body;

  try {
    if (!donorName || !donorName.trim()) {
      return res.status(400).json({ message: 'Please provide full donor name as in payment app' });
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid donation amount' });
    }

    if (transactionRef && transactionRef.trim()) {
      const duplicateRef = await Collection.findOne({ transactionRef: transactionRef.trim(), isDeleted: false });
      if (duplicateRef) {
        return res.status(400).json({ message: `Transaction reference "${transactionRef}" has already been submitted` });
      }
    }

    const collectionId = await getNextCollectionId();

    const collection = await Collection.create({
      collectionId,
      date: new Date(),
      donorName: donorName.trim(),
      phone: phone ? phone.trim() : '',
      amount: parsedAmount,
      paymentMode: paymentMode || 'UPI',
      transactionRef: transactionRef ? transactionRef.trim() : '',
      purpose: purpose || 'General Festival Seva Donation',
      notes: notes ? notes.trim() : (paymentApp ? `Online Donation via ${paymentApp}` : 'Online UPI Donation'),
      addedBy: 'Online Devotee',
      approvalStatus: 'Submitted', // Submitted = Pending verification by Admin
      showPublicly: showPublicly !== undefined ? Boolean(showPublicly) : true,
    });

    await logActivity({
      user: 'Online Devotee',
      action: 'Submitted Online UPI Donation',
      recordType: 'Collection',
      recordId: collection.collectionId,
      newValue: collection.toObject(),
    });

    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully! It is awaiting committee verification.',
      collection,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/collections
// @desc    Add a new collection
// @access  Private (Super Admin, Treasurer)
router.post('/', protect, authorize('Super Admin', 'Treasurer'), async (req, res, next) => {
  const { date, donorName, phone, amount, paymentMode, transactionRef, purpose, notes, approvalStatus, showPublicly } = req.body;

  try {
    if (!donorName || !donorName.trim()) {
      return res.status(400).json({ message: 'Donor name is required' });
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid donation amount' });
    }

    if (transactionRef && transactionRef.trim()) {
      const duplicateRef = await Collection.findOne({ transactionRef: transactionRef.trim(), isDeleted: false });
      if (duplicateRef) {
        return res.status(400).json({ message: `Warning: Transaction reference "${transactionRef}" already exists` });
      }
    }

    const collectionId = await getNextCollectionId();

    const collection = await Collection.create({
      collectionId,
      date: date ? new Date(date) : new Date(),
      donorName: donorName.trim(),
      phone: phone ? phone.trim() : '',
      amount: parsedAmount,
      paymentMode: paymentMode || 'Cash',
      transactionRef: transactionRef ? transactionRef.trim() : '',
      purpose: purpose || 'Festival Donation',
      notes: notes ? notes.trim() : '',
      addedBy: req.user.username,
      approvalStatus: approvalStatus || 'Draft',
      showPublicly: showPublicly !== undefined ? Boolean(showPublicly) : false,
    });

    await logActivity({
      user: req.user.username,
      action: 'Added Donation Collection',
      recordType: 'Collection',
      recordId: collection.collectionId,
      newValue: collection.toObject(),
    });

    res.status(201).json(collection);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/collections/bulk-import
// @desc    Batch import collections from Excel/CSV upload
// @access  Private (Super Admin, Treasurer)
router.post('/bulk-import', protect, authorize('Super Admin', 'Treasurer'), async (req, res, next) => {
  const { records, defaultStatus = 'Approved' } = req.body;

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: 'No records provided for import' });
  }

  try {
    const importedRecords = [];
    const importDate = new Date();

    for (const r of records) {
      if (!r.donorName || !r.donorName.trim()) continue;
      const parsedAmount = Number(r.amount);
      if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) continue;

      const collectionId = await getNextCollectionId();
      let recordDate = importDate;
      if (r.date) {
        const parsedD = new Date(r.date);
        if (!isNaN(parsedD.getTime())) {
          recordDate = parsedD;
        }
      }

      const newColl = await Collection.create({
        collectionId,
        date: recordDate,
        donorName: r.donorName.trim(),
        phone: r.phone ? String(r.phone).trim() : '',
        amount: parsedAmount,
        paymentMode: ['Cash', 'UPI', 'Bank Transfer', 'Other'].includes(r.paymentMode) ? r.paymentMode : 'Cash',
        transactionRef: r.transactionRef ? String(r.transactionRef).trim() : '',
        purpose: r.purpose ? String(r.purpose).trim() : 'Bulk Import Seva Donation',
        notes: r.notes ? String(r.notes).trim() : 'Imported via Excel/CSV',
        addedBy: req.user.username,
        approvalStatus: defaultStatus,
        showPublicly: r.showPublicly !== undefined ? Boolean(r.showPublicly) : true,
      });

      importedRecords.push(newColl);
    }

    await logActivity({
      user: req.user.username,
      action: `Bulk imported ${importedRecords.length} collection records`,
      recordType: 'Collection',
      recordId: `BATCH-${Date.now()}`,
      newValue: { count: importedRecords.length },
    });

    res.status(201).json({
      success: true,
      message: `Successfully imported ${importedRecords.length} collections`,
      count: importedRecords.length,
      records: importedRecords,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/collections/:id/toggle-visibility
// @desc    Toggle donor public visibility (Public vs Anonymous)
// @access  Private (Super Admin, Treasurer)
router.patch('/:id/toggle-visibility', protect, authorize('Super Admin', 'Treasurer'), async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection || collection.isDeleted) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    collection.showPublicly = !collection.showPublicly;
    await collection.save();

    await logActivity({
      user: req.user.username,
      action: `Toggled donor visibility for ${collection.collectionId} (${collection.showPublicly ? 'Public' : 'Anonymous'})`,
      recordType: 'Collection',
      recordId: collection.collectionId,
      newValue: { showPublicly: collection.showPublicly },
    });

    res.json({
      success: true,
      showPublicly: collection.showPublicly,
      message: `Visibility set to ${collection.showPublicly ? 'Public (Visible)' : 'Anonymous (Hidden)'}`,
      collection,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/collections/:id
// @desc    Edit a collection
// @access  Private (Super Admin, Treasurer)
router.put('/:id', protect, authorize('Super Admin', 'Treasurer'), async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection || collection.isDeleted) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const prevValue = collection.toObject();

    // Prevent double transaction references
    if (req.body.transactionRef && req.body.transactionRef !== collection.transactionRef) {
      const duplicateRef = await Collection.findOne({ transactionRef: req.body.transactionRef, isDeleted: false });
      if (duplicateRef) {
        return res.status(400).json({ message: 'Transaction reference already exists' });
      }
    }

    Object.assign(collection, req.body);
    collection.updatedDate = Date.now();
    const updatedCollection = await collection.save();

    await logActivity({
      user: req.user.username,
      action: 'Edited Donation Collection',
      recordType: 'Collection',
      recordId: collection.collectionId,
      previousValue: prevValue,
      newValue: updatedCollection.toObject(),
    });

    res.json(updatedCollection);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/collections/:id/approve
// @desc    Approve a collection
// @access  Private (Super Admin, Treasurer)
router.put('/:id/approve', protect, authorize('Super Admin', 'Treasurer'), async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection || collection.isDeleted) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Require two-person approval optionally (not approving own restricted changes)
    if (collection.addedBy === req.user.username && req.user.role !== 'Super Admin') {
      return res.status(400).json({
        message: 'Dual control: You cannot approve a collection record you originally entered. Please ask another Treasurer or Super Admin.',
      });
    }

    const prevValue = collection.toObject();
    collection.approvalStatus = 'Approved';
    const approvedCollection = await collection.save();

    await logActivity({
      user: req.user.username,
      action: 'Approved Donation Collection',
      recordType: 'Collection',
      recordId: collection.collectionId,
      previousValue: prevValue,
      newValue: approvedCollection.toObject(),
    });

    res.json(approvedCollection);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/collections/:id
// @desc    Soft delete a collection (releases numeric ID so future IDs don't inflate)
// @access  Private (Super Admin, Treasurer)
router.delete('/:id', protect, authorize('Super Admin', 'Treasurer'), async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection || collection.isDeleted) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const originalId = collection.collectionId;
    const prevValue = collection.toObject();

    collection.isDeleted = true;
    collection.deletedAt = Date.now();
    // Rename collectionId to release numeric slot
    collection.collectionId = `${originalId}_DELETED_${Date.now()}`;
    await collection.save();

    await logActivity({
      user: req.user.username,
      action: 'Deleted Donation Collection (Soft-Delete & Slot Released)',
      recordType: 'Collection',
      recordId: originalId,
      previousValue: prevValue,
      newValue: { isDeleted: true, deletedAt: collection.deletedAt },
    });

    res.json({ message: `Collection ${originalId} soft-deleted successfully` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
