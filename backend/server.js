import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/auth.js';
import orgRoutes from './routes/org.js';
import sessionRoutes from './routes/session.js';
import jobRoutes from './routes/job.js';
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/job', jobRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});