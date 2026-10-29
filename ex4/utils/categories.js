const PREDEFINED_CATEGORIES = [
  'Food',
  'Transport',
  'Rent',
  'Utilities',
  'Shopping',
  'Entertainment',
  'Health',
  'Education',
  'Salary',
  'Freelance',
  'Investments',
  'Gifts',
  'Other'
];

const findPredefined = (name) => {
  return PREDEFINED_CATEGORIES.find(c => c.toLowerCase() === name.toLowerCase());
};

module.exports = { PREDEFINED_CATEGORIES, findPredefined };
