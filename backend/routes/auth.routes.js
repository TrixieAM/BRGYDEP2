// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');

// POST /auth/login - User login
router.post('/login', authenticateUser, (req, res) => {
  res.json({
    message: 'Login successful',
    user: req.user,
    token: req.token,
  });
});

module.exports = router;

