const { z } = require('zod');

const transactionSchema = z.object({
  title: z.string().trim().min(1, 'title is required'),
  amount: z.number().refine(n => n !== 0, 'amount cannot be 0'),
  type: z.enum(['income', 'expense']),
  category: z.string().trim().min(1, 'category is required'),
  date: z.coerce.date({ error: 'date must be a valid date like 2025-05-27' }).optional()
});

const updateTransactionSchema = transactionSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, 'Send at least one field to update');

module.exports = { transactionSchema, updateTransactionSchema };
