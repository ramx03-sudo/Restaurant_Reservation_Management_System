const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const { updateReservationSchema, createReservationSchema } = require('../validations/reservationValidation');

// Admin-only endpoints for managing reservations and metrics
router.use(auth, admin);

router.get('/reservations', reservationController.getAllReservations);
router.get('/reservations/date/:date', reservationController.getReservationsByDate);
router.put('/reservations/:id', validate(updateReservationSchema), reservationController.updateReservation);
router.put('/reservations/:id/details', validate(createReservationSchema), reservationController.updateReservationDetails);
router.delete('/reservations/:id', reservationController.deleteReservation);
router.get('/metrics', reservationController.getDashboardMetrics);

module.exports = router;
