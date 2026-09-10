import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../smart_mess.db');

const sqliteDb = new Database(dbPath);

export async function initDatabase() {
  console.log('[Database] Connected successfully to SQLite wrapper.');
}

const db = {
  query: async (sql, params = []) => {
    // Convert $1, $2 etc to ?
    let sqliteSql = sql.replace(/\$\d+/g, '?');
    
    try {
      const stmt = sqliteDb.prepare(sqliteSql);
      if (sqliteSql.trim().toUpperCase().startsWith('SELECT') || sqliteSql.trim().toUpperCase().startsWith('PRAGMA')) {
        const rows = stmt.all(params);
        return { rows };
      } else {
        const info = stmt.run(params);
        return { rows: [], rowCount: info.changes };
      }
    } catch (err) {
      console.error('[DB Query Error]', err, sqliteSql, params);
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
  }
};

export default db;
