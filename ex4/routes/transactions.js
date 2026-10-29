const express = require('express');
const {
  createTransaction,
  getTransactions,
  getMonthlySummary,
  getTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');
const { protect } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { transactionSchema, updateTransactionSchema } = require('../validators/transactionSchemas');

const router = express.Router();

router.use(protect);

router.get('/monthly-summary', getMonthlySummary);
router.route('/')
  .get(getTransactions)
  .post(validate(transactionSchema), createTransaction);
router.route('/:id')
  .get(getTransaction)
  .put(validate(updateTransactionSchema), updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
