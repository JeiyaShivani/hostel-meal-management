import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import MealPass from '../models/MealPass.js';
import MealConfig from '../models/MealConfig.js';
import User from '../models/User.js';

const router = express.Router();

// Normalize date to UTC Midnight to ensure timezone consistency
const normalizeDate = (dateVal) => {
  const d = new Date(dateVal);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

// POST /api/passes - Book a meal pass (Student only)
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { date, mealSession } = req.body;

    if (!date || !mealSession) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const normalizedDate = normalizeDate(date);

    // Fetch user's default preference
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate that a config exists for this session
    const config = await MealConfig.findOne({ mealSession });
    if (!config) {
      return res.status(400).json({ message: 'Invalid meal session' });
    }

    // Logic: 
    // 1. If session has choice ENABLED, use User.defaultMealPreference
    // 2. If session has choice DISABLED, use 'Veg'
    let finalOption = user.defaultMealPreference || 'Veg';
    if (!config.choiceEnabled) {
      finalOption = 'Veg';
    }

    const newPass = new MealPass({
      student: req.user.id,
      date: normalizedDate,
      mealSession,
      mealOption: finalOption
    });

    await newPass.save();
    res.status(201).json(newPass);

  } catch (error) {
    console.error('Book pass error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already booked a pass for this meal session today' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/passes/my-passes - Get passes history for logged-in student (Student only)
router.get('/my-passes', protect, authorize('student'), async (req, res) => {
  try {
    const passes = await MealPass.find({ student: req.user.id }).sort({ date: -1, mealSession: 1 });
    res.json(passes);
  } catch (error) {
    console.error('Fetch student passes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/passes/:id - Retrieve pass details by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const pass = await MealPass.findById(req.params.id).populate('student', 'name registerNo');
    if (!pass) {
      return res.status(404).json({ message: 'Pass not found' });
    }
    res.json(pass);
  } catch (error) {
    console.error('Get pass details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/passes/:id/serve - Validate and serve a pass atomically (Staff only)
router.post('/:id/serve', protect, authorize('staff'), async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the pass
    const pass = await MealPass.findById(id).populate('student', 'name registerNo');
    if (!pass) {
      return res.status(404).json({ message: 'Pass not found' });
    }

    // 2. Find the config for this session
    const config = await MealConfig.findOne({ mealSession: pass.mealSession });
    if (!config) {
      return res.json({ status: 'EXPIRED', message: 'No active configuration for this session' });
    }

    // 3. Check Date matching (Pass must be for today)
    const todayNormalized = normalizeDate(new Date());
    const passDateNormalized = normalizeDate(pass.date);
    if (passDateNormalized.getTime() !== todayNormalized.getTime()) {
      return res.json({ status: 'EXPIRED', message: 'Pass is not for today\'s date' });
    }

    // 4. Check time window
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    if (currentTimeStr < config.startTime || currentTimeStr > config.endTime) {
      return res.json({ status: 'EXPIRED', message: `Meal session window is closed. (Active: ${config.startTime} - ${config.endTime})` });
    }

    // 5. Check if already served (duplicate check)
    if (pass.isServed) {
      return res.json({ status: 'ALREADY_SERVED', message: 'Already Served' });
    }

    // 6. Atomic update to mark as served
    const servedPass = await MealPass.findOneAndUpdate(
      { _id: id, isServed: false },
      {
        $set: {
          isServed: true,
          servedAt: new Date(),
          scannedBy: req.user.id
        }
      },
      { new: true }
    ).populate('student', 'name registerNo');

    if (!servedPass) {
      return res.json({ status: 'ALREADY_SERVED', message: 'Already Served' });
    }

    res.json({
      status: 'VALID',
      message: 'Meal served successfully',
      pass: servedPass
    });

  } catch (error) {
    console.error('Serve pass error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
