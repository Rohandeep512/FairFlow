import pool from '../config/db.js';
import { getAlgorithmRecommendation, predictCompletion } from '../utils/aiAdvisor.js';
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
export const createSession = async (req, res) => {
  const { org_id, algorithm, aging_enabled, time_quantum } = req.body;
  if (!org_id || !algorithm) return res.status(400).json({ error: 'org_id and algorithm required' });
  if (algorithm === 'rr' && !time_quantum) return res.status(400).json({ error: 'time_quantum required for Round Robin' });
  try {
    const org = await pool.query('SELECT id FROM organizations WHERE id = $1 AND admin_id = $2', [org_id, req.user.id]);
    if (!org.rows.length) return res.status(403).json({ error: 'Not your organization' });
    let code = generateCode();
    while ((await pool.query('SELECT id FROM queue_sessions WHERE join_code = $1', [code])).rows.length) {
      code = generateCode();
    }
    const result = await pool.query(
      'INSERT INTO queue_sessions (org_id, algorithm, aging_enabled, time_quantum, join_code) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [org_id, algorithm, aging_enabled ?? true, time_quantum ?? null, code]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getSession = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT qs.*, o.name as org_name, o.service_type
      FROM queue_sessions qs
      JOIN organizations o ON qs.org_id = o.id
      WHERE qs.id = $1
    `, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Session not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const endSession = async (req, res) => {
  try {
    const processing = await pool.query('SELECT id FROM jobs WHERE session_id = $1 AND status = $2', [req.params.id, 'processing']);
    if (processing.rows.length) return res.status(400).json({ error: 'Cannot end session while a job is processing' });
    await pool.query('UPDATE queue_sessions SET status = $1, ended_at = NOW() WHERE id = $2', ['ended', req.params.id]);
    res.json({ message: 'Session ended' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getAIRecommendation = async (req, res) => {
  try {
    const session = await pool.query('SELECT qs.*, o.service_type FROM queue_sessions qs JOIN organizations o ON qs.org_id = o.id WHERE qs.id = $1', [req.params.id]);
    if (!session.rows.length) return res.status(404).json({ error: 'Session not found' });
    const jobs = await pool.query('SELECT job_size FROM jobs WHERE session_id = $1', [req.params.id]);
    const jobSizes = jobs.rows.map(j => Number(j.job_size));
    const recommendation = await getAlgorithmRecommendation(session.rows[0].service_type, jobSizes);
    res.json(recommendation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getPrediction = async (req, res) => {
  try {
    const session = await pool.query('SELECT algorithm FROM queue_sessions WHERE id = $1', [req.params.id]);
    if (!session.rows.length) return res.status(404).json({ error: 'Session not found' });
    const jobs = await pool.query('SELECT * FROM jobs WHERE session_id = $1', [req.params.id]);
    const result = await predictCompletion(jobs.rows, session.rows[0].algorithm);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};