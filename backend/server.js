import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import initAdmin from './utils/initAdmin.js';
import initCategories from './utils/initCategories.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

// ─── Routes ───────────────────────────────────────────────────────
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import courseRoutes from './routes/courseRoutes.js';

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('--- DEBUG ENVIRONMENT VARIABLES ---');
console.log('Loaded env keys:', Object.keys(process.env));
console.log('MONGO_URI:', process.env.MONGO_URI || 'KHÔNG TỒN TẠI / undefined');
console.log('PORT:', process.env.PORT || 'KHÔNG TỒN TẠI');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development (mặc định)');
console.log('--- END DEBUG ENV ---');

// Connect to MongoDB & Initialize Admin
connectDB()
  .then(() => {
    console.log('MongoDB connected → starting initAdmin...');
    return initAdmin();
  })
  .then(() => {
    console.log('→ initializing categories...');
    return initCategories();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── CORS - FIX LỖI ─────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',  // THÊM PORT 5175
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',  // THÊM PORT 5175
];

app.use(cors({
  origin: function(origin, callback) {
    // Cho phép requests không có origin (Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Origin bị chặn bởi CORS:', origin);
      callback(new Error('CORS not allowed'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware để log các request
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No Origin'}`);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Static Files ─────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);

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
  console.log(`\n🚀 26Tech LMS Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   CORS allowed origins:`, allowedOrigins);
});