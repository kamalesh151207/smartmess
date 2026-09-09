import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function initDatabase() {
  try {
    const client = await db.connect();
    console.log('[Database] Connected successfully to Supabase Postgres (Pool).');
    client.release();
  } catch (err) {
    console.error('[Database] Failed to connect to Supabase:', err);
  }
}

// Map db.query to act properly (Pool handles it natively but we export db so index.js can use it)
// index.js will use `await db.query(...)` and `await db.connect()` (as `db.getClient()` in my scripts usually, wait I need to check)
db.getClient = () => db.connect();

export default db;
