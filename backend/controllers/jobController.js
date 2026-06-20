import pool from '../config/db.js';
import { computeQueue, computeMetrics, estimateWaitTime } from '../utils/scheduler.js';
export const submitJob = async (req, res) => {
  const { job_size, priority_stars, priority_message } = req.body;
  const { session_id, id: customer_id } = req.user;
  if (!job_size || Number(job_size) <= 0) return res.status(400).json({ error: 'Valid job size required' });
  try {
    const session = await pool.query('SELECT id FROM queue_sessions WHERE id = $1 AND status = $2', [session_id, 'active']);
    if (!session.rows.length) return res.status(400).json({ error: 'Session is not active' });
    const stars = Math.min(5, Math.max(0, Number(priority_stars) || 0));
    await pool.query('DELETE FROM users WHERE is_demo = TRUE AND id IN (SELECT customer_id FROM jobs WHERE session_id = $1)', [session_id]);
    const result = await pool.query(
      'INSERT INTO jobs (session_id, customer_id, job_size, priority_stars, priority_message) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [session_id, customer_id, job_size, stars, priority_message || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'You already have a job in this queue' });
    res.status(500).json({ error: err.message });
  }
};
export const exitQueue = async (req, res) => {
  const { session_id, id: customer_id } = req.user;
  try {
    const job = await pool.query('SELECT id, status FROM jobs WHERE session_id = $1 AND customer_id = $2', [session_id, customer_id]);
    if (!job.rows.length) return res.status(404).json({ error: 'No job found' });
    if (job.rows[0].status === 'processing' || job.rows[0].status === 'completed') {
      return res.status(400).json({ error: 'Cannot exit queue once job is processing or completed' });
    }
    await pool.query('DELETE FROM jobs WHERE id = $1', [job.rows[0].id]);
    res.json({ message: 'Successfully left the queue' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getSessionJobs = async (req, res) => {
  try {
    const session = await pool.query('SELECT * FROM queue_sessions WHERE id = $1', [req.params.id]);
    if (!session.rows.length) return res.status(404).json({ error: 'Session not found' });
    const result = await pool.query(`
      SELECT j.*, u.name as customer_name, u.phone as customer_phone,
             er.id as emergency_id, er.reason as emergency_reason, er.status as emergency_status
      FROM jobs j
      JOIN users u ON j.customer_id = u.id
      LEFT JOIN emergency_requests er ON er.job_id = j.id AND er.status = 'pending'
      WHERE j.session_id = $1
    `, [req.params.id]);
    const { algorithm, aging_enabled } = session.rows[0];
    const ordered = computeQueue(result.rows, algorithm, aging_enabled);
    const metrics = computeMetrics(result.rows);
    res.json({ jobs: ordered, metrics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const startNextJob = async (req, res) => {
  try {
    const processing = await pool.query('SELECT id FROM jobs WHERE session_id = $1 AND status = $2', [req.params.id, 'processing']);
    if (processing.rows.length) return res.status(400).json({ error: 'A job is already processing' });
    const session = await pool.query('SELECT * FROM queue_sessions WHERE id = $1', [req.params.id]);
    if (!session.rows.length) return res.status(404).json({ error: 'Session not found' });
    const jobs = await pool.query('SELECT * FROM jobs WHERE session_id = $1', [req.params.id]);
    const ordered = computeQueue(jobs.rows, session.rows[0].algorithm, session.rows[0].aging_enabled);
    const next = ordered.find(j => j.status === 'waiting');
    if (!next) return res.status(400).json({ error: 'No waiting jobs' });
    const result = await pool.query(
      'UPDATE jobs SET status = $1, start_time = NOW() WHERE id = $2 RETURNING *',
      ['processing', next.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const completeJob = async (req, res) => {
  try {
    const job = await pool.query('SELECT * FROM jobs WHERE id = $1 AND status = $2', [req.params.jobId, 'processing']);
    if (!job.rows.length) return res.status(400).json({ error: 'Job is not currently processing' });
    const result = await pool.query(
      'UPDATE jobs SET status = $1, completion_time = NOW() WHERE id = $2 RETURNING *',
      ['completed', req.params.jobId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getMyJob = async (req, res) => {
  const { session_id, id: customer_id } = req.user;
  try {
    const jobResult = await pool.query('SELECT * FROM jobs WHERE session_id = $1 AND customer_id = $2', [session_id, customer_id]);
    if (!jobResult.rows.length) return res.status(404).json({ error: 'No job found' });
    const job = jobResult.rows[0];
    const session = await pool.query(
      'SELECT qs.*, o.service_type FROM queue_sessions qs JOIN organizations o ON qs.org_id = o.id WHERE qs.id = $1',
      [session_id]
    );
    const allJobs = await pool.query('SELECT * FROM jobs WHERE session_id = $1', [session_id]);
    const estimate = estimateWaitTime(allJobs.rows, session.rows[0].algorithm, session.rows[0].aging_enabled, customer_id, session.rows[0].service_type);
    const emergency = await pool.query('SELECT * FROM emergency_requests WHERE job_id = $1 ORDER BY requested_at DESC LIMIT 1', [job.id]);
    res.json({ job, estimate, emergency: emergency.rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const requestEmergency = async (req, res) => {
  const { reason } = req.body;
  const { id: customer_id, session_id } = req.user;
  if (!reason) return res.status(400).json({ error: 'Reason required' });
  try {
    const job = await pool.query('SELECT * FROM jobs WHERE session_id = $1 AND customer_id = $2', [session_id, customer_id]);
    if (!job.rows.length) return res.status(404).json({ error: 'No job found' });
    if (job.rows[0].status === 'completed') return res.status(400).json({ error: 'Job already completed' });
    const pending = await pool.query('SELECT id FROM emergency_requests WHERE job_id = $1 AND status = $2', [job.rows[0].id, 'pending']);
    if (pending.rows.length) return res.status(400).json({ error: 'Emergency request already pending' });
    const result = await pool.query(
      'INSERT INTO emergency_requests (job_id, reason) VALUES ($1, $2) RETURNING *',
      [job.rows[0].id, reason]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const resolveEmergency = async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Status must be approved or rejected' });
  try {
    const emergency = await pool.query('SELECT * FROM emergency_requests WHERE id = $1', [req.params.emergencyId]);
    if (!emergency.rows.length) return res.status(404).json({ error: 'Request not found' });
    if (emergency.rows[0].status !== 'pending') return res.status(400).json({ error: 'Already resolved' });
    await pool.query('UPDATE emergency_requests SET status = $1, resolved_at = NOW() WHERE id = $2', [status, req.params.emergencyId]);
    if (status === 'approved') {
      await pool.query('UPDATE jobs SET emergency_approved = TRUE WHERE id = $1', [emergency.rows[0].job_id]);
    }
    res.json({ message: `Emergency request ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const compareAlgorithms = async (req, res) => {
  try {
    const jobs = await pool.query('SELECT * FROM jobs WHERE session_id = $1', [req.params.id]);
    const algorithms = ['fcfs', 'sjf', 'rr', 'priority'];
    const results = {};
    for (const algo of algorithms) {
      const ordered = computeQueue(jobs.rows, algo, true);
      let time = 0;
      const simulated = ordered.map(job => {
        const waitTime = time;
        time += Number(job.job_size);
        return { sim_wait: waitTime, sim_turnaround: waitTime + Number(job.job_size) };
      });
      results[algo] = {
        avgWaitTime: (simulated.reduce((s, j) => s + j.sim_wait, 0) / simulated.length).toFixed(2),
        avgTurnaround: (simulated.reduce((s, j) => s + j.sim_turnaround, 0) / simulated.length).toFixed(2)
      };
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const JOB_RANGES = {
  print:      { min: 1, max: 100 },
  equipment:  { min: 15, max: 120 },
  healthcare: { min: 5, max: 45 },
  support:    { min: 1, max: 10 },
  food:       { min: 1, max: 15 },
  general:    { min: 1, max: 50 },
};
const NAMES = [
  'Aarav Sharma', 'Ananya Gupta', 'Vihaan Patel', 'Diya Reddy', 'Arjun Mehta',
  'Kiara Nair', 'Dhruv Joshi', 'Sneha Kapoor', 'Kabir Singh', 'Myra Verma',
  'Rahul Desai', 'Isha Malhotra', 'Arnav Kulkarni', 'Riya Choudhary', 'Neil Iyer',
];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randPhone = () => `9${rand(100000000, 999999999)}`;
export const fillDemo = async (req, res) => {
  try {
    const session = await pool.query(
      `SELECT qs.id, qs.status, o.service_type 
       FROM queue_sessions qs 
       JOIN organizations o ON qs.org_id = o.id 
       WHERE qs.id = $1`,
      [req.params.id]
    );
    if (!session.rows.length) return res.status(404).json({ error: 'Session not found' });
    if (session.rows[0].status !== 'active') return res.status(400).json({ error: 'Session is not active' });
    const serviceType = session.rows[0].service_type;
    const range = JOB_RANGES[serviceType] || JOB_RANGES.general;
    for (let i = 0; i < 15; i++) {
      const name = NAMES[i];
      const phone = randPhone();
      const jobSize = rand(range.min, range.max);
      const stars = rand(0, 5);
      const userResult = await pool.query(
        'INSERT INTO users (name, phone, role, is_demo) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, phone, 'customer', true]
      );
      const customerId = userResult.rows[0].id;
      await pool.query(
        'INSERT INTO jobs (session_id, customer_id, job_size, priority_stars, is_demo) VALUES ($1, $2, $3, $4, $5)',
        [req.params.id, customerId, jobSize, stars, true]
      );
    }
    const demoJobs = await pool.query('SELECT id FROM jobs WHERE session_id = $1 AND is_demo = TRUE ORDER BY id LIMIT 2', [req.params.id]);
    if (demoJobs.rows.length >= 2) {
      await pool.query(
        "INSERT INTO emergency_requests (job_id, reason, status) VALUES ($1, $2, 'pending')",
        [demoJobs.rows[0].id, 'I have a flight to catch in 1 hour']
      );
      await pool.query(
        "INSERT INTO emergency_requests (job_id, reason, status) VALUES ($1, $2, 'pending')",
        [demoJobs.rows[1].id, 'I have a lecture scheduled in 30 mins']
      );
    }
    res.json({ message: 'Demo jobs inserted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const clearDemo = async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE is_demo = TRUE AND id IN (SELECT customer_id FROM jobs WHERE session_id = $1 AND is_demo = TRUE)', [req.params.id]);
    res.json({ message: 'Demo entries cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};