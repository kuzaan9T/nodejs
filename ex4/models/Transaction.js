const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true, trim: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

transactionSchema.pre('validate', function () {
  if (typeof this.amount !== 'number') return;
  this.amount = this.type === 'expense' ? -Math.abs(this.amount) : Math.abs(this.amount);
});

module.exports = mongoose.model('Transaction', transactionSchema);
