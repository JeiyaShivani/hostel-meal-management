import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/users/search/:registerNo - Search student by register number (Staff only)
router.get('/search/:registerNo', protect, authorize('staff'), async (req, res) => {
  try {
    const student = await User.findOne({ 
      registerNo: req.params.registerNo.trim(),
      role: 'student'
    }).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Search student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/:id/preference - Update student preference (Staff only)
router.put('/:id/preference', protect, authorize('staff'), async (req, res) => {
  try {
    const { defaultMealPreference } = req.body;
    
    if (!['Veg', 'Non-Veg'].includes(defaultMealPreference)) {
      return res.status(400).json({ message: 'Invalid preference value' });
    }

    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.defaultMealPreference = defaultMealPreference;
    await student.save();

    res.json({ 
      message: 'Preference updated successfully',
      defaultMealPreference: student.defaultMealPreference
    });
  } catch (error) {
    console.error('Update preference error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
