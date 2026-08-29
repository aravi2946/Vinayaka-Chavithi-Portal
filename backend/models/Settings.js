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
    contactPhone: {
      type: String,
      default: '+91 9948050484',
    },
    contactEmail: {
      type: String,
      default: 'srinarahari4@gmail.com',
    },
    contactLocation: {
      type: String,
      default: 'Central Mandap Arena',
    },
    paymentNumber: {
      type: String,
      default: '9948050484',
    },
    accountName: {
      type: String,
      default: 'UPPUTURI VENKATA GANESH',
    },
    liveStreamActive: {
      type: Boolean,
      default: false,
    },
    liveStreamUrl: {
      type: String,
      default: '',
    },
    liveStreamTitle: {
      type: String,
      default: 'Vinayaka Chavithi Mahotsavam - Live Darshanam',
    },
    liveStreamDescription: {
      type: String,
      default: 'Watch live morning & evening aarti, special homam, and cultural celebrations directly from the mandap.',
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
