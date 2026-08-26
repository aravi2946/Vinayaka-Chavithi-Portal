const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema(
  {
    collectionId: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    donorName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be greater than zero'],
    },
    paymentMode: {
      type: String,
      required: true,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Other'],
      default: 'Cash',
    },
    transactionRef: {
      type: String,
      trim: true,
    },
    purpose: {
      type: String,
      default: 'Festival Donation',
    },
    notes: {
      type: String,
    },
    addedBy: {
      type: String,
      required: true,
    },
    approvalStatus: {
      type: String,
      required: true,
      enum: ['Draft', 'Submitted', 'Approved'],
      default: 'Draft',
    },
    showPublicly: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Collection', collectionSchema);
