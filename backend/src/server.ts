import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';import path from 'path';
import { conceptRoutes } from './routes/conceptRoutes';
import { codeAnalysisRoutes } from './routes/codeAnalysisRoutes';
import visionRoutes from './routes/visionRoutes';
import { projectContextRoutes } from './routes/projectContextRoutes';
import { dictionaryRoutes } from './routes/dictionaryRoutes';
import viroRoutes from './routes/viroRoutes';

// Configure dotenv to load from the backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:3000'
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/concepts', conceptRoutes);
app.use('/api/code-analysis', codeAnalysisRoutes);
app.use('/api/vision', visionRoutes);
app.use('/api/project-context', projectContextRoutes);
app.use('/api/dictionary', dictionaryRoutes);
app.use('/api/viro', viroRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CTC Tutor Backend running on port ${PORT}`);
  console.log(`📚 Ready to help students learn!`);
});
