const mongoose = require('mongoose');

const visitorLogSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      index: true,
    },
    dateStr: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    ip: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: 1 record per visitorId per day
visitorLogSchema.index({ visitorId: 1, dateStr: 1 }, { unique: true });

module.exports = mongoose.model('VisitorLog', visitorLogSchema);
