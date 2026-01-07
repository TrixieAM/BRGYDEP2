// routes/business-clearance.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { generateTransactionNumberForType } = require('../utils/transaction.utils');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all active business clearance records
router.get('/', async (req, res) => {
  try {
    // Join with official_signature to get signature data
    const [rows] = await pool.query(
      `SELECT bc.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM business_clearance bc
       LEFT JOIN official_signature sig ON bc.signature_id = sig.signature_id
       WHERE bc.is_active = TRUE 
       ORDER BY bc.date_created DESC, bc.business_clearance_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch business clearance records' });
  }
});

// GET all records including historical (for transaction log)
router.get('/transactions/all', async (req, res) => {
  try {
    // Get all records including inactive ones for complete transaction history
    // This shows all transactions including old ones that were edited
    const [rows] = await pool.query(
      `SELECT bc.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM business_clearance bc
       LEFT JOIN official_signature sig ON bc.signature_id = sig.signature_id
       ORDER BY bc.date_created DESC, bc.business_clearance_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// GET single business clearance by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT bc.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM business_clearance bc
       LEFT JOIN official_signature sig ON bc.signature_id = sig.signature_id
       WHERE bc.business_clearance_id = ?`,
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

// CREATE new business clearance
router.post('/', async (req, res) => {
  try {
    const {
      resident_id,
      full_name,
      address,
      nature_of_business,
      date_issued,
      date_expired,
      remarks,
      request_reason,
      transaction_number,
      use_signature, // Added for e-signature
      signature_id, // Added for e-signature
    } = req.body;

    if (!full_name || !address || !nature_of_business || !date_issued || !date_expired || !request_reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || generateTransactionNumberForType('BUS');

    const [result] = await pool.query(
      `INSERT INTO business_clearance 
        (resident_id, full_name, address, nature_of_business, date_issued, date_expired, remarks, request_reason, transaction_number, use_signature, signature_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        full_name,
        address,
        nature_of_business,
        date_issued,
        date_expired,
        remarks || null,
        request_reason,
        finalTransactionNumber,
        use_signature ? 1 : 0,
        use_signature && signature_id ? signature_id : null,
      ]
    );

    const [rows] = await pool.query(
      `SELECT bc.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM business_clearance bc
       LEFT JOIN official_signature sig ON bc.signature_id = sig.signature_id
       WHERE bc.business_clearance_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing business clearance
// When updating, we create a NEW record entry with a new transaction number
// The old record remains in history (marked as inactive or kept active)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resident_id,
      full_name,
      address,
      nature_of_business,
      date_issued,
      date_expired,
      remarks,
      request_reason,
      transaction_number,
      use_signature, // Added for e-signature
      signature_id, // Added for e-signature
    } = req.body;

    // Get the existing record
    const [existing] = await pool.query(
      `SELECT * FROM business_clearance WHERE business_clearance_id = ?`,
      [id]
    );

    if (existing.length === 0)
      return res.status(404).json({ error: 'Record not found' });

    const oldRecord = existing[0];
    
    // Generate a NEW transaction number for the new entry
    const newTransactionNumber = generateTransactionNumberForType('BUS');

    // Mark the old record as inactive (to preserve it in history)
    await pool.query(
      `UPDATE business_clearance SET is_active = FALSE WHERE business_clearance_id = ?`,
      [id]
    );

    // Create a NEW record entry with the updated data and new transaction number
    // This ensures the transaction log shows a new entry
    const [result] = await pool.query(
      `INSERT INTO business_clearance 
        (resident_id, full_name, address, nature_of_business, date_issued, date_expired, remarks, request_reason, transaction_number, use_signature, signature_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        full_name,
        address,
        nature_of_business,
        date_issued,
        date_expired,
        remarks || null,
        request_reason,
        newTransactionNumber, // New transaction number for the new entry
        use_signature ? 1 : 0,
        use_signature && signature_id ? signature_id : null,
      ]
    );

    // Get the newly created record
    const [newRecord] = await pool.query(
      `SELECT bc.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM business_clearance bc
       LEFT JOIN official_signature sig ON bc.signature_id = sig.signature_id
       WHERE bc.business_clearance_id = ?`,
      [result.insertId]
    );

    res.json(newRecord[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE business clearance (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE business_clearance SET is_active = FALSE, date_updated = NOW() WHERE business_clearance_id = ?`,
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