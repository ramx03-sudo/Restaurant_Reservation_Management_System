const mongoose = require('mongoose');
const reservationRepository = require('../repositories/reservationRepository');
const tableRepository = require('../repositories/tableRepository');
const AppError = require('../utils/AppError');
const { addHoursToTime } = require('../utils/timeHelper');

class ReservationService {
  async createReservation(customerId, reservationDate, startTime, guestCount, notes) {
    // 1. Calculate end time (default 2 hours)
    const endTime = addHoursToTime(startTime, 2);

    // 2. Wrap in transaction logic with fallback for standalone local DBs
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
        } catch (abortError) {
          // Suppress abort errors if transaction failed to start
        }
      }

      // Check if error is related to transactions not supported (e.g. standalone Mongo)
      if (error.message.includes('transaction') || error.code === 20 || error.message.includes('replica set')) {
        console.warn('Transactions not supported by MongoDB server. Retrying without transaction.');
        // Retry without transaction
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
      if (session) {
        session.endSession();
      }
    }
  }

  // Pure allocation logic
  async allocateTableAndCreate(customerId, date, startTime, endTime, guestCount, notes, session = null) {
    // Find all active tables
    const tables = await tableRepository.findActive();

    // Filter tables where capacity >= guestCount, sorted by capacity ASC (smallest table first)
    const candidateTables = tables.filter(t => t.capacity >= guestCount);

    if (candidateTables.length === 0) {
      throw new AppError('No tables can accommodate this guest count', 400);
    }

    let allocatedTable = null;

    // Iterate through candidates to find the first one with no overlapping reservations
    for (const table of candidateTables) {
      const overlap = await reservationRepository.findOverlapping(
        table._id,
        date,
        startTime,
        endTime,
        session
      );

      if (!overlap) {
        allocatedTable = table;
        break; // Smallest suitable table with no conflict found
      }
    }

    if (!allocatedTable) {
      throw new AppError('No available tables for the selected date and time', 409);
    }

    // Create the reservation
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

  async getMyReservations(customerId) {
    return await reservationRepository.findMyReservations(customerId);
  }

  async cancelReservation(id, userId, role) {
    const reservation = await reservationRepository.findById(id);
    if (!reservation) {
      throw new AppError('Reservation not found', 404);
    }

    // Check auth
    if (role !== 'admin' && reservation.customerId._id.toString() !== userId.toString()) {
      throw new AppError('Not authorized to cancel this reservation', 403);
    }

    return await reservationRepository.update(id, { status: 'cancelled' });
  }

  // Admin services
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

    // Calculate Occupancy % based on active tables vs total tables
    // In a real system, occupancy might be calculated for "today" or a specific slot.
    // For simplicity, we can define occupancy rate as: (Active bookings / (Total Tables * total slots in a day)) 
    // Or simpler: percentage of tables that have at least one active booking overall.
    const tablesWithBookings = new Set(reservations.filter(r => r.status === 'confirmed').map(r => r.tableId?._id?.toString()));
    const activeTablesCount = Array.from(tablesWithBookings).filter(id => tables.some(t => t._id.toString() === id)).length;
    
    const occupancyPercentage = totalTables > 0 
      ? Math.round((activeTablesCount / totalTables) * 100) 
      : 0;

    return {
      totalReservations,
      activeReservations,
      cancelledReservations,
      totalTables,
      occupancyPercentage,
    };
  }
}

module.exports = new ReservationService();
