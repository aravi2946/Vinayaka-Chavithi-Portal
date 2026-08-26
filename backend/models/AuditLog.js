const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true, // e.g., 'Collection Added', 'Expense Deleted'
  },
  recordType: {
    type: String,
    required: true, // e.g., 'Collection', 'Expense', 'Event'
  },
  recordId: {
    type: String,
    required: true,
  },
  previousValue: {
    type: String, // Stringified JSON of previous state
    default: '',
  },
  newValue: {
    type: String, // Stringified JSON of new state
    default: '',
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
