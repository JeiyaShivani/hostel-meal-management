import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import MealConfig from '../models/MealConfig.js';

const router = express.Router();

// GET /api/schedule - Retrieve all meal configurations
router.get('/', protect, async (req, res) => {
  try {
    const configs = await MealConfig.find().sort({ mealSession: 1 });
    res.json(configs);
  } catch (error) {
    console.error('Fetch config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/schedule - Update a session configuration (Staff only)
router.post('/', protect, authorize('staff'), async (req, res) => {
  try {
    const { mealSession, startTime, endTime, choiceEnabled } = req.body;

    if (!mealSession || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide session, start time, and end time' });
    }

    // Upsert config for this session
    const config = await MealConfig.findOneAndUpdate(
      { mealSession },
      { startTime, endTime, choiceEnabled: choiceEnabled !== false },
      { new: true, upsert: true }
    );

    res.json(config);
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
