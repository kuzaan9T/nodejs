const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Server error';

  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.name === 'ValidationError') {
    status = 400;
  } else if (err.code === 11000) {
    status = 400;
    message = `${Object.keys(err.keyValue).join(', ')} already exists`;
  } else if (err.name === 'MulterError') {
    status = 400;
    if (err.code === 'LIMIT_FILE_SIZE') message = 'File is too large, max size is 2MB';
  } else if (err.type === 'entity.parse.failed') {
    message = 'Invalid JSON body';
  }

  if (status >= 500) {
    console.error(err);
    if (process.env.NODE_ENV === 'production') message = 'Server error';
  }

  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };
