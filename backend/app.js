import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import passesRouter from './routes/passes.js';
import scheduleRouter from './routes/schedule.js';
import statsRouter from './routes/stats.js';
import usersRouter from './routes/users.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/passes', passesRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/stats', statsRouter);
app.use('/api/users', usersRouter);

export default app;
