// routes/users.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db.config');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { logAudit } = require('../utils/audit.utils');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET /users - Get all users (Admin only)
router.get('/', requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, username, name, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /users - Create new user (Admin only)
router.post('/', requireRole('admin'), async (req, res) => {
  const { username, name, password, role } = req.body;

  if (!username || !name || !password) {
    return res
      .status(400)
      .json({ error: 'Username, name, and password are required' });
  }

  try {
    const [existingUsers] = await pool.query(
      'SELECT user_id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (username, name, password, role) VALUES (?,?,?,?)`,
      [username, name, hashedPassword, role || 'staff']
    );
    await logAudit(req.user, 'USER_CREATE', 'user', result.insertId, { username, role });
    res.json({ message: 'User created', user_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /users/:id - Update user (Admin only)
router.put('/:id', requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { username, name, password, role } = req.body;

  if (!username || !name) {
    return res.status(400).json({ error: 'Username and name are required' });
  }

  try {
    const [existingUsers] = await pool.query(
      'SELECT user_id FROM users WHERE username = ? AND user_id != ?',
      [username, id]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    let updateQuery = 'UPDATE users SET username = ?, name = ?, role = ?';
    let queryParams = [username, name, role];

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      queryParams.push(hashedPassword);
    }

    updateQuery += ' WHERE user_id = ?';
    queryParams.push(id);

    await pool.query(updateQuery, queryParams);
    await logAudit(req.user, 'USER_UPDATE', 'user', id, { username, role });
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /users/:id - Delete user (Admin only)
router.delete('/:id', requireRole('admin'), async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM users WHERE user_id = ?', [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await logAudit(req.user, 'USER_DELETE', 'user', id, {});
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;

