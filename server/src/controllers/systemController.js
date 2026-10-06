import db from '../db.js';
import { forecastService } from '../services/forecastService.js';
import { dataQualityService } from '../services/dataQualityService.js';

export const systemController = {
  async getHealth(req, res) {
    try {
      // 1. Check DB
      let dbConnected = false;
      let userCount = 0;
      let totalStudents = 0;
      let totalMeals = 0;
      try {
        const u = await db.query('SELECT COUNT(*) as count FROM users');
        const s = await db.query('SELECT COUNT(*) as count FROM students');
        const m = await db.query('SELECT COUNT(*) as count FROM meals');
        userCount = u.rows[0]?.count || 0;
        totalStudents = s.rows[0]?.count || 0;
        totalMeals = m.rows[0]?.count || 0;
        dbConnected = true;
      } catch (e) {
        dbConnected = false;
      }

      // 2. Check Python ML Service
      const mlHealth = await forecastService.checkMlHealth();

      // 3. Check Ingestion Quality
      const dq = await dataQualityService.getDataQualityMetrics();

      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        system: {
          frontend: {
            status: 'Operational',
            version: '2.0.0',
            framework: 'React + TypeScript + Vite + Tailwind CSS'
          },
          backend_api: {
            status: 'Operational',
            version: '1.0.0',
            runtime: 'Node.js Express REST API',
            port: process.env.PORT || 3001
          },
          database: {
            status: dbConnected ? 'Connected' : 'Disconnected',
            engine: 'SQLite3 (WAL Mode)',
            tables: {
              users: userCount,
              students: totalStudents,
              meals: totalMeals,
              attendance: dq.metrics.total_attendance_records
            }
          },
          ml_service: {
            status: mlHealth.online ? 'Operational' : 'Fallback Engine Active',
            model_loaded: mlHealth.model_loaded,
            model_version: mlHealth.model_version,
            service: mlHealth.service,
            endpoint: mlHealth.url
          },
          data_pipeline: {
            status: dq.status === 'GOOD' ? 'Healthy' : dq.status,
            freshness: dq.metrics.data_freshness,
            coverage: `${dq.metrics.attendance_coverage_percent}%`,
            last_ingestion: dq.metrics.latest_ingestion_time
          }
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'HEALTH_CHECK_ERROR', message: err.message } });
    }
  },

  async getDataQuality(req, res) {
    try {
      const metrics = await dataQualityService.getDataQualityMetrics();
      res.json({
        success: true,
        ...metrics
      });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'DATA_QUALITY_ERROR', message: err.message } });
    }
  }
};
