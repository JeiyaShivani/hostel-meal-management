import mongoose from 'mongoose';

const mealScheduleSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  mealSession: {
    type: String,
    required: true,
    enum: ['Breakfast', 'Lunch', 'Dinner'],
  },
  startTime: {
    type: String,
    required: true,
    placeholder: 'e.g. 07:30 (24h format)'
  },
  endTime: {
    type: String,
    required: true,
    placeholder: 'e.g. 09:30 (24h format)'
  },
  choiceEnabled: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure only one schedule entry exists for a given date and session
mealScheduleSchema.index({ date: 1, mealSession: 1 }, { unique: true });

const MealSchedule = mongoose.model('MealSchedule', mealScheduleSchema);

export default MealSchedule;
