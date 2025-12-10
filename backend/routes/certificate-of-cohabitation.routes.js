// routes/certificate-of-cohabitation.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { generateTransactionNumberForType } = require('../utils/transaction.utils');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all active cohabitation certificate records
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM certificate_of_cohabitation WHERE is_active = TRUE ORDER BY certificate_of_cohabitation_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cohabitation certificate records' });
  }
});

// GET all records including historical (for transaction log)
router.get('/transactions/all', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM certificate_of_cohabitation ORDER BY date_created DESC, certificate_of_cohabitation_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching transaction history:', err);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// GET single cohabitation certificate by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM certificate_of_cohabitation WHERE certificate_of_cohabitation_id = ?`,
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

// CREATE new cohabitation certificate
router.post('/', async (req, res) => {
  try {
    const {
      resident1_id,
      resident2_id,
      full_name1,
      dob1,
      full_name2,
      dob2,
      address,
      date_started,
      date_issued,
      witness1_name,
      witness2_name,
      transaction_number,
    } = req.body;

    if (
      !resident1_id ||
      !resident2_id ||
      !full_name1 ||
      !dob1 ||
      !full_name2 ||
      !dob2 ||
      !address ||
      !date_started ||
      !date_issued
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || generateTransactionNumberForType('COH');

    const [result] = await pool.query(
      `INSERT INTO certificate_of_cohabitation
        (resident1_id, resident2_id, full_name1, dob1, full_name2, dob2, address, date_started, date_issued, witness1_name, witness2_name, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident1_id,
        resident2_id,
        full_name1,
        dob1,
        full_name2,
        dob2,
        address,
        date_started,
        date_issued,
        witness1_name,
        witness2_name,
        finalTransactionNumber,
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM certificate_of_cohabitation WHERE certificate_of_cohabitation_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing cohabitation certificate
// When updating, we create a NEW record entry with a new transaction number
// The old record remains in history (marked as inactive)
router.put('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      resident1_id,
      resident2_id,
      full_name1,
      dob1,
      full_name2,
      dob2,
      address,
      date_started,
      date_issued,
      witness1_name,
      witness2_name,
    } = req.body;

    if (
      !resident1_id ||
      !resident2_id ||
      !full_name1 ||
      !dob1 ||
      !full_name2 ||
      !dob2 ||
      !address ||
      !date_started ||
      !date_issued
    ) {
      await connection.rollback();
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get the existing record
    const [existing] = await connection.query(
      'SELECT * FROM certificate_of_cohabitation WHERE certificate_of_cohabitation_id = ?',
      [id]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Record not found' });
    }

    // Generate a NEW transaction number for the new entry
    const newTransactionNumber = generateTransactionNumberForType('COH');

    // Mark the old record as inactive (to preserve it in history)
    await connection.query(
      `UPDATE certificate_of_cohabitation SET is_active = FALSE, date_updated = NOW() WHERE certificate_of_cohabitation_id = ?`,
      [id]
    );

    // Create a NEW record entry with the updated data and new transaction number
    const [result] = await connection.query(
      `INSERT INTO certificate_of_cohabitation
        (resident1_id, resident2_id, full_name1, dob1, full_name2, dob2, address, date_started, date_issued, witness1_name, witness2_name, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident1_id,
        resident2_id,
        full_name1,
        dob1,
        full_name2,
        dob2,
        address,
        date_started,
        date_issued,
        witness1_name,
        witness2_name,
        newTransactionNumber,
      ]
    );

    // Get the newly created record
    const [newRecord] = await connection.query(
      'SELECT * FROM certificate_of_cohabitation WHERE certificate_of_cohabitation_id = ?',
      [result.insertId]
    );

    await connection.commit();
    res.json(newRecord[0]);
  } catch (err) {
    await connection.rollback();
    console.error('Error updating cohabitation certificate record:', err);
    res.status(500).json({ error: 'Failed to update record' });
  } finally {
    connection.release();
  }
});

// DELETE cohabitation certificate (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE certificate_of_cohabitation SET is_active = FALSE, date_updated = NOW() WHERE certificate_of_cohabitation_id = ?`,
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

