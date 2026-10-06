import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../smart_mess.db');

export const sqliteDb = new Database(dbPath);
sqliteDb.pragma('journal_mode = WAL');
sqliteDb.pragma('foreign_keys = ON');

export async function initDatabase() {
  // Create all tables if not exists
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Admin',
      hostel_assigned TEXT DEFAULT 'Aryabhata Hall (North)',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      student_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      hostel TEXT NOT NULL,
      room TEXT NOT NULL,
      dietary_pref TEXT DEFAULT 'Standard',
      status TEXT DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      meal TEXT NOT NULL,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      hostel TEXT NOT NULL,
      room TEXT DEFAULT 'N/A',
      status TEXT NOT NULL DEFAULT 'Present',
      source TEXT NOT NULL DEFAULT 'manual',
      marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unq_attendance_student_meal_date UNIQUE (student_id, date, meal)
    );

    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      meal TEXT NOT NULL,
      menu TEXT NOT NULL,
      planned_qty INTEGER NOT NULL DEFAULT 0,
      predicted_qty INTEGER NOT NULL DEFAULT 0,
      recommended_qty INTEGER NOT NULL DEFAULT 0,
      prepared_qty INTEGER NOT NULL DEFAULT 0,
      consumed_qty INTEGER NOT NULL DEFAULT 0,
      leftover_qty INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Optimal',
      notes TEXT DEFAULT '',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unq_meals_date_meal UNIQUE (date, meal)
    );

    CREATE TABLE IF NOT EXISTS predictions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      meal TEXT NOT NULL,
      expected_attendance INTEGER NOT NULL,
      menu_item TEXT NOT NULL,
      day_type TEXT NOT NULL DEFAULT 'Regular',
      holiday_event INTEGER NOT NULL DEFAULT 0,
      event_flag INTEGER NOT NULL DEFAULT 0,
      predicted_demand INTEGER NOT NULL,
      recommended_prep INTEGER NOT NULL,
      safety_buffer INTEGER NOT NULL,
      event_adjustment INTEGER NOT NULL DEFAULT 0,
      confidence TEXT NOT NULL DEFAULT 'High',
      feature_signals TEXT DEFAULT '[]',
      model_type TEXT DEFAULT 'RandomForestRegressor Ensemble',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS waste_logs (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      meal TEXT NOT NULL,
      prepared_qty INTEGER NOT NULL,
      consumed_qty INTEGER NOT NULL,
      leftover_qty INTEGER NOT NULL,
      waste_percentage REAL NOT NULL,
      highest_waste_item TEXT DEFAULT '',
      cause TEXT DEFAULT 'Normal variance',
      notes TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      item_name TEXT NOT NULL,
      category TEXT NOT NULL,
      current_stock REAL NOT NULL,
      unit TEXT NOT NULL,
      daily_avg_consumption REAL NOT NULL,
      reorder_level REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Healthy',
      recommended_purchase REAL NOT NULL DEFAULT 0,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'Normal',
      date TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      type TEXT DEFAULT 'operational'
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ingestion_logs (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      source TEXT NOT NULL,
      total_rows INTEGER NOT NULL,
      valid_rows INTEGER NOT NULL,
      invalid_rows INTEGER NOT NULL,
      duplicate_rows INTEGER NOT NULL,
      inserted_rows INTEGER NOT NULL,
      errors_json TEXT DEFAULT '[]',
      ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Indices for fast querying
    CREATE INDEX IF NOT EXISTS idx_attendance_date_meal ON attendance(date, meal);
    CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
    CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
    CREATE INDEX IF NOT EXISTS idx_predictions_date ON predictions(date);
  `);

  console.log('[Database] SQLite initialized with tables, schema, constraints and indices.');
}

const db = {
  query: async (sql, params = []) => {
    // Convert $1, $2, $3 to ?
    let sqliteSql = sql.replace(/\$\d+/g, '?');
    
    try {
      const stmt = sqliteDb.prepare(sqliteSql);
      const isSelect = sqliteSql.trim().toUpperCase().startsWith('SELECT') || sqliteSql.trim().toUpperCase().startsWith('PRAGMA');
      if (isSelect) {
        const rows = stmt.all(params);
        return { rows, rowCount: rows.length };
      } else {
        const info = stmt.run(params);
        return { rows: [], rowCount: info.changes };
      }
    } catch (err) {
      console.error('[DB Query Error]', err.message, sqliteSql, params);
      throw err;
    }
  },
  getClient: async () => {
    return {
      query: async (sql, params = []) => {
        return db.query(sql, params);
      },
      release: () => {}
    };
  },
  prepare: (sql) => {
    return sqliteDb.prepare(sql.replace(/\$\d+/g, '?'));
  },
  exec: (sql) => {
    return sqliteDb.exec(sql);
  }
};

export default db;
