const { z } = require('zod');

const categorySchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(30, 'name is too long')
});

module.exports = { categorySchema };
