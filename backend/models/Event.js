const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
    },
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // HH:MM
      required: true,
    },
    endTime: {
      type: String, // HH:MM
      required: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    organizer: {
      type: String,
    },
    maxParticipants: {
      type: Number,
      default: 0, // 0 means no limit
    },
    registrationRequired: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: String,
      required: true,
      enum: ['Active', 'Cancelled', 'Completed'],
      default: 'Active',
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

module.exports = mongoose.model('Event', eventSchema);
