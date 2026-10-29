const express = require('express');
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { protect } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { categorySchema } = require('../validators/categorySchemas');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCategories)
  .post(validate(categorySchema), createCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
