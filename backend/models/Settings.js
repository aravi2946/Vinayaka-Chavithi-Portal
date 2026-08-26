const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    festivalName: {
      type: String,
      required: true,
      default: 'Vinayaka Chavithi Celebration',
    },
    committeeName: {
      type: String,
      required: true,
      default: 'Sri Vinayaka Festival Committee',
    },
    festivalYear: {
      type: Number,
      required: true,
      default: 2026,
    },
    festivalDates: {
      type: String,
      required: true,
      default: 'September 14 - September 19, 2026',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    ganeshaImageUrl: {
      type: String,
      default: '',
    },
    contactInfo: {
      type: String,
      default: '+91 9948050484',
    },
    paymentNumber: {
      type: String,
      default: '9948050484',
    },
    accountName: {
      type: String,
      default: 'UPPUTURI VENKATA GANESH',
    },
    publicCollectionVisibility: {
      type: Boolean,
      required: true,
      default: true,
    },
    registrationSettings: {
      type: Boolean,
      required: true,
      default: true,
    },
    announcementSettings: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Settings', settingsSchema);
