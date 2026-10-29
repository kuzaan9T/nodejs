const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  email: z.email('email must be a valid email'),
  password: z.string().min(6, 'password must be at least 6 characters'),
  role: z.enum(['user', 'admin']).optional()
});

const loginSchema = z.object({
  email: z.email('email must be a valid email'),
  password: z.string().min(1, 'password is required')
});

module.exports = { registerSchema, loginSchema };
