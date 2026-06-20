import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS priority_stars INTEGER DEFAULT 0;
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS priority_message TEXT;
    `);
    console.log('Migration successful: added priority_stars and priority_message to jobs table');
  } catch (e) {
    console.error('Migration failed:', e.message);
  } finally {
    await pool.end();
  }
}
migrate();
