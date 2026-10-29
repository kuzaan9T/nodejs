const User = require('../models/User');
const Transaction = require('../models/Transaction');

const getOverview = async (req, res) => {
  const [totalUsers, totalTransactions, totals, topSpendingCategories] = await Promise.all([
    User.countDocuments(),
    Transaction.countDocuments(),
    Transaction.aggregate([
      { $group: { _id: '$type', total: { $sum: { $abs: '$amount' } } } }
    ]),
    Transaction.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: { $abs: '$amount' } }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, category: '$_id', total: { $round: ['$total', 2] }, count: '$count' } }
    ])
  ]);

  const totalFor = (type) => {
    const total = totals.find(t => t._id === type)?.total || 0;
    return Math.round(total * 100) / 100;
  };

  res.json({
    totalUsers,
    totalTransactions,
    totalIncome: totalFor('income'),
    totalExpenses: totalFor('expense'),
    topSpendingCategories
  });
};

module.exports = { getOverview };
