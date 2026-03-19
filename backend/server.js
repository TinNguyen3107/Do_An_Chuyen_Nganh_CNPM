import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import initAdmin from './utils/initAdmin.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

// ─── Routes ───────────────────────────────────────────────────────
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

dotenv.config();

// Connect to MongoDB & Initialize Admin
connectDB().then(() => {
  initAdmin();
});

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Core Middlewares ─────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Static Files ─────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
// More routes will be added here as modules are implemented

// ─── Health Check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '26Tech LMS API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0-sprint1',
  });
});

// ─── Error Handlers ───────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 26Tech LMS Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
