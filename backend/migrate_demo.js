import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
    `);
    console.log('Migration successful: added is_demo to users and jobs tables');
  } catch (e) {
    console.error('Migration failed:', e.message);
  } finally {
    await pool.end();
  }
}
migrate();
