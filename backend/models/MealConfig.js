import mongoose from 'mongoose';

const mealConfigSchema = new mongoose.Schema({
  mealSession: {
    type: String,
    required: true,
    enum: ['Breakfast', 'Lunch', 'Dinner'],
    unique: true
  },
  startTime: {
    type: String, // HH:mm format
    required: true
  },
  endTime: {
    type: String, // HH:mm format
    required: true
  },
  choiceEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const MealConfig = mongoose.model('MealConfig', mealConfigSchema);

export default MealConfig;
