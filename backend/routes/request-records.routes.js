// routes/request-records.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all request records
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, address, birthday, age, provincial_address, contact_no, civil_status, request_reason, date_issued, date_created, date_updated, is_active
       FROM request_records
       WHERE is_active = TRUE
       ORDER BY id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// GET single request record
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT id, name, address, birthday, age, provincial_address, contact_no, civil_status, request_reason, date_issued, date_created, date_updated, is_active
       FROM request_records WHERE id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// POST create request record
router.post('/', async (req, res) => {
  try {
    const {
      name,
      address,
      birthday,
      age,
      provincial_address,
      contact_no,
      civil_status,
      request_reason,
      date_issued,
    } = req.body;

    if (
      !name ||
      !address ||
      !birthday ||
      !Number.isFinite(Number(age)) ||
      !civil_status ||
      !request_reason ||
      !date_issued
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.query(
      `INSERT INTO request_records (name, address, birthday, age, provincial_address, contact_no, civil_status, request_reason, date_issued)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        name,
        address,
        birthday,
        Number(age),
        provincial_address || null,
        contact_no || null,
        civil_status,
        request_reason,
        date_issued,
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM request_records WHERE id = ?`,
      [result.insertId]
    );
    res.status(201).json({ id: result.insertId, ...rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// PUT update request record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      birthday,
      age,
      provincial_address,
      contact_no,
      civil_status,
      request_reason,
      date_issued,
      is_active,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE request_records SET
        name = ?, address = ?, birthday = ?, age = ?, provincial_address = ?, contact_no = ?, civil_status = ?, request_reason = ?, date_issued = ?, is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        name,
        address,
        birthday,
        Number(age),
        provincial_address || null,
        contact_no || null,
        civil_status,
        request_reason,
        date_issued,
        is_active,
        id,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE request record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `DELETE FROM request_records WHERE id = ?`,
      [id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

module.exports = router;

