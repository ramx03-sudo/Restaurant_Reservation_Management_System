const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  date: {
    type: String, // format YYYY-MM-DD
    required: true,
  },
  timeSlot: {
    type: String, // format HH:MM e.g. '18:00', '19:00'
    required: true,
  },
  guests: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    enum: ['booked', 'cancelled'],
    default: 'booked',
  }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
