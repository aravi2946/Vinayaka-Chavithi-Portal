const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    budgetedAmount: {
      type: Number,
      required: true,
      min: [0, 'Budgeted amount cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Budget', budgetSchema);
