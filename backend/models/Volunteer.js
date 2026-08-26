const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    skills: {
      type: String,
      trim: true,
    },
    availability: {
      type: String,
      trim: true,
    },
    assignedResponsibility: {
      type: String,
      required: true,
      enum: [
        'Decorations',
        'Food',
        'Cleaning',
        'Event Management',
        'Security',
        'Crowd Management',
        'Transportation',
        'Cultural Programs',
        'Puja Arrangements',
        'None',
      ],
      default: 'None',
    },
    status: {
      type: String,
      required: true,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Volunteer', volunteerSchema);
