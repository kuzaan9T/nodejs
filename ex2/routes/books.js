const express = require('express');
const {
  createBook,
  getBooks,
  searchBooks,
  getBook,
  updateBook,
  deleteBook
} = require('../controllers/booksController');

const router = express.Router();

router.get('/search', searchBooks);
router.route('/').get(getBooks).post(createBook);
router.route('/:id').get(getBook).put(updateBook).delete(deleteBook);

module.exports = router;
