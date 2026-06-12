import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse incoming JSON payloads
app.use(express.json());

// Map API routes
app.use('/api', healthRouter);

export default app;
