const AppError = require('../utils/AppError');

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new AppError('Access denied. Admin role required.', 403));
  }
};

module.exports = admin;
