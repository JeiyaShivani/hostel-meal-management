import mongoose from 'mongoose';
import MealConfig from '../models/MealConfig.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-initialize MealConfig if empty
    const count = await MealConfig.countDocuments();
    if (count === 0) {
      console.log('Initializing default MealConfig...');
      await MealConfig.insertMany([
        { mealSession: 'Breakfast', startTime: '07:00', endTime: '09:00', choiceEnabled: false },
        { mealSession: 'Lunch', startTime: '12:00', endTime: '14:00', choiceEnabled: true },
        { mealSession: 'Dinner', startTime: '19:00', endTime: '21:00', choiceEnabled: true }
      ]);
      console.log('Default MealConfig created.');
    }

    // Auto-seed default users if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding default users...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      await User.insertMany([
        {
          name: 'Staff Member',
          registerNo: 'STAFF123',
          password: hashedPassword,
          role: 'staff'
        },
        {
          name: 'Student User',
          registerNo: 'STUD123',
          password: hashedPassword,
          role: 'student'
        }
      ]);
      console.log('Default users created (STAFF123 / STUD123 - pwd: password123)');
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
