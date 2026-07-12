const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
    index: true,
  },
  reservationDate: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true,
  },
  startTime: {
    type: String, // HH:MM
    required: true,
  },
  endTime: {
    type: String, // HH:MM
    required: true,
  },
  guestCount: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed',
  },
  notes: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// Compound index to speed up conflict checks
reservationSchema.index({ tableId: 1, reservationDate: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
