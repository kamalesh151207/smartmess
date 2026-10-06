import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initDatabase } from './db.js';
import apiRouter from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes
app.use('/api', apiRouter);

// Documentation alias
app.get('/docs/api', (req, res) => {
  res.redirect('/api/docs');
});

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
      console.log(`[SmartMess API Server] Running on http://localhost:${PORT}`);
      console.log(`[SmartMess API Docs] OpenAPI documentation available at http://localhost:${PORT}/docs/api`);
    });
  } catch (err) {
    console.error('[SmartMess API Server] Startup failed:', err.message);
    process.exit(1);
  }
}

startServer();
