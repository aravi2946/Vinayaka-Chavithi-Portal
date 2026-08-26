const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    caption: {
      type: String,
      required: true,
      trim: true,
    },
    eventCategory: {
      type: String,
      required: true,
      enum: ['Sthapana', 'Cultural Programs', 'Annadanam', 'Competitions', 'Decorations', 'Nimajjanam', 'Other'],
      default: 'Other',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isPublished: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Gallery', gallerySchema);
