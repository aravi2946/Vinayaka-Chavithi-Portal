const AuditLog = require('../models/AuditLog');

const logActivity = async ({ user, action, recordType, recordId, previousValue = '', newValue = '' }) => {
  try {
    await AuditLog.create({
      user: user || 'System',
      action,
      recordType,
      recordId: String(recordId),
      previousValue: typeof previousValue === 'object' ? JSON.stringify(previousValue) : String(previousValue),
      newValue: typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue),
    });
  } catch (error) {
    console.error('Failed to log audit activity:', error);
  }
};

module.exports = logActivity;
