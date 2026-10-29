const servers = [];
if (process.env.RENDER_EXTERNAL_URL) {
  servers.push({ url: process.env.RENDER_EXTERNAL_URL, description: 'Render' });
}
servers.push({ url: `http://localhost:${process.env.PORT || 8000}`, description: 'Local' });

const bearer = [{ bearerAuth: [] }];

const json = (schema) => ({ 'application/json': { schema } });
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const reply = (description, schema) => ({ description, content: json(schema) });

const idParam = (name) => ({
  name: 'id',
  in: 'path',
  required: true,
  description: `${name} id`,
  schema: { type: 'string', example: '6650f1c2a1b2c3d4e5f60718' }
});

const monthParam = {
  name: 'month',
  in: 'query',
  description: 'Month in YYYY-MM format',
  schema: { type: 'string', example: '2025-05' }
};

const errors = {
  400: { $ref: '#/components/responses/BadRequest' },
  401: { $ref: '#/components/responses/Unauthorized' },
  403: { $ref: '#/components/responses/Forbidden' },
  404: { $ref: '#/components/responses/NotFound' }
};

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Personal Finance Tracker API',
    version: '1.0.0',
    description: 'Track income and expenses, organize them into categories, upload a profile picture and view monthly summaries.'
  },
  servers,
  tags: [
    { name: 'Auth', description: 'Register, login and profile' },
    { name: 'Transactions', description: 'Income and expenses of the logged-in user' },
    { name: 'Categories', description: 'Predefined and custom categories' },
    { name: 'Upload', description: 'Profile picture upload to Cloudinary' },
    { name: 'Admin', description: 'Admin only routes' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      Message: {
        type: 'object',
        properties: { message: { type: 'string' } }
      },
      ValidationError: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'email must be a valid email' }
              }
            }
          }
        }
      },
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Ayaan' },
          email: { type: 'string', format: 'email', example: 'ayaan@example.com' },
          password: { type: 'string', minLength: 6, example: '123456' },
          role: { type: 'string', enum: ['user', 'admin'], default: 'user' }
        }
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'ayaan@example.com' },
          password: { type: 'string', example: '123456' }
        }
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', example: 'Ayaan' },
          email: { type: 'string', example: 'ayaan@example.com' },
          role: { type: 'string', enum: ['user', 'admin'] },
          profilePicture: { type: 'string', nullable: true }
        }
      },
      AuthResponse: {
        allOf: [
          ref('User'),
          { type: 'object', properties: { token: { type: 'string' } } }
        ]
      },
      TransactionInput: {
        type: 'object',
        required: ['title', 'amount', 'type', 'category'],
        properties: {
          title: { type: 'string', example: 'Groceries' },
          amount: { type: 'number', example: -50, description: 'Saved as negative for expenses and positive for income' },
          type: { type: 'string', enum: ['income', 'expense'], example: 'expense' },
          category: { type: 'string', example: 'Food' },
          date: { type: 'string', format: 'date', example: '2025-05-27' }
        }
      },
      TransactionUpdate: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'Weekly groceries' },
          amount: { type: 'number', example: -65 },
          type: { type: 'string', enum: ['income', 'expense'] },
          category: { type: 'string', example: 'Food' },
          date: { type: 'string', format: 'date', example: '2025-05-28' }
        }
      },
      Transaction: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          title: { type: 'string', example: 'Groceries' },
          amount: { type: 'number', example: -50 },
          type: { type: 'string', enum: ['income', 'expense'] },
          category: { type: 'string', example: 'Food' },
          date: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      TransactionList: {
        type: 'object',
        properties: {
          count: { type: 'integer', example: 1 },
          transactions: { type: 'array', items: ref('Transaction') }
        }
      },
      MonthlySummary: {
        type: 'object',
        properties: {
          month: { type: 'string', example: '2025-05' },
          income: { type: 'number', example: 3000 },
          expenses: { type: 'number', example: 450 },
          balance: { type: 'number', example: 2550 },
          categories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string', example: 'Food' },
                type: { type: 'string', enum: ['income', 'expense'] },
                total: { type: 'number', example: 150 },
                count: { type: 'integer', example: 3 }
              }
            }
          }
        }
      },
      CategoryInput: {
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string', example: 'Pets' } }
      },
      Category: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', example: 'Pets' }
        }
      },
      CategoryList: {
        type: 'object',
        properties: {
          predefined: { type: 'array', items: { type: 'string' }, example: ['Food', 'Transport', 'Salary'] },
          custom: { type: 'array', items: ref('Category') }
        }
      },
      UploadResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Profile picture updated' },
          profilePicture: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/v1/finance-tracker/profile-pictures/abc.jpg' }
        }
      },
      AdminOverview: {
        type: 'object',
        properties: {
          totalUsers: { type: 'integer', example: 12 },
          totalTransactions: { type: 'integer', example: 240 },
          totalIncome: { type: 'number', example: 52000 },
          totalExpenses: { type: 'number', example: 31800 },
          topSpendingCategories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string', example: 'Rent' },
                total: { type: 'number', example: 12000 },
                count: { type: 'integer', example: 12 }
              }
            }
          }
        }
      }
    },
    responses: {
      BadRequest: reply('Invalid input', ref('ValidationError')),
      Unauthorized: reply('Missing or invalid token', ref('Message')),
      Forbidden: reply('Not allowed for this role', ref('Message')),
      NotFound: reply('Not found', ref('Message'))
    }
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: { required: true, content: json(ref('RegisterInput')) },
        responses: {
          201: reply('User created', ref('AuthResponse')),
          400: errors[400]
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and get a JWT',
        requestBody: { required: true, content: json(ref('LoginInput')) },
        responses: {
          200: reply('Logged in', ref('AuthResponse')),
          400: errors[400],
          401: reply('Invalid email or password', ref('Message'))
        }
      }
    },
    '/auth/profile': {
      get: {
        tags: ['Auth'],
        summary: 'Get the logged-in user',
        security: bearer,
        responses: {
          200: reply('Current user', ref('User')),
          401: errors[401]
        }
      }
    },
    '/transactions': {
      get: {
        tags: ['Transactions'],
        summary: 'List all transactions',
        security: bearer,
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['income', 'expense'] } },
          { name: 'category', in: 'query', schema: { type: 'string', example: 'Food' } },
          monthParam
        ],
        responses: {
          200: reply('Transactions, newest first', ref('TransactionList')),
          400: errors[400],
          401: errors[401]
        }
      },
      post: {
        tags: ['Transactions'],
        summary: 'Add a new income or expense',
        security: bearer,
        requestBody: { required: true, content: json(ref('TransactionInput')) },
        responses: {
          201: reply('Transaction created', ref('Transaction')),
          400: errors[400],
          401: errors[401]
        }
      }
    },
    '/transactions/monthly-summary': {
      get: {
        tags: ['Transactions'],
        summary: 'Total spent and earned per category for a month',
        description: 'Defaults to the current month',
        security: bearer,
        parameters: [monthParam],
        responses: {
          200: reply('Monthly summary', ref('MonthlySummary')),
          400: errors[400],
          401: errors[401]
        }
      }
    },
    '/transactions/{id}': {
      get: {
        tags: ['Transactions'],
        summary: 'Get one transaction',
        security: bearer,
        parameters: [idParam('Transaction')],
        responses: {
          200: reply('Transaction', ref('Transaction')),
          400: errors[400],
          401: errors[401],
          404: errors[404]
        }
      },
      put: {
        tags: ['Transactions'],
        summary: 'Edit a transaction',
        security: bearer,
        parameters: [idParam('Transaction')],
        requestBody: { required: true, content: json(ref('TransactionUpdate')) },
        responses: {
          200: reply('Updated transaction', ref('Transaction')),
          400: errors[400],
          401: errors[401],
          404: errors[404]
        }
      },
      delete: {
        tags: ['Transactions'],
        summary: 'Remove a transaction',
        security: bearer,
        parameters: [idParam('Transaction')],
        responses: {
          200: reply('Deleted', ref('Message')),
          400: errors[400],
          401: errors[401],
          404: errors[404]
        }
      }
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List predefined and custom categories',
        security: bearer,
        responses: {
          200: reply('Categories', ref('CategoryList')),
          401: errors[401]
        }
      },
      post: {
        tags: ['Categories'],
        summary: 'Add a custom category',
        security: bearer,
        requestBody: { required: true, content: json(ref('CategoryInput')) },
        responses: {
          201: reply('Category created', ref('Category')),
          400: errors[400],
          401: errors[401]
        }
      }
    },
    '/categories/{id}': {
      delete: {
        tags: ['Categories'],
        summary: 'Delete a custom category',
        security: bearer,
        parameters: [idParam('Category')],
        responses: {
          200: reply('Deleted', ref('Message')),
          400: errors[400],
          401: errors[401],
          404: errors[404]
        }
      }
    },
    '/upload/profile-picture': {
      post: {
        tags: ['Upload'],
        summary: 'Upload a profile picture',
        description: 'Image only, max 2MB. Stored on Cloudinary.',
        security: bearer,
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: { image: { type: 'string', format: 'binary' } }
              }
            }
          }
        },
        responses: {
          200: reply('Uploaded', ref('UploadResponse')),
          400: errors[400],
          401: errors[401]
        }
      }
    },
    '/admin/overview': {
      get: {
        tags: ['Admin'],
        summary: 'App wide stats',
        security: bearer,
        responses: {
          200: reply('Overview', ref('AdminOverview')),
          401: errors[401],
          403: errors[403]
        }
      }
    }
  }
};

module.exports = swaggerSpec;
