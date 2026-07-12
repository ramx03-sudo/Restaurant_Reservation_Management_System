const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

const seedDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant';
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    console.log('Cleaning existing data...');
    await User.deleteMany({});
    await Table.deleteMany({});
    await Reservation.deleteMany({});

    // Seed Admin User
    console.log('Seeding Admin user...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@email.com',
      passwordHash,
      role: 'admin'
    });

    // Seed Tables
    console.log('Seeding Tables...');
    const tables = [
      { tableNumber: 'Table 1', capacity: 2, isActive: true },
      { tableNumber: 'Table 2', capacity: 2, isActive: true },
      { tableNumber: 'Table 3', capacity: 4, isActive: true },
      { tableNumber: 'Table 4', capacity: 4, isActive: true },
      { tableNumber: 'Table 5', capacity: 6, isActive: true },
      { tableNumber: 'Table 6', capacity: 8, isActive: true }
    ];
    await Table.insertMany(tables);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
