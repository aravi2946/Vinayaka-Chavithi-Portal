const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    expenseId: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expenseCategory: {
      type: String,
      required: true,
      enum: [
        'Decorations',
        'Puja materials',
        'Food/Annadanam',
        'Sound system',
        'Lighting',
        'Stage',
        'Transportation',
        'Security',
        'Cultural programs',
        'Printing',
        'Cleaning',
        'Other',
      ],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be greater than zero'],
    },
    paidTo: {
      type: String,
      required: true,
      trim: true,
    },
    paymentMode: {
      type: String,
      required: true,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Other'],
      default: 'Cash',
    },
    billReceiptNo: {
      type: String,
      trim: true,
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

module.exports = mongoose.model('Expense', expenseSchema);
