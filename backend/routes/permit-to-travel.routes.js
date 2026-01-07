// routes/permit-to-travel.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { generateTransactionNumberForType } = require('../utils/transaction.utils');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all active permit to travel records
router.get('/', async (req, res) => {
  try {
    // Join with official_signature to get signature data
    const [rows] = await pool.query(
      `SELECT ptt.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM permit_to_travel ptt
       LEFT JOIN official_signature sig ON ptt.signature_id = sig.signature_id
       WHERE ptt.is_active = TRUE 
       ORDER BY ptt.date_created DESC, ptt.permit_to_travel_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch permit to travel records' });
  }
});

// GET all records including historical (for transaction log)
router.get('/transactions/all', async (req, res) => {
  try {
    // Get all records including inactive ones for complete transaction history
    // This shows all transactions including old ones that were edited
    const [rows] = await pool.query(
      `SELECT ptt.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM permit_to_travel ptt
       LEFT JOIN official_signature sig ON ptt.signature_id = sig.signature_id
       ORDER BY ptt.date_created DESC, ptt.permit_to_travel_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// GET single permit to travel by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT ptt.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM permit_to_travel ptt
       LEFT JOIN official_signature sig ON ptt.signature_id = sig.signature_id
       WHERE ptt.permit_to_travel_id = ?`,
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

// CREATE new permit to travel
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

    if (!full_name || !address || !request_reason || !date_issued) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || generateTransactionNumberForType('TRV');

    // Make sure signature_id is properly handled
    const signatureIdValue = use_signature && signature_id ? signature_id : null;

    const [result] = await pool.query(
      `INSERT INTO permit_to_travel 
        (resident_id, full_name, address, provincial_address, dob, age, civil_status, contact_no, request_reason, remarks, date_issued, transaction_number, use_signature, signature_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
        finalTransactionNumber,
        use_signature ? 1 : 0,
        signatureIdValue, // Use the properly handled value
      ]
    );

    const [rows] = await pool.query(
      `SELECT ptt.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM permit_to_travel ptt
       LEFT JOIN official_signature sig ON ptt.signature_id = sig.signature_id
       WHERE ptt.permit_to_travel_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing permit to travel
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

    // Get the existing record
    const [existing] = await pool.query(
      `SELECT * FROM permit_to_travel WHERE permit_to_travel_id = ?`,
      [id]
    );

    if (existing.length === 0)
      return res.status(404).json({ error: 'Record not found' });

    const oldRecord = existing[0];
    
    // Generate a NEW transaction number for the new entry
    const newTransactionNumber = generateTransactionNumberForType('TRV');

    // Mark the old record as inactive (to preserve it in history)
    await pool.query(
      `UPDATE permit_to_travel SET is_active = FALSE WHERE permit_to_travel_id = ?`,
      [id]
    );

    // Make sure signature_id is properly handled
    const signatureIdValue = use_signature && signature_id ? signature_id : null;

    // Create a NEW record entry with the updated data and new transaction number
    // This ensures the transaction log shows a new entry
    const [result] = await pool.query(
      `INSERT INTO permit_to_travel 
        (resident_id, full_name, address, provincial_address, dob, age, civil_status, contact_no, request_reason, remarks, date_issued, transaction_number, use_signature, signature_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
        newTransactionNumber, // New transaction number for the new entry
        use_signature ? 1 : 0,
        signatureIdValue, // Use the properly handled value
      ]
    );

    // Get the newly created record
    const [newRecord] = await pool.query(
      `SELECT ptt.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM permit_to_travel ptt
       LEFT JOIN official_signature sig ON ptt.signature_id = sig.signature_id
       WHERE ptt.permit_to_travel_id = ?`,
      [result.insertId]
    );

    res.json(newRecord[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE permit to travel (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE permit_to_travel SET is_active = FALSE, date_updated = NOW() WHERE permit_to_travel_id = ?`,
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