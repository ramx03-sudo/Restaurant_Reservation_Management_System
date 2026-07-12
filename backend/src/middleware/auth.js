const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next(new AppError('Authentication token required', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_replace_me');
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return next(new AppError('User not found. Please re-authenticate.', 401));
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired authentication token', 401));
  }
};

module.exports = auth;
