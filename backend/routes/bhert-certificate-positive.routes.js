// routes/bhert-certificate-positive.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { generateTransactionNumberForType } = require('../utils/transaction.utils');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all active BHERT certificate (positive) records
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM bhert_certificate_positive WHERE is_active = TRUE ORDER BY bhert_certificate_positive_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch BHERT certificate records' });
  }
});

// GET all records including historical (for transaction log)
router.get('/transactions/all', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM bhert_certificate_positive ORDER BY date_created DESC, bhert_certificate_positive_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching BHERT positive transaction history:', err);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// GET single BHERT certificate (positive) record by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM bhert_certificate_positive WHERE bhert_certificate_positive_id = ?`,
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

// CREATE new BHERT certificate (positive)
router.post('/', async (req, res) => {
  try {
    const {
      resident_id,
      full_name,
      address,
      request_reason,
      date_issued,
      transaction_number,
    } = req.body;

    if (!full_name || !address || !request_reason || !date_issued) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || generateTransactionNumberForType('BHP');

    const [result] = await pool.query(
      `INSERT INTO bhert_certificate_positive 
        (resident_id, full_name, address, request_reason, date_issued, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        full_name,
        address,
        request_reason,
        date_issued,
        finalTransactionNumber,
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM bhert_certificate_positive WHERE bhert_certificate_positive_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing BHERT certificate (positive)
// Create a NEW record, mark old as inactive, generate new transaction number
router.put('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      resident_id,
      full_name,
      address,
      request_reason,
      date_issued,
    } = req.body;

    const [existing] = await connection.query(
      'SELECT * FROM bhert_certificate_positive WHERE bhert_certificate_positive_id = ?',
      [id]
    );
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Record not found' });
    }

    const newTransactionNumber = generateTransactionNumberForType('BHP');

    await connection.query(
      `UPDATE bhert_certificate_positive
       SET is_active = FALSE, date_updated = NOW()
       WHERE bhert_certificate_positive_id = ?`,
      [id]
    );

    const [result] = await connection.query(
      `INSERT INTO bhert_certificate_positive
        (resident_id, full_name, address, request_reason, date_issued, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        full_name,
        address,
        request_reason,
        date_issued,
        newTransactionNumber,
      ]
    );

    const [newRecord] = await connection.query(
      'SELECT * FROM bhert_certificate_positive WHERE bhert_certificate_positive_id = ?',
      [result.insertId]
    );

    await connection.commit();
    res.json(newRecord[0]);
  } catch (err) {
    await connection.rollback();
    console.error('Failed to update BHERT positive record', err);
    res.status(500).json({ error: 'Failed to update record' });
  } finally {
    connection.release();
  }
});

// DELETE BHERT certificate (positive) (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE bhert_certificate_positive SET is_active = FALSE, date_updated = NOW() WHERE bhert_certificate_positive_id = ?`,
      [id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

module.exports = router;

