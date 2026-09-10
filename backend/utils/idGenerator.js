const Collection = require('../models/Collection');
const Expense = require('../models/Expense');

/**
 * Get next available Collection ID without inflation from deleted records.
 * Finds the smallest unused number >= 1001 among active records.
 */
async function getNextCollectionId() {
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Find all active (non-deleted) collection IDs
    const activeCollections = await Collection.find(
      { isDeleted: false, collectionId: { $regex: '^COLL-\\d+$' } },
      { collectionId: 1 }
    ).lean();

    const usedNumbers = new Set();
    for (const c of activeCollections) {
      const match = c.collectionId.match(/^COLL-(\d+)$/);
      if (match) {
        usedNumbers.add(parseInt(match[1], 10));
      }
    }

    // Find the lowest available number >= 1001
    let nextNum = 1001;
    while (usedNumbers.has(nextNum)) {
      nextNum++;
    }

    const candidateId = `COLL-${nextNum}`;

    // Verify candidate doesn't exist in any document (including un-renamed soft-deleted records)
    const exists = await Collection.findOne({ collectionId: candidateId });
    if (!exists) {
      return candidateId;
    }

    // If an old deleted record had this candidateId, rename the deleted record's ID to free it
    if (exists.isDeleted) {
      try {
        await Collection.updateOne(
          { _id: exists._id },
          { $set: { collectionId: `${candidateId}_DELETED_${Date.now()}` } }
        );
        return candidateId;
      } catch (err) {
        // Collision, retry next loop
      }
    }

    // If an active record has candidateId (race condition), add candidate to usedNumbers and loop
    usedNumbers.add(nextNum);
  }

  // Fallback timestamp-based safe ID if all attempts fail
  return `COLL-${Date.now().toString().slice(-6)}`;
}

/**
 * Get next available Expense ID without inflation from deleted records.
 * Finds the smallest unused number >= 1001 among active records.
 */
async function getNextExpenseId() {
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Find all active (non-deleted) expense IDs
    const activeExpenses = await Expense.find(
      { isDeleted: false, expenseId: { $regex: '^EXP-\\d+$' } },
      { expenseId: 1 }
    ).lean();

    const usedNumbers = new Set();
    for (const e of activeExpenses) {
      const match = e.expenseId.match(/^EXP-(\d+)$/);
      if (match) {
        usedNumbers.add(parseInt(match[1], 10));
      }
    }

    // Find the lowest available number >= 1001
    let nextNum = 1001;
    while (usedNumbers.has(nextNum)) {
      nextNum++;
    }

    const candidateId = `EXP-${nextNum}`;

    // Verify candidate doesn't exist in any document
    const exists = await Expense.findOne({ expenseId: candidateId });
    if (!exists) {
      return candidateId;
    }

    // If an old deleted record had this candidateId, rename it to free the number
    if (exists.isDeleted) {
      try {
        await Expense.updateOne(
          { _id: exists._id },
          { $set: { expenseId: `${candidateId}_DELETED_${Date.now()}` } }
        );
        return candidateId;
      } catch (err) {
        // Collision, retry next loop
      }
    }

    usedNumbers.add(nextNum);
  }

  return `EXP-${Date.now().toString().slice(-6)}`;
}

module.exports = {
  getNextCollectionId,
  getNextExpenseId,
};
