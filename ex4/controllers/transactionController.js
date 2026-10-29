const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const { findPredefined } = require('../utils/categories');
const { getMonthRange, currentMonth } = require('../utils/monthRange');

const round = (n) => Math.round(n * 100) / 100;

const resolveCategory = async (name, userId) => {
  const predefined = findPredefined(name);
  if (predefined) return predefined;
  const custom = await Category.findOne({ user: userId, name })
    .collation({ locale: 'en', strength: 2 });
  return custom ? custom.name : null;
};

const unknownCategory = (res) => {
  return res.status(400).json({
    message: 'Unknown category, check GET /categories or add your own with POST /categories'
  });
};

const createTransaction = async (req, res) => {
  const category = await resolveCategory(req.body.category, req.user._id);
  if (!category) return unknownCategory(res);

  const transaction = await Transaction.create({ ...req.body, category, user: req.user._id });
  res.status(201).json(transaction);
};

const getTransactions = async (req, res) => {
  const { type, category, month } = req.query;
  const filter = { user: req.user._id };

  if (type) {
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'type must be income or expense' });
    }
    filter.type = type;
  }
  if (category) filter.category = category;
  if (month) {
    const range = getMonthRange(month);
    if (!range) return res.status(400).json({ message: 'month must be in YYYY-MM format' });
    filter.date = { $gte: range.start, $lt: range.end };
  }

  const transactions = await Transaction.find(filter)
    .collation({ locale: 'en', strength: 2 })
    .sort({ date: -1 });
  res.json({ count: transactions.length, transactions });
};

const getMonthlySummary = async (req, res) => {
  const month = req.query.month || currentMonth();
  const range = getMonthRange(month);
  if (!range) return res.status(400).json({ message: 'month must be in YYYY-MM format' });

  const rows = await Transaction.aggregate([
    { $match: { user: req.user._id, date: { $gte: range.start, $lt: range.end } } },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: { $abs: '$amount' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } }
  ]);

  const categories = rows.map(row => ({
    category: row._id.category,
    type: row._id.type,
    total: round(row.total),
    count: row.count
  }));

  const sum = (type) => round(
    categories.filter(c => c.type === type).reduce((total, c) => total + c.total, 0)
  );
  const income = sum('income');
  const expenses = sum('expense');

  res.json({ month, income, expenses, balance: round(income - expenses), categories });
};

const getTransaction = async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
  if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
  res.json(transaction);
};

const updateTransaction = async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
  if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

  if (req.body.category) {
    const category = await resolveCategory(req.body.category, req.user._id);
    if (!category) return unknownCategory(res);
    req.body.category = category;
  }

  Object.assign(transaction, req.body);
  await transaction.save();
  res.json(transaction);
};

const deleteTransaction = async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
  res.json({ message: 'Transaction deleted' });
};

module.exports = {
  createTransaction,
  getTransactions,
  getMonthlySummary,
  getTransaction,
  updateTransaction,
  deleteTransaction
};
