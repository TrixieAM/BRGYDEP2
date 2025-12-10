// routes/certificates.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all certificates
router.get('/', async (req, res) => {
  try {
    const { certificate_type } = req.query;
    let query = 'SELECT * FROM certificates';
    const params = [];
    
    if (certificate_type) {
      query += ' WHERE certificate_type = ?';
      params.push(certificate_type);
    }
    
    query += ' ORDER BY timestap DESC';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// GET certificate by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM certificates WHERE certificate_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

// POST new certificate
router.post('/', async (req, res) => {
  try {
    const { 
      resident_id, 
      full_name, 
      certificate_type, 
      reason, 
      validity_period, 
      date_issued 
    } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO certificates (resident_id, full_name, certificate_type, reason, validity_period, date_issued) VALUES (?, ?, ?, ?, ?, ?)',
      [resident_id, full_name, certificate_type, reason, validity_period, date_issued]
    );
    
    res.status(201).json({ certificate_id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create certificate' });
  }
});

// PUT update certificate
router.put('/:id', async (req, res) => {
  try {
    const { 
      resident_id, 
      full_name, 
      certificate_type, 
      reason, 
      validity_period, 
      date_issued 
    } = req.body;
    
    await pool.query(
      'UPDATE certificates SET resident_id = ?, full_name = ?, certificate_type = ?, reason = ?, validity_period = ?, date_issued = ? WHERE certificate_id = ?',
      [resident_id, full_name, certificate_type, reason, validity_period, date_issued, req.params.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update certificate' });
  }
});

// GET certificates by resident ID
router.get('/resident/:residentId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM certificates WHERE resident_id = ? ORDER BY timestap DESC', 
      [req.params.residentId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch certificates for resident' });
  }
});

module.exports = router;

