import mongoose from 'mongoose';

const mealPassSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  mealSession: {
    type: String,
    required: true,
    enum: ['Breakfast', 'Lunch', 'Dinner']
  },
  mealOption: {
    type: String,
    required: true,
    enum: ['Veg', 'Non-Veg']
  },
  isServed: {
    type: Boolean,
    required: true,
    default: false
  },
  servedAt: {
    type: Date
  },
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Enforce duplicate prevention: one student can only book one pass per session per day
mealPassSchema.index({ student: 1, date: 1, mealSession: 1 }, { unique: true });

const MealPass = mongoose.model('MealPass', mealPassSchema);

export default MealPass;
