const mongoose = require('mongoose');
const reservationRepository = require('../repositories/reservationRepository');
const tableRepository = require('../repositories/tableRepository');
const AppError = require('../utils/AppError');
const { addHoursToTime } = require('../utils/timeHelper');

class ReservationService {
  async createReservation(customerId, reservationDate, startTime, guestCount, notes) {
    const endTime = addHoursToTime(startTime, 2);

    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      const reservation = await this.allocateTableAndCreate(
        customerId,
        reservationDate,
        startTime,
        endTime,
        guestCount,
        notes,
        session
      );

      await session.commitTransaction();
      return reservation;
    } catch (error) {
      if (session) {
        try {
          await session.abortTransaction();
        } catch (abortError) {}
      }

      if (error.message.includes('transaction') || error.code === 20 || error.message.includes('replica set')) {
        console.warn('Transactions not supported. Retrying without transaction.');
        return await this.allocateTableAndCreate(
          customerId,
          reservationDate,
          startTime,
          endTime,
          guestCount,
          notes,
          null
        );
      }
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }

  async allocateTableAndCreate(customerId, date, startTime, endTime, guestCount, notes, session = null) {
    const tables = await tableRepository.findActive();
    const candidateTables = tables.filter(t => t.capacity >= guestCount);

    if (candidateTables.length === 0) {
      throw new AppError('No tables can accommodate this guest count', 400);
    }

    let allocatedTable = null;
    for (const table of candidateTables) {
      const overlap = await reservationRepository.findOverlapping(
        table._id,
        date,
        startTime,
        endTime,
        null,
        session
      );

      if (!overlap) {
        allocatedTable = table;
        break;
      }
    }

    if (!allocatedTable) {
      throw new AppError('No available tables for the selected date and time', 409);
    }

    const reservation = await reservationRepository.create({
      customerId,
      tableId: allocatedTable._id,
      reservationDate: date,
      startTime,
      endTime,
      guestCount,
      notes,
      status: 'confirmed'
    }, session);

    return await reservation.populate('tableId');
  }

  async checkAvailability(date, startTime, guestCount) {
    const endTime = addHoursToTime(startTime, 2);
    const tables = await tableRepository.findActive();
    const candidateTables = tables.filter(t => t.capacity >= guestCount);

    if (candidateTables.length === 0) {
      return { available: false };
    }

    for (const table of candidateTables) {
      const overlap = await reservationRepository.findOverlapping(
        table._id,
        date,
        startTime,
        endTime,
        null,
        null
      );

      if (!overlap) {
        return { available: true, table: table.tableNumber };
      }
    }

    return { available: false };
  }

  async updateReservationDetails(id, date, startTime, guestCount, notes) {
    const endTime = addHoursToTime(startTime, 2);
    const reservation = await reservationRepository.findById(id);
    if (!reservation) {
      throw new AppError('Reservation not found', 404);
    }

    // Find active tables
    const tables = await tableRepository.findActive();
    const candidateTables = tables.filter(t => t.capacity >= guestCount);

    if (candidateTables.length === 0) {
      throw new AppError('No tables can accommodate this guest count', 400);
    }

    let allocatedTable = null;
    for (const table of candidateTables) {
      // Exclude current reservation from overlap checks so it doesn't conflict with itself
      const overlap = await reservationRepository.findOverlapping(
        table._id,
        date,
        startTime,
        endTime,
        id,
        null
      );

      if (!overlap) {
        allocatedTable = table;
        break;
      }
    }

    if (!allocatedTable) {
      throw new AppError('No available tables for the selected date and time', 409);
    }

    return await reservationRepository.update(id, {
      reservationDate: date,
      startTime,
      endTime,
      guestCount,
      notes,
      tableId: allocatedTable._id
    });
  }

  async getMyReservations(customerId) {
    return await reservationRepository.findMyReservations(customerId);
  }

  async cancelReservation(id, userId, role) {
    const reservation = await reservationRepository.findById(id);
    if (!reservation) {
      throw new AppError('Reservation not found', 404);
    }

    if (role !== 'admin' && reservation.customerId._id.toString() !== userId.toString()) {
      throw new AppError('Not authorized to cancel this reservation', 403);
    }

    return await reservationRepository.update(id, { status: 'cancelled' });
  }

  async getAllReservations(query = {}) {
    return await reservationRepository.findAll(query);
  }

  async updateReservation(id, updateData) {
    const reservation = await reservationRepository.update(id, updateData);
    if (!reservation) {
      throw new AppError('Reservation not found', 404);
    }
    return reservation;
  }

  async deleteReservation(id) {
    const res = await reservationRepository.delete(id);
    if (!res) {
      throw new AppError('Reservation not found', 404);
    }
    return { message: 'Reservation permanently deleted' };
  }

  async getDashboardMetrics() {
    const reservations = await reservationRepository.findAll();
    const tables = await tableRepository.findAll();

    const totalReservations = reservations.length;
    const activeReservations = reservations.filter(r => r.status === 'confirmed').length;
    const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length;
    const totalTables = tables.length;

    // Operational Metrics calculations
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local timezone

    // Today's Reservations count (confirmed status)
    const todayReservations = reservations.filter(r => r.reservationDate === todayStr && r.status === 'confirmed');
    const todayCount = todayReservations.length;

    // Occupied active seats today (sum of guests for confirmed bookings)
    const occupiedSeatsToday = todayReservations.reduce((sum, r) => sum + r.guestCount, 0);

    // Total seats overall (sum of capacity of all active tables)
    const activeTables = tables.filter(t => t.isActive);
    const totalActiveSeats = activeTables.reduce((sum, t) => sum + t.capacity, 0);

    // Occupancy percentage formula: occupied active seats today / total active seats * 100
    const occupancyPercentage = totalActiveSeats > 0
      ? Math.round((occupiedSeatsToday / totalActiveSeats) * 100)
      : 0;

    // Next upcoming active reservation (confirmed, today or in future)
    const upcomingReservations = reservations
      .filter(r => r.status === 'confirmed' && r.reservationDate >= todayStr)
      .sort((a, b) => {
        if (a.reservationDate !== b.reservationDate) {
          return a.reservationDate.localeCompare(b.reservationDate);
        }
        return a.startTime.localeCompare(b.startTime);
      });

    const nextReservation = upcomingReservations.length > 0
      ? {
          time: `${upcomingReservations[0].reservationDate} at ${upcomingReservations[0].startTime}`,
          table: upcomingReservations[0].tableId?.tableNumber,
          customer: upcomingReservations[0].customerId?.name,
          guests: upcomingReservations[0].guestCount
        }
      : null;

    return {
      totalReservations,
      activeReservations,
      cancelledReservations,
      totalTables,
      occupancyPercentage,
      todayCount,
      nextReservation
    };
  }
}

module.exports = new ReservationService();
