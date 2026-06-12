import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  registerNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
    role: {
    type: String,
    required: true,
    enum: ['student', 'staff'],
  },
  defaultMealPreference: {
    type: String,
    enum: ['Veg', 'Non-Veg'],
    default: 'Veg'
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
