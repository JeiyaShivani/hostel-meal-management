import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

// Resolve paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedUsers = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel-meal-management';
    console.log(`Connecting to database at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Database connected successfully.');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users.');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create seed data
    const users = [
      {
        name: 'Karthik',
        registerNo: '22CSR001',
        password: hashedPassword,
        role: 'student'
      },
      {
        name: 'Staff Admin',
        registerNo: 'STAFF001',
        password: hashedPassword,
        role: 'staff'
      }
    ];

    // Insert to database
    await User.insertMany(users);
    console.log('Database seeded with sample users successfully.');

    // Disconnect
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedUsers();
