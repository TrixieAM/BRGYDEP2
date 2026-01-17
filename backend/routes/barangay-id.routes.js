const express = require('express');
const db = require('../config/db.config.js');
const { verifyToken } = require('../middleware/auth.middleware.js');

const router = express.Router();

/**
 * GET /barangay-id
 * Get all residents (for selection)
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        resident_id,
        full_name,
        address,
        provincial_address,
        dob,
        age,
        civil_status,
        contact_no,
        created_at
      FROM residents
      ORDER BY full_name ASC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch residents' });
      }

      res.json(results);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /barangay-id/:residentId
 * Get specific resident data for ID card
 */
router.get('/:residentId', verifyToken, async (req, res) => {
  try {
    const { residentId } = req.params;

    const query = `
      SELECT 
        resident_id,
        full_name,
        address,
        provincial_address,
        dob,
        age,
        civil_status,
        contact_no,
        created_at
      FROM residents
      WHERE resident_id = ?
    `;

    db.query(query, [residentId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch resident data' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Resident not found' });
      }

      res.json(results[0]);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
