const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profilePicture: user.profilePicture
});

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, password, role });
  res.status(201).json({ ...userResponse(user), token: generateToken(user._id) });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({ ...userResponse(user), token: generateToken(user._id) });
};

const getProfile = (req, res) => {
  res.json(userResponse(req.user));
};

module.exports = { register, login, getProfile };
