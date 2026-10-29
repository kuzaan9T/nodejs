const mongoose = require('mongoose');
const Book = require('../models/Book');

const createBook = async (req, res) => {
  const { title, author, publishedYear, genre } = req.body || {};
  if (!title || !author) {
    return res.status(400).json({ message: 'title and author are required' });
  }
  try {
    const book = await Book.create({ title, author, publishedYear, genre });
    res.status(201).json(book);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

const getBooks = async (req, res) => {
  const filter = {};
  if (req.query.year) {
    const year = Number(req.query.year);
    if (isNaN(year)) return res.status(400).json({ message: 'year must be a number' });
    filter.publishedYear = year;
  }
  try {
    const books = await Book.find(filter);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const searchBooks = async (req, res) => {
  const { genre } = req.query;
  if (!genre) return res.status(400).json({ message: 'genre is required' });
  try {
    const books = await Book.find({ genre }).collation({ locale: 'en', strength: 2 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getBook = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid book id' });
  }
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateBook = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid book id' });
  }
  const { title, author, publishedYear, genre } = req.body || {};
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, publishedYear, genre },
      { returnDocument: 'after', runValidators: true }
    );
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

const deleteBook = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid book id' });
  }
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createBook,
  getBooks,
  searchBooks,
  getBook,
  updateBook,
  deleteBook
};
