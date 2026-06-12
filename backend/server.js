import dotenv from 'dotenv';
// Load environment variables immediately
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

// Connect to MongoDB Database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
