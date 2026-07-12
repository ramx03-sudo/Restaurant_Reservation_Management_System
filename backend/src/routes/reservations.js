const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReservationSchema, cancelReservationSchema } = require('../validations/reservationValidation');

// Customer endpoints
router.get('/availability', auth, reservationController.checkAvailability);
router.post('/', auth, validate(createReservationSchema), reservationController.createReservation);
router.get('/my', auth, reservationController.getMyReservations);
router.delete('/:id', auth, validate(cancelReservationSchema), reservationController.cancelReservation);

module.exports = router;
