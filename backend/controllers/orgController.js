import pool from '../config/db.js';

export const createOrg = async (req, res) => {
  const { name, service_type } = req.body;
  if (!name || !service_type) return res.status(400).json({ error: 'All fields required' });
  const valid = ['print', 'equipment', 'healthcare', 'support', 'food', 'general'];
  if (!valid.includes(service_type)) return res.status(400).json({ error: 'Invalid service type' });
  try {
    const result = await pool.query(
      'INSERT INTO organizations (admin_id, name, service_type) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, name, service_type]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyOrgs = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM organizations WHERE admin_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteOrg = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM organizations WHERE id = $1 AND admin_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Organization not found or unauthorized' });
    res.json({ message: 'Organization deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};