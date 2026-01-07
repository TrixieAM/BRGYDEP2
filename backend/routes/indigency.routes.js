// routes/indigency.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { generateTransactionNumber, generateTransactionNumberForType } = require('../utils/transaction.utils');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all active indigency records
router.get('/', async (req, res) => {
  try {
    // Join with official_signature to get signature data
    const [rows] = await pool.query(
      `SELECT
         indigency.indigency_id, indigency.resident_id, indigency.full_name, indigency.address, indigency.provincial_address,
         indigency.dob, indigency.age, indigency.civil_status, indigency.contact_no, indigency.request_reason, indigency.remarks,
         indigency.date_issued, indigency.transaction_number, indigency.date_created, indigency.date_updated, indigency.is_active,
         indigency.use_signature, indigency.signature_id,
         sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM indigency
       LEFT JOIN official_signature sig ON indigency.signature_id = sig.signature_id
       WHERE indigency.is_active = TRUE
       ORDER BY indigency.indigency_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch indigency records' });
  }
});

// GET all records including historical (for transaction log)
router.get('/transactions/all', async (req, res) => {
  try {
    // Get all records including inactive ones for complete transaction history
    // This shows all transactions including old ones that were edited
    const [rows] = await pool.query(
      `SELECT
         indigency.indigency_id, indigency.resident_id, indigency.full_name, indigency.address, indigency.provincial_address,
         indigency.dob, indigency.age, indigency.civil_status, indigency.contact_no, indigency.request_reason, indigency.remarks,
         indigency.date_issued, indigency.transaction_number, indigency.date_created, indigency.date_updated, indigency.is_active,
         indigency.use_signature, indigency.signature_id,
         sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM indigency
       LEFT JOIN official_signature sig ON indigency.signature_id = sig.signature_id
       ORDER BY indigency.date_created DESC, indigency.indigency_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// GET single record by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT
         indigency.indigency_id, indigency.resident_id, indigency.full_name, indigency.address, indigency.provincial_address,
         indigency.dob, indigency.age, indigency.civil_status, indigency.contact_no, indigency.request_reason, indigency.remarks,
         indigency.date_issued, indigency.transaction_number, indigency.date_created, indigency.date_updated, indigency.is_active,
         indigency.use_signature, indigency.signature_id,
         sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM indigency
       LEFT JOIN official_signature sig ON indigency.signature_id = sig.signature_id
       WHERE indigency.indigency_id = ?`,
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

// GET record by transaction number
router.get('/transaction/:transactionNumber', async (req, res) => {
  try {
    const { transactionNumber } = req.params;
    const [rows] = await pool.query(
      `SELECT
         indigency.indigency_id, indigency.resident_id, indigency.full_name, indigency.address, indigency.provincial_address,
         indigency.dob, indigency.age, indigency.civil_status, indigency.contact_no, indigency.request_reason, indigency.remarks,
         indigency.date_issued, indigency.transaction_number, indigency.date_created, indigency.date_updated, indigency.is_active,
         indigency.use_signature, indigency.signature_id,
         sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM indigency
       LEFT JOIN official_signature sig ON indigency.signature_id = sig.signature_id
       WHERE indigency.transaction_number = ? AND indigency.is_active = TRUE`,
      [transactionNumber]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'Certificate not found with this transaction number' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// CREATE new record
router.post('/', async (req, res) => {
  try {
    const {
      resident_id,
      full_name,
      address,
      provincial_address,
      dob,
      age,
      civil_status,
      contact_no,
      request_reason,
      remarks,
      date_issued,
      transaction_number,
      use_signature, // Added for e-signature
      signature_id, // Added for e-signature
    } = req.body;

    if (
      !resident_id ||
      !full_name ||
      !address ||
      !dob ||
      !Number.isFinite(Number(age)) ||
      !civil_status ||
      !request_reason ||
      !date_issued
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || generateTransactionNumber();

    const [existing] = await pool.query(
      'SELECT indigency_id FROM indigency WHERE transaction_number = ?',
      [finalTransactionNumber]
    );

    if (existing.length > 0) {
      const newTransactionNumber = generateTransactionNumber();
      const [result] = await pool.query(
        `INSERT INTO indigency
          (resident_id, full_name, address, provincial_address, dob, age,
           civil_status, contact_no, request_reason, remarks, date_issued, transaction_number, use_signature, signature_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          resident_id,
          full_name,
          address,
          provincial_address || null,
          dob,
          Number(age),
          civil_status,
          contact_no || null,
          request_reason,
          remarks || null,
          date_issued,
          newTransactionNumber,
          use_signature ? 1 : 0,
          use_signature && signature_id ? signature_id : null,
        ]
      );

      const [rows] = await pool.query(
        `SELECT
           indigency.indigency_id, indigency.resident_id, indigency.full_name, indigency.address, indigency.provincial_address,
           indigency.dob, indigency.age, indigency.civil_status, indigency.contact_no, indigency.request_reason, indigency.remarks,
           indigency.date_issued, indigency.transaction_number, indigency.date_created, indigency.date_updated, indigency.is_active,
           indigency.use_signature, indigency.signature_id,
           sig.signature_id, sig.official_name, sig.designation, sig.signature_path
         FROM indigency
         LEFT JOIN official_signature sig ON indigency.signature_id = sig.signature_id
         WHERE indigency.indigency_id = ?`,
        [result.insertId]
      );

      return res.status(201).json(rows[0]);
    }

    const [result] = await pool.query(
      `INSERT INTO indigency
        (resident_id, full_name, address, provincial_address, dob, age,
         civil_status, contact_no, request_reason, remarks, date_issued, transaction_number, use_signature, signature_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        full_name,
        address,
        provincial_address || null,
        dob,
        Number(age),
        civil_status,
        contact_no || null,
        request_reason,
        remarks || null,
        date_issued,
        finalTransactionNumber,
        use_signature ? 1 : 0,
        use_signature && signature_id ? signature_id : null,
      ]
    );

    const [rows] = await pool.query(
      `SELECT
         indigency.indigency_id, indigency.resident_id, indigency.full_name, indigency.address, indigency.provincial_address,
         indigency.dob, indigency.age, indigency.civil_status, indigency.contact_no, indigency.request_reason, indigency.remarks,
         indigency.date_issued, indigency.transaction_number, indigency.date_created, indigency.date_updated, indigency.is_active,
         indigency.use_signature, indigency.signature_id,
         sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM indigency
       LEFT JOIN official_signature sig ON indigency.signature_id = sig.signature_id
       WHERE indigency.indigency_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing indigency record
// When updating, we create a NEW record entry with a new transaction number
// The old record remains in history (marked as inactive or kept active)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resident_id,
      full_name,
      address,
      provincial_address,
      dob,
      age,
      civil_status,
      contact_no,
      request_reason,
      remarks,
      date_issued,
      transaction_number,
      use_signature, // Added for e-signature
      signature_id, // Added for e-signature
    } = req.body;

    if (
      !full_name ||
      !address ||
      !dob ||
      !Number.isFinite(Number(age)) ||
      !civil_status ||
      !request_reason ||
      !date_issued
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get the existing record
    const [existing] = await pool.query(
      `SELECT * FROM indigency WHERE indigency_id = ?`,
      [id]
    );

    if (existing.length === 0)
      return res.status(404).json({ error: 'Record not found' });

    const oldRecord = existing[0];
    
    // Generate a NEW transaction number for the new entry
    const newTransactionNumber = generateTransactionNumberForType('IND');

    // Mark the old record as inactive (to preserve it in history)
    await pool.query(
      `UPDATE indigency SET is_active = FALSE WHERE indigency_id = ?`,
      [id]
    );

    // Create a NEW record entry with the updated data and new transaction number
    // This ensures the transaction log shows a new entry
    const [result] = await pool.query(
      `INSERT INTO indigency 
        (resident_id, full_name, address, provincial_address, dob, age,
         civil_status, contact_no, request_reason, remarks, date_issued, transaction_number, use_signature, signature_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        full_name,
        address,
        provincial_address || null,
        dob,
        Number(age),
        civil_status,
        contact_no || null,
        request_reason,
        remarks || null,
        date_issued,
        newTransactionNumber, // New transaction number for the new entry
        use_signature ? 1 : 0,
        use_signature && signature_id ? signature_id : null,
      ]
    );

    // Get the newly created record
    const [newRecord] = await pool.query(
      `SELECT
         indigency.indigency_id, indigency.resident_id, indigency.full_name, indigency.address, indigency.provincial_address,
         indigency.dob, indigency.age, indigency.civil_status, indigency.contact_no, indigency.request_reason, indigency.remarks,
         indigency.date_issued, indigency.transaction_number, indigency.date_created, indigency.date_updated, indigency.is_active,
         indigency.use_signature, indigency.signature_id,
         sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM indigency
       LEFT JOIN official_signature sig ON indigency.signature_id = sig.signature_id
       WHERE indigency.indigency_id = ?`,
      [result.insertId]
    );

    res.json(newRecord[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE indigency record (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE indigency
       SET is_active = FALSE, date_updated = NOW()
       WHERE indigency_id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

module.exports = router;