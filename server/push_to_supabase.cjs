const sqlite = require('better-sqlite3');
const { Client } = require('pg');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const tables = [
  'users',
  'students',
  'attendance',
  'meals',
  'predictions',
  'waste_logs',
  'inventory',
  'alerts',
  'settings'
];

async function migrateData(supabaseUrl) {
  const sqliteDb = new sqlite(path.join(__dirname, 'smart_mess.db'), { fileMustExist: true });
  
  const pgClient = new Client({
    connectionString: supabaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('\n[1/3] Connecting to Supabase...');
    await pgClient.connect();
    console.log('✅ Connected to Supabase.');

    console.log('\n[2/3] Creating schema (if not exists)...');
    const schemaSql = `
      CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'Admin', hostel_assigned TEXT DEFAULT 'Aryabhata Hall (North)', created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS students (id TEXT PRIMARY KEY, student_id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, hostel TEXT NOT NULL, room TEXT NOT NULL, dietary_pref TEXT DEFAULT 'Standard', status TEXT DEFAULT 'Active', created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS attendance (id TEXT PRIMARY KEY, date TEXT NOT NULL, meal TEXT NOT NULL, student_id TEXT NOT NULL, student_name TEXT NOT NULL, hostel TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Present', marked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS meals (id TEXT PRIMARY KEY, date TEXT NOT NULL, meal TEXT NOT NULL, menu TEXT NOT NULL, planned_qty INTEGER NOT NULL DEFAULT 0, predicted_qty INTEGER NOT NULL DEFAULT 0, recommended_qty INTEGER NOT NULL DEFAULT 0, prepared_qty INTEGER NOT NULL DEFAULT 0, consumed_qty INTEGER NOT NULL DEFAULT 0, leftover_qty INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'Optimal', notes TEXT DEFAULT '', updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS predictions (id TEXT PRIMARY KEY, date TEXT NOT NULL, meal TEXT NOT NULL, expected_attendance INTEGER NOT NULL, menu_item TEXT NOT NULL, day_type TEXT NOT NULL DEFAULT 'Regular', holiday_event INTEGER NOT NULL DEFAULT 0, predicted_demand INTEGER NOT NULL, recommended_prep INTEGER NOT NULL, safety_buffer INTEGER NOT NULL, confidence TEXT NOT NULL DEFAULT 'High', feature_signals TEXT DEFAULT '[]', model_type TEXT DEFAULT 'RandomForestRegressor Ensemble', created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS waste_logs (id TEXT PRIMARY KEY, date TEXT NOT NULL, meal TEXT NOT NULL, prepared_qty INTEGER NOT NULL, consumed_qty INTEGER NOT NULL, leftover_qty INTEGER NOT NULL, waste_percentage REAL NOT NULL, highest_waste_item TEXT DEFAULT '', cause TEXT DEFAULT 'Normal variance', notes TEXT DEFAULT '');
      CREATE TABLE IF NOT EXISTS inventory (id TEXT PRIMARY KEY, item_name TEXT NOT NULL, category TEXT NOT NULL, current_stock REAL NOT NULL, unit TEXT NOT NULL, daily_avg_consumption REAL NOT NULL, reorder_level REAL NOT NULL, status TEXT NOT NULL DEFAULT 'Healthy', recommended_purchase REAL NOT NULL DEFAULT 0, last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS alerts (id TEXT PRIMARY KEY, title TEXT NOT NULL, message TEXT NOT NULL, severity TEXT NOT NULL DEFAULT 'Normal', date TEXT NOT NULL, is_read INTEGER DEFAULT 0, type TEXT DEFAULT 'operational');
      CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    `;
    await pgClient.query(schemaSql);
    console.log('✅ Schema verified.');

    console.log('\n[3/3] Migrating data...');
    for (const table of tables) {
      const rows = sqliteDb.prepare(`SELECT * FROM ${table}`).all();
      
      if (rows.length === 0) {
        console.log(`  - ⏩ ${table}: 0 rows (skipped)`);
        continue;
      }

      const columns = Object.keys(rows[0]);
      
      let inserted = 0;
      for (const row of rows) {
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const values = columns.map(col => row[col]);
        
        try {
          await pgClient.query(`
            INSERT INTO ${table} (${columns.join(', ')})
            VALUES (${placeholders})
            ON CONFLICT DO NOTHING
          `, values);
          inserted++;
        } catch (e) {
          console.error(`  - ❌ Error inserting into ${table}:`, e.message);
        }
      }
      console.log(`  - ✅ ${table}: Migrated ${inserted}/${rows.length} rows`);
    }

    console.log('\n🎉 Migration complete! Your Supabase database is now fully synced.');
  } catch (err) {
    console.error('\n❌ Migration Failed:', err.message);
  } finally {
    sqliteDb.close();
    await pgClient.end();
    rl.close();
  }
}

console.log('=== SMART MESS: SQLite to Supabase Migrator ===\n');
rl.question('Paste your Supabase PostgreSQL connection string (including password):\n> ', (url) => {
  if (!url || !url.startsWith('postgres')) {
    console.log('Invalid URL. It must start with postgresql://');
    rl.close();
    return;
  }
  migrateData(url.trim());
});
