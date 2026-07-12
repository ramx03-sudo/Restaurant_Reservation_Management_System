const Reservation = require('../models/Reservation');

class ReservationRepository {
  async findMyReservations(customerId) {
    return await Reservation.find({ customerId })
      .populate('tableId')
      .sort({ reservationDate: 1, startTime: 1 });
  }

  async findAll(query = {}) {
    return await Reservation.find(query)
      .populate('customerId', 'name email')
      .populate('tableId')
      .sort({ reservationDate: 1, startTime: 1 });
  }

  async findById(id) {
    return await Reservation.findById(id).populate('tableId').populate('customerId', 'name email');
  }

  async create(reservationData, session = null) {
    const reservation = new Reservation(reservationData);
    const options = session ? { session } : {};
    return await reservation.save(options);
  }

  async update(id, updateData, session = null) {
    const options = session ? { session, new: true } : { new: true };
    return await Reservation.findByIdAndUpdate(id, updateData, options);
  }

  async delete(id) {
    return await Reservation.findByIdAndDelete(id);
  }

  async findOverlapping(tableId, date, start, end, excludeReservationId = null, session = null) {
    const query = {
      tableId,
      reservationDate: date,
      status: 'confirmed',
      $or: [
        {
          startTime: { $lt: end },
          endTime: { $gt: start }
        }
      ]
    };
    
    if (excludeReservationId) {
      query._id = { $ne: excludeReservationId };
    }
    
    if (session) {
      return await Reservation.findOne(query).session(session);
    }
    return await Reservation.findOne(query);
  }
}

module.exports = new ReservationRepository();
