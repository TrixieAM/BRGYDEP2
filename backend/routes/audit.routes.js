// routes/audit.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.use(verifyToken);
router.use(requireRole(['admin', 'chairman']));

router.get('/', async (req, res) => {
  try {
    const { user_id, action, entity_type, start, end, page = 1, limit = 25 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const filters = [];
    const params = [];

    if (user_id) {
      filters.push('user_id = ?');
      params.push(user_id);
    }
    if (action) {
      filters.push('action = ?');
      params.push(action);
    }
    if (entity_type) {
      filters.push('entity_type = ?');
      params.push(entity_type);
    }
    if (start) {
      filters.push('created_at >= ?');
      params.push(start);
    }
    if (end) {
      filters.push('created_at <= ?');
      params.push(end);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT audit_id, user_id, action, entity_type, entity_id, metadata, created_at
       FROM audit_logs
       ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM audit_logs ${where}`,
      params
    );

    res.json({ data: rows, total: countRows[0].total });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;
