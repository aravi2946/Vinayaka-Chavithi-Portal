const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema(
  {
    participantName: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: [1, 'Age must be valid'],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    registrationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    registrationStatus: {
      type: String,
      required: true,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
