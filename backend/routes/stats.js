import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import MealPass from '../models/MealPass.js';

const router = express.Router();

// Normalize date to UTC Midnight to ensure timezone consistency
const normalizeDate = (dateVal) => {
  const d = new Date(dateVal);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

// GET /api/stats/daily - Get daily statistics (Staff only)
router.get('/daily', protect, authorize('staff'), async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Please provide a date parameter' });
    }

    const normalizedDate = normalizeDate(date);

    // Count statistics
    const vegCount = await MealPass.countDocuments({ date: normalizedDate, mealOption: 'Veg' });
    const nonVegCount = await MealPass.countDocuments({ date: normalizedDate, mealOption: 'Non-Veg' });
    const servedCount = await MealPass.countDocuments({ date: normalizedDate, isServed: true });
    const pendingCount = await MealPass.countDocuments({ date: normalizedDate, isServed: false });

    res.json({
      vegCount,
      nonVegCount,
      servedCount,
      pendingCount
    });

  } catch (error) {
    console.error('Fetch daily stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
