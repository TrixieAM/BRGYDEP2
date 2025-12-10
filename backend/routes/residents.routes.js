// routes/residents.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET /residents - Get all residents
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM residents ORDER BY resident_id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch residents' });
  }
});

// POST /residents - Create new resident
router.post('/', async (req, res) => {
  const {
    full_name,
    address,
    provincial_address,
    dob,
    age,
    civil_status,
    contact_no,
  } = req.body;
  try {
    const [existing] = await pool.query(
      'SELECT * FROM residents WHERE LOWER(full_name) = LOWER(?) AND dob = ?',
      [full_name, dob]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: 'Resident already exists (same name and date of birth)',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO residents
        (full_name, address, provincial_address, dob, age, civil_status, contact_no)
       VALUES (?,?,?,?,?,?,?)`,
      [
        full_name,
        address,
        provincial_address,
        dob,
        age,
        civil_status,
        contact_no,
      ]
    );

    res.json({
      message: 'Resident added successfully',
      resident_id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add resident' });
  }
});

// PUT /residents/:id - Update resident
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    full_name,
    address,
    provincial_address,
    dob,
    age,
    civil_status,
    contact_no,
  } = req.body;

  try {
    const [existing] = await pool.query(
      'SELECT * FROM residents WHERE LOWER(full_name) = LOWER(?) AND dob = ? AND resident_id != ?',
      [full_name, dob, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error:
          'Another resident with same name and date of birth already exists',
      });
    }

    await pool.query(
      `UPDATE residents
       SET full_name = ?, address = ?, provincial_address = ?, dob = ?,
           age = ?, civil_status = ?, contact_no = ?
       WHERE resident_id = ?`,
      [
        full_name,
        address,
        provincial_address,
        dob,
        age,
        civil_status,
        contact_no,
        id,
      ]
    );

    res.json({ message: 'Resident updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update resident' });
  }
});

// DELETE /residents/:id - Delete resident
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM residents WHERE resident_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Resident not found' });
    }

    res.json({ message: 'Resident deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete resident' });
  }
});

module.exports = router;

