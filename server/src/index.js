import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db, { initDatabase } from './db.js';
import apiRouter from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration — allow frontend origins from env or localhost fallback for development
const FRONTEND_URL = process.env.FRONTEND_URL;
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  ...(FRONTEND_URL ? [FRONTEND_URL] : [])
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.onrender.com') || origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }
    console.warn(`[CORS] Blocked request from unlisted origin: ${origin}`);
    return callback(new Error(`CORS: Origin ${origin} not permitted`));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes
app.use('/api', apiRouter);

// Documentation alias
app.get('/docs/api', (req, res) => {
  res.redirect('/api/docs');
});

// Serve compiled React production frontend from client/dist if present
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[Server] Serving static React frontend from ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Fallback JSON welcome message if client/dist is not built
  app.get('/', (req, res) => {
    res.json({
      name: 'SmartMess API Gateway',
      status: 'online',
      version: '1.0.0',
      documentation: '/api/docs',
      endpoints: {
        health: '/api/system/health',
        predictions: '/api/predictions',
        attendance: '/api/attendance',
        model_evaluation: '/api/model/evaluation'
      }
    });
  });
}

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message || err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: {
      code: err.code || (status === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR'),
      message: err.message || 'An unexpected internal error occurred'
    }
  });
});

async function startServer() {
  try {
    await initDatabase();
    
    // Check if initial seed is needed
    const res = await db.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(res.rows[0]?.count || 0, 10);
    if (userCount === 0) {
      console.log('[Server] No users detected. Running initial demo seed...');
      const { seedData } = await import('./seed.js');
      await seedData();
    }

    app.listen(PORT, () => {
      console.log(`[SmartMess Server] Running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[SmartMess Server] Startup failed:', err.message);
    process.exit(1);
  }
}

startServer();
