import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/health
router.get('/health', (req, res) => {
  const readyState = mongoose.connection.readyState;
  
  const connectionStates = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  res.json({
    status: 'OK',
    message: 'Backend Connected',
    database: {
      status: connectionStates[readyState] || 'Unknown',
      readyState: readyState
    }
  });
});

export default router;
