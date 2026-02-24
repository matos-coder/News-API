import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { errorHandler } from './src/middlewares/errorHandler';
import authRoutes from './src/routes/auth.routes';
import articleRoutes from './src/routes/article.routes';
import { startAnalyticsJob } from './src/jobs/analytics.job';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

startAnalyticsJob();

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({ Success: true, Message: "API is running", Object: null, Errors: null });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});