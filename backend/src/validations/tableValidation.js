const { z } = require('zod');

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

const createTableSchema = z.object({
  body: z.object({
    tableNumber: z.string().min(1, 'Table number is required'),
    capacity: z.number().int().positive('Capacity must be a positive integer'),
    isActive: z.boolean().optional(),
  }),
});

const updateTableSchema = z.object({
  params: z.object({
    id: z.string().regex(mongoIdRegex, 'Invalid table ID'),
  }),
  body: z.object({
    capacity: z.number().int().positive('Capacity must be a positive integer').optional(),
    isActive: z.boolean().optional(),
  }).partial(),
});

const deleteTableSchema = z.object({
  params: z.object({
    id: z.string().regex(mongoIdRegex, 'Invalid table ID'),
  }),
});

module.exports = {
  createTableSchema,
  updateTableSchema,
  deleteTableSchema,
};
