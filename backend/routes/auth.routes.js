// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db.config');
const { authenticateUser, verifyToken, requireRole } = require('../middleware/auth.middleware');
const { logAudit } = require('../utils/audit.utils');

// POST /auth/login - User login
router.post('/login', authenticateUser, (req, res) => {
  res.json({
    message: 'Login successful',
    user: req.user,
    token: req.token,
  });
});

// Admin-initiated reset password: generate temp password and return it
router.post('/users/:id/reset-password', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashed = await bcrypt.hash(tempPassword, 10);

    const [result] = await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [hashed, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await logAudit(req.user, 'USER_RESET_PASSWORD', 'user', id, {});
    res.json({ success: true, tempPassword });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Self-service change password
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new passwords are required' });
    }

    const [rows] = await pool.query('SELECT password FROM users WHERE user_id = ?', [req.user.user_id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(oldPassword, rows[0].password);
    if (!valid) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [hashed, req.user.user_id]);
    await logAudit(req.user, 'USER_CHANGE_PASSWORD', 'user', req.user.user_id, {});
    res.json({ success: true });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;

