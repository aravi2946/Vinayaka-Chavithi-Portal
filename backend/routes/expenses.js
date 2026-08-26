const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Collection = require('../models/Collection');
const Budget = require('../models/Budget');
const { protect, authorize } = require('../middleware/authMiddleware');
const logActivity = require('../utils/logger');

// STRICT PRIVACY REQUIREMENT: Lock down this entire router to Super Admin and Treasurer roles
router.use(protect);
router.use(authorize('Super Admin', 'Treasurer'));

// ==========================================
// BUDGET ENDPOINTS
// ==========================================

// @route   GET /api/expenses/budgets
// @desc    Get all category budgets
// @access  Private (Super Admin, Treasurer)
router.get('/budgets', async (req, res, next) => {
  try {
    const budgets = await Budget.find({});
    res.json(budgets);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/expenses/budgets
// @desc    Upsert budgets
// @access  Private (Super Admin, Treasurer)
router.put('/budgets', async (req, res, next) => {
  const { category, budgetedAmount } = req.body;
  try {
    let budget = await Budget.findOne({ category });
    let prevValue = budget ? budget.toObject() : {};

    if (budget) {
      budget.budgetedAmount = budgetedAmount;
      await budget.save();
    } else {
      budget = await Budget.create({ category, budgetedAmount });
    }

    await logActivity({
      user: req.user.username,
      action: `Set budget for ${category}`,
      recordType: 'Budget',
      recordId: budget._id,
      previousValue: prevValue,
      newValue: budget.toObject(),
    });

    res.json(budget);
  } catch (error) {
    next(error);
  }
});

// ==========================================
// EXPENSE ENDPOINTS
// ==========================================

// @route   GET /api/expenses
// @desc    Get all expenses with filters
// @access  Private (Super Admin, Treasurer)
router.get('/', async (req, res, next) => {
  try {
    const filter = { isDeleted: false };

    if (req.query.approvalStatus) {
      filter.approvalStatus = req.query.approvalStatus;
    }
    if (req.query.expenseCategory) {
      filter.expenseCategory = req.query.expenseCategory;
    }
    if (req.query.search) {
      filter.description = { $regex: req.query.search, $options: 'i' };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/expenses/dashboard
// @desc    Get committee financial statistics & budget vs actual comparison
// @access  Private (Super Admin, Treasurer)
router.get('/dashboard', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // APPROVED FINANCIALS (Non-deleted)
    const approvedCollections = await Collection.find({ approvalStatus: 'Approved', isDeleted: false });
    const approvedExpenses = await Expense.find({ approvalStatus: 'Approved', isDeleted: false });

    // CALCS
    const totalCollections = approvedCollections.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = approvedExpenses.reduce((sum, item) => sum + item.amount, 0);
    const remainingBalance = totalCollections - totalExpenses;

    // TODAY'S CALCS
    const todayCollections = approvedCollections
      .filter((c) => new Date(c.date) >= today)
      .reduce((sum, item) => sum + item.amount, 0);

    // MONTH'S CALCS
    const monthlyCollections = approvedCollections
      .filter((c) => new Date(c.date) >= firstOfMonth)
      .reduce((sum, item) => sum + item.amount, 0);

    const monthlyExpenses = approvedExpenses
      .filter((e) => new Date(e.date) >= firstOfMonth)
      .reduce((sum, item) => sum + item.amount, 0);

    const donorCount = approvedCollections.length;

    // CATEGORY COMPARISON
    const categoriesList = [
      'Decorations',
      'Puja materials',
      'Food/Annadanam',
      'Sound system',
      'Lighting',
      'Stage',
      'Transportation',
      'Security',
      'Cultural programs',
      'Printing',
      'Cleaning',
      'Other',
    ];

    const categoryBudgets = await Budget.find({});
    const budgetMap = {};
    categoryBudgets.forEach((b) => {
      budgetMap[b.category] = b.budgetedAmount;
    });

    const categoryActuals = {};
    categoriesList.forEach((cat) => {
      categoryActuals[cat] = 0;
    });

    approvedExpenses.forEach((exp) => {
      if (categoryActuals[exp.expenseCategory] !== undefined) {
        categoryActuals[exp.expenseCategory] += exp.amount;
      } else {
        categoryActuals[exp.expenseCategory] = exp.amount;
      }
    });

    const budgetVsActual = categoriesList.map((cat) => {
      const budgetVal = budgetMap[cat] || 0;
      const actualVal = categoryActuals[cat] || 0;
      return {
        category: cat,
        budget: budgetVal,
        actual: actualVal,
        remaining: budgetVal - actualVal,
        percentUsed: budgetVal > 0 ? Math.round((actualVal / budgetVal) * 100) : 0,
      };
    });

    res.json({
      totalCollections,
      totalExpenses,
      remainingBalance,
      todayCollections,
      monthlyCollections,
      monthlyExpenses,
      donorCount,
      budgetVsActual,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/expenses
// @desc    Add a new expense record
// @access  Private (Super Admin, Treasurer)
router.post('/', async (req, res, next) => {
  const { date, expenseCategory, description, amount, paidTo, paymentMode, billReceiptNo, notes, approvalStatus } = req.body;

  try {
    const count = await Expense.countDocuments({});
    const expenseId = `EXP-${1000 + count + 1}`;

    const expense = await Expense.create({
      expenseId,
      date,
      expenseCategory,
      description,
      amount,
      paidTo,
      paymentMode,
      billReceiptNo,
      notes,
      addedBy: req.user.username,
      approvalStatus: approvalStatus || 'Draft',
    });

    await logActivity({
      user: req.user.username,
      action: 'Added Expense Record',
      recordType: 'Expense',
      recordId: expense.expenseId,
      newValue: expense.toObject(),
    });

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/expenses/:id
// @desc    Edit an expense
// @access  Private (Super Admin, Treasurer)
router.put('/:id', async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense || expense.isDeleted) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const prevValue = expense.toObject();

    Object.assign(expense, req.body);
    expense.updatedDate = Date.now();
    const updatedExpense = await expense.save();

    await logActivity({
      user: req.user.username,
      action: 'Edited Expense Record',
      recordType: 'Expense',
      recordId: expense.expenseId,
      previousValue: prevValue,
      newValue: updatedExpense.toObject(),
    });

    res.json(updatedExpense);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/expenses/:id/approve
// @desc    Approve an expense
// @access  Private (Super Admin, Treasurer)
router.put('/:id/approve', async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense || expense.isDeleted) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Require two-person approval
    if (expense.addedBy === req.user.username && req.user.role !== 'Super Admin') {
      return res.status(400).json({
        message: 'Dual control: You cannot approve an expense record you originally entered. Please ask another Treasurer or Super Admin.',
      });
    }

    const prevValue = expense.toObject();
    expense.approvalStatus = 'Approved';
    const approvedExpense = await expense.save();

    await logActivity({
      user: req.user.username,
      action: 'Approved Expense Record',
      recordType: 'Expense',
      recordId: expense.expenseId,
      previousValue: prevValue,
      newValue: approvedExpense.toObject(),
    });

    res.json(approvedExpense);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Soft delete an expense
// @access  Private (Super Admin, Treasurer)
router.delete('/:id', async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense || expense.isDeleted) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const prevValue = expense.toObject();
    expense.isDeleted = true;
    expense.deletedAt = Date.now();
    await expense.save();

    await logActivity({
      user: req.user.username,
      action: 'Deleted Expense Record (Soft-Delete)',
      recordType: 'Expense',
      recordId: expense.expenseId,
      previousValue: prevValue,
      newValue: { isDeleted: true, deletedAt: expense.deletedAt },
    });

    res.json({ message: `Expense ${expense.expenseId} soft-deleted successfully` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
