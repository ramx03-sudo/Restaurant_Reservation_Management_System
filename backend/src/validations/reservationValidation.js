const { z } = require('zod');

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const createReservationSchema = z.object({
  body: z.object({
    reservationDate: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
    startTime: z.string().regex(timeRegex, 'Start time must be in HH:MM format'),
    guestCount: z.number().int().positive('Guest count must be a positive integer'),
    notes: z.string().optional(),
  }),
});

const updateReservationSchema = z.object({
  params: z.object({
    id: z.string().regex(mongoIdRegex, 'Invalid reservation ID'),
  }),
  body: z.object({
    status: z.enum(['confirmed', 'cancelled']).optional(),
    guestCount: z.number().int().positive().optional(),
    notes: z.string().optional(),
  }).partial(),
});

const cancelReservationSchema = z.object({
  params: z.object({
    id: z.string().regex(mongoIdRegex, 'Invalid reservation ID'),
  }),
});

module.exports = {
  createReservationSchema,
  updateReservationSchema,
  cancelReservationSchema,
};
