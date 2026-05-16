// routes/certificate-of-low-income.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { generateTransactionNumberForType } = require('../utils/transaction.utils');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all active certificate of low income records
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cli.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM certificate_of_low_income cli
       LEFT JOIN official_signature sig ON cli.signature_id = sig.signature_id
       WHERE cli.is_active = TRUE 
       ORDER BY cli.date_created DESC, cli.certificate_of_low_income_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch certificate of low income records' });
  }
});

// GET all records including historical (for transaction log)
router.get('/transactions/all', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cli.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM certificate_of_low_income cli
       LEFT JOIN official_signature sig ON cli.signature_id = sig.signature_id
       ORDER BY cli.date_created DESC, cli.certificate_of_low_income_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// GET single certificate of low income by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT cli.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM certificate_of_low_income cli
       LEFT JOIN official_signature sig ON cli.signature_id = sig.signature_id
       WHERE cli.certificate_of_low_income_id = ?`,
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

// CREATE new certificate of low income
router.post('/', async (req, res) => {
  try {
    const {
      resident_id,
      full_name,
      address,
      source_of_income,
      income_amount,
      civil_status,
      date_issued,
      date_expired,
      remarks,
      request_reason,
      transaction_number,
      control_no,
      prepared_by_name,
      prepared_by_position,
      use_signature,
      signature_id,
    } = req.body;

    if (!full_name || !address || !source_of_income || !income_amount || !date_issued || !date_expired || !request_reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || generateTransactionNumberForType('CLI');

    const [result] = await pool.query(
      `INSERT INTO certificate_of_low_income 
        (resident_id, full_name, address, source_of_income, income_amount, civil_status, date_issued, date_expired, remarks, request_reason, transaction_number, control_no, prepared_by_name, prepared_by_position, use_signature, signature_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id || null,
        full_name,
        address,
        source_of_income,
        income_amount,
        civil_status,
        date_issued,
        date_expired,
        remarks || null,
        request_reason,
        finalTransactionNumber,
        control_no || null,
        prepared_by_name || null,
        prepared_by_position || null,
        use_signature ? 1 : 0,
        use_signature && signature_id ? signature_id : null,
      ]
    );

    const [rows] = await pool.query(
      `SELECT cli.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM certificate_of_low_income cli
       LEFT JOIN official_signature sig ON cli.signature_id = sig.signature_id
       WHERE cli.certificate_of_low_income_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing certificate of low income
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resident_id,
      full_name,
      address,
      source_of_income,
      income_amount,
      civil_status,
      date_issued,
      date_expired,
      remarks,
      request_reason,
      transaction_number,
      control_no,
      prepared_by_name,
      prepared_by_position,
      use_signature,
      signature_id,
    } = req.body;

    // Get the existing record
    const [existing] = await pool.query(
      `SELECT * FROM certificate_of_low_income WHERE certificate_of_low_income_id = ?`,
      [id]
    );

    if (existing.length === 0)
      return res.status(404).json({ error: 'Record not found' });

    // Generate a NEW transaction number for the new entry
    const newTransactionNumber = generateTransactionNumberForType('CLI');

    // Mark the old record as inactive
    await pool.query(
      `UPDATE certificate_of_low_income SET is_active = FALSE WHERE certificate_of_low_income_id = ?`,
      [id]
    );

    // Create a NEW record entry with the updated data and new transaction number
    const [result] = await pool.query(
      `INSERT INTO certificate_of_low_income 
        (resident_id, full_name, address, source_of_income, income_amount, civil_status, date_issued, date_expired, remarks, request_reason, transaction_number, control_no, prepared_by_name, prepared_by_position, use_signature, signature_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id || null,
        full_name,
        address,
        source_of_income,
        income_amount,
        civil_status,
        date_issued,
        date_expired,
        remarks || null,
        request_reason,
        newTransactionNumber,
        control_no || null,
        prepared_by_name || null,
        prepared_by_position || null,
        use_signature ? 1 : 0,
        use_signature && signature_id ? signature_id : null,
      ]
    );

    // Get the newly created record
    const [newRecord] = await pool.query(
      `SELECT cli.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM certificate_of_low_income cli
       LEFT JOIN official_signature sig ON cli.signature_id = sig.signature_id
       WHERE cli.certificate_of_low_income_id = ?`,
      [result.insertId]
    );

    res.json(newRecord[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE certificate of low income (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE certificate_of_low_income SET is_active = FALSE, date_updated = NOW() WHERE certificate_of_low_income_id = ?`,
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
