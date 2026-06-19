import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const adminRegister = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  try {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length) return res.status(400).json({ error: 'Email already registered' });
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, password_hash, 'admin']
    );
    const token = jwt.sign({ id: result.rows[0].id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'All fields required' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND role = $2', [email, 'admin']);
    if (!result.rows.length) return res.status(400).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const customerJoin = async (req, res) => {
  const { join_code, name, phone } = req.body;
  if (!join_code || !name || !phone) return res.status(400).json({ error: 'All fields required' });
  try {
    const session = await pool.query(
      'SELECT id FROM queue_sessions WHERE join_code = $1 AND status = $2',
      [join_code.toUpperCase(), 'active']
    );
    if (!session.rows.length) return res.status(400).json({ error: 'Invalid or expired queue code' });
    const session_id = session.rows[0].id;

    const existingUser = await pool.query('SELECT id FROM users WHERE phone = $1 AND role = $2', [phone, 'customer']);
    let customer_id;
    if (existingUser.rows.length) {
      customer_id = existingUser.rows[0].id;
      // Update name in case they are rejoining with the same phone but a different name
      await pool.query('UPDATE users SET name = $1 WHERE id = $2', [name, customer_id]);
      const existingJob = await pool.query('SELECT id FROM jobs WHERE session_id = $1 AND customer_id = $2', [session_id, customer_id]);
      if (existingJob.rows.length) return res.status(400).json({ error: 'Already joined this queue' });
    } else {
      const newUser = await pool.query(
        'INSERT INTO users (name, phone, role) VALUES ($1, $2, $3) RETURNING id',
        [name, phone, 'customer']
      );
      customer_id = newUser.rows[0].id;
    }

    const token = jwt.sign({ id: customer_id, role: 'customer', session_id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, session_id, customer_id, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};