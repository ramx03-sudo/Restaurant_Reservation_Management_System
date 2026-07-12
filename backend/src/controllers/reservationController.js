const reservationService = require('../services/reservationService');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');

exports.createReservation = async (req, res, next) => {
  try {
    const { reservationDate, startTime, guestCount, notes, customerId } = req.body;
    
    // If admin is booking on behalf of a customer, use the customerId from body
    const targetCustomerId = (req.user.role === 'admin' && customerId) 
      ? customerId 
      : req.user._id;

    const reservation = await reservationService.createReservation(
      targetCustomerId,
      reservationDate,
      startTime,
      guestCount,
      notes
    );
    new ApiResponse(201, reservation, 'Reservation confirmed successfully').send(res);
  } catch (error) {
    next(error);
  }
};

exports.checkAvailability = async (req, res, next) => {
  try {
    const { reservationDate, startTime, guestCount } = req.query;
    if (!reservationDate || !startTime || !guestCount) {
      throw new AppError('Date, start time, and guest count are required', 400);
    }
    const result = await reservationService.checkAvailability(
      reservationDate,
      startTime,
      parseInt(guestCount, 10)
    );
    new ApiResponse(200, result, 'Availability check completed').send(res);
  } catch (error) {
    next(error);
  }
};

exports.getMyReservations = async (req, res, next) => {
  try {
    const reservations = await reservationService.getMyReservations(req.user._id);
    new ApiResponse(200, reservations, 'My reservations fetched successfully').send(res);
  } catch (error) {
    next(error);
  }
};

exports.cancelReservation = async (req, res, next) => {
  try {
    const reservation = await reservationService.cancelReservation(
      req.params.id,
      req.user._id,
      req.user.role
    );
    new ApiResponse(200, reservation, 'Reservation cancelled successfully').send(res);
  } catch (error) {
    next(error);
  }
};

// Admin Controllers
exports.getAllReservations = async (req, res, next) => {
  try {
    const reservations = await reservationService.getAllReservations();
    new ApiResponse(200, reservations, 'All reservations fetched successfully').send(res);
  } catch (error) {
    next(error);
  }
};

exports.getReservationsByDate = async (req, res, next) => {
  try {
    const reservations = await reservationService.getAllReservations({ reservationDate: req.params.date });
    new ApiResponse(200, reservations, `Reservations for ${req.params.date} fetched successfully`).send(res);
  } catch (error) {
    next(error);
  }
};

exports.updateReservation = async (req, res, next) => {
  try {
    const reservation = await reservationService.updateReservation(req.params.id, req.body);
    new ApiResponse(200, reservation, 'Reservation updated successfully').send(res);
  } catch (error) {
    next(error);
  }
};

exports.updateReservationDetails = async (req, res, next) => {
  try {
    const { reservationDate, startTime, guestCount, notes } = req.body;
    const reservation = await reservationService.updateReservationDetails(
      req.params.id,
      reservationDate,
      startTime,
      parseInt(guestCount, 10),
      notes
    );
    new ApiResponse(200, reservation, 'Reservation details updated successfully').send(res);
  } catch (error) {
    next(error);
  }
};

exports.deleteReservation = async (req, res, next) => {
  try {
    const result = await reservationService.deleteReservation(req.params.id);
    new ApiResponse(200, null, result.message).send(res);
  } catch (error) {
    next(error);
  }
};

exports.getDashboardMetrics = async (req, res, next) => {
  try {
    const metrics = await reservationService.getDashboardMetrics();
    new ApiResponse(200, metrics, 'Dashboard metrics fetched successfully').send(res);
  } catch (error) {
    next(error);
  }
};
