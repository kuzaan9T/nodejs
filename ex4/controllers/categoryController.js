const Category = require('../models/Category');
const { PREDEFINED_CATEGORIES, findPredefined } = require('../utils/categories');

const getCategories = async (req, res) => {
  const custom = await Category.find({ user: req.user._id }).select('name').sort({ name: 1 });
  res.json({ predefined: PREDEFINED_CATEGORIES, custom });
};

const createCategory = async (req, res) => {
  const { name } = req.body;

  if (findPredefined(name)) {
    return res.status(400).json({ message: `${name} is already a predefined category` });
  }

  const exists = await Category.findOne({ user: req.user._id, name })
    .collation({ locale: 'en', strength: 2 });
  if (exists) return res.status(400).json({ message: 'Category already exists' });

  const category = await Category.create({ user: req.user._id, name });
  res.status(201).json(category);
};

const deleteCategory = async (req, res) => {
  const category = await Category.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json({ message: 'Category deleted' });
};

module.exports = { getCategories, createCategory, deleteCategory };
