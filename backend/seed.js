import pool from './config/db.js';
import bcrypt from 'bcryptjs';

const seed = async () => {
  await pool.query('DELETE FROM emergency_requests');
  await pool.query('DELETE FROM jobs');
  await pool.query('DELETE FROM queue_sessions');
  await pool.query('DELETE FROM organizations');
  await pool.query('DELETE FROM users');

  const password_hash = await bcrypt.hash('admin123', 10);
  const admin = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
    ['Admin User', 'admin@fairflow.com', password_hash, 'admin']
  );

  const org = await pool.query(
    'INSERT INTO organizations (admin_id, name, service_type) VALUES ($1, $2, $3) RETURNING *',
    [admin.rows[0].id, 'NSUT Print Shop', 'print']
  );

  const session = await pool.query(
    'INSERT INTO queue_sessions (org_id, algorithm, aging_enabled, join_code) VALUES ($1, $2, $3, $4) RETURNING *',
    [org.rows[0].id, 'sjf', true, 'PRINT1']
  );

  const customers = [
    { name: 'Rohan', phone: '9999999991', job_size: 45 },
    { name: 'Ananya', phone: '9999999992', job_size: 3 },
    { name: 'Priya', phone: '9999999993', job_size: 12 },
    { name: 'Karan', phone: '9999999994', job_size: 7 },
    { name: 'Simran', phone: '9999999995', job_size: 2 },
    { name: 'Dev', phone: '9999999996', job_size: 20 },
  ];

  for (const c of customers) {
    const user = await pool.query(
      'INSERT INTO users (name, phone, role) VALUES ($1, $2, $3) RETURNING id',
      [c.name, c.phone, 'customer']
    );
    await pool.query(
      'INSERT INTO jobs (session_id, customer_id, job_size) VALUES ($1, $2, $3)',
      [session.rows[0].id, user.rows[0].id, c.job_size]
    );
  }

  console.log('Seed complete');
  console.log('Admin: admin@fairflow.com / admin123');
  console.log('Queue code: PRINT1');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });