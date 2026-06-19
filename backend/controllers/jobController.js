import pool from '../config/db.js';
import { computeQueue, computeMetrics, estimateWaitTime } from '../utils/scheduler.js';

export const submitJob = async (req, res) => {
  const { job_size } = req.body;
  const { session_id, id: customer_id } = req.user;
  if (!job_size || Number(job_size) <= 0) return res.status(400).json({ error: 'Valid job size required' });
  try {
    const session = await pool.query('SELECT id FROM queue_sessions WHERE id = $1 AND status = $2', [session_id, 'active']);
    if (!session.rows.length) return res.status(400).json({ error: 'Session is not active' });
    const result = await pool.query(
      'INSERT INTO jobs (session_id, customer_id, job_size) VALUES ($1, $2, $3) RETURNING *',
      [session_id, customer_id, job_size]
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