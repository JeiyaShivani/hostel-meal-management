import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/health', (req, res) => {
  const readyState = mongoose.connection.readyState;
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  res.json({
    status: 'OK',
    message: 'Backend Connected',
    database: {
      status: states[readyState] || 'Unknown',
      readyState
    }
  });
});

export default router;
