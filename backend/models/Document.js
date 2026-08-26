const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    documentName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    visibility: {
      type: String,
      required: true,
      enum: ['Public', 'Committee Only'],
      default: 'Committee Only',
    },
    documentType: {
      type: String,
      required: true,
      default: 'Rules',
    },
    addedBy: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', documentSchema);
