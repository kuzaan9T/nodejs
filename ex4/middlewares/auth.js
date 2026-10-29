const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  let decoded;
  try {
    decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }

  req.user = await User.findById(decoded.id);
  if (!req.user) {
    return res.status(401).json({ message: 'User not found' });
  }
  next();
};

module.exports = { protect };
