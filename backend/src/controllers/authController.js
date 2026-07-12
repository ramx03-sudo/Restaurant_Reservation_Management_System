const authService = require('../services/authService');
const ApiResponse = require('../utils/ApiResponse');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.register(name, email, password, role);
    new ApiResponse(201, result, 'Registration successful').send(res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    new ApiResponse(200, result, 'Login successful').send(res);
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await authService.getProfile(req.user._id);
    new ApiResponse(200, profile, 'Profile fetched successfully').send(res);
  } catch (error) {
    next(error);
  }
};

exports.getAllCustomers = async (req, res, next) => {
  try {
    const customers = await authService.getAllCustomers();
    new ApiResponse(200, customers, 'Customers fetched successfully').send(res);
  } catch (error) {
    next(error);
  }
};
