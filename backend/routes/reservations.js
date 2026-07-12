const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Customer routes
router.post('/', auth, reservationController.createReservation);
router.get('/me', auth, reservationController.getMyReservations);
router.put('/:id/cancel', auth, reservationController.cancelReservation);

// Admin routes
router.get('/', auth, admin, reservationController.getAllReservations);

module.exports = router;
