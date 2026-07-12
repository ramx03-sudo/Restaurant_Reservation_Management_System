const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

// Customer: Create a reservation
exports.createReservation = async (req, res) => {
  try {
    const { tableId, date, timeSlot, guests } = req.body;

    // Validate table exists and capacity
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    if (table.capacity < guests) {
      return res.status(400).json({ message: `Table capacity (${table.capacity}) is less than number of guests (${guests})` });
    }

    // Check for conflicting reservations
    const conflict = await Reservation.findOne({
      table: tableId,
      date,
      timeSlot,
      status: 'booked'
    });

    if (conflict) {
      return res.status(409).json({ message: 'Table is already booked for this date and time slot' });
    }

    const reservation = new Reservation({
      user: req.user._id,
      table: tableId,
      date,
      timeSlot,
      guests
    });

    await reservation.save();
    
    // Populate table details for response
    await reservation.populate('table');
    
    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Customer: Get my reservations
exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('table')
      .sort({ date: 1, timeSlot: 1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Customer/Admin: Cancel reservation
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check ownership or admin
    if (reservation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json({ message: 'Reservation cancelled successfully', reservation });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Get all reservations (can filter by date)
exports.getAllReservations = async (req, res) => {
  try {
    const { date } = req.query;
    let query = {};
    if (date) {
      query.date = date;
    }

    const reservations = await Reservation.find(query)
      .populate('user', 'name email')
      .populate('table')
      .sort({ date: 1, timeSlot: 1 });
      
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
