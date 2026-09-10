const mongoose = require('mongoose');

const prasadamSchema = new mongoose.Schema(
  {
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
    item: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    addedBy: {
      type: String,
      default: 'Admin',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Prasadam', prasadamSchema);
