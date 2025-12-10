// routes/certificate-of-action.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { generateTransactionNumberForType } = require('../utils/transaction.utils');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all active certificate of action records
router.get('/', async (req, res) => {
  try {
    // Return only active records for the main records view
    // Join with official_signature to get signature data
    const [rows] = await pool.query(
      `SELECT coa.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM certificate_of_action coa
       LEFT JOIN official_signature sig ON coa.signature_id = sig.signature_id
       WHERE coa.is_active = TRUE 
       ORDER BY coa.date_created DESC, coa.certificate_of_action_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch certificate of action records' });
  }
});

// GET all records including historical (for transaction log)
router.get('/transactions/all', async (req, res) => {
  try {
    // Get all records including inactive ones for complete transaction history
    // This shows all transactions including old ones that were edited
    const [rows] = await pool.query(
      `SELECT * FROM certificate_of_action ORDER BY date_created DESC, certificate_of_action_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// GET single certificate of action record by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT coa.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM certificate_of_action coa
       LEFT JOIN official_signature sig ON coa.signature_id = sig.signature_id
       WHERE coa.certificate_of_action_id = ?`,
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

// CREATE new certificate of action
router.post('/', async (req, res) => {
  try {
    const {
      resident_id,
      complainant_name,
      respondent_name,
      barangay_case_no,
      request_reason,
      filed_date,
      date_issued,
      transaction_number,
    } = req.body;

    if (!complainant_name || !respondent_name || !request_reason || !date_issued) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || generateTransactionNumberForType('CACT');

    const [result] = await pool.query(
      `INSERT INTO certificate_of_action 
        (resident_id, complainant_name, respondent_name, barangay_case_no, request_reason, filed_date, date_issued, transaction_number, use_signature, signature_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        complainant_name,
        respondent_name,
        barangay_case_no,
        request_reason,
        filed_date,
        date_issued,
        finalTransactionNumber,
        use_signature || 0,
        signature_id || null,
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM certificate_of_action WHERE certificate_of_action_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing certificate of action
// When updating, we create a NEW record entry with a new transaction number
// The old record remains in history (marked as inactive or kept active)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resident_id,
      complainant_name,
      respondent_name,
      barangay_case_no,
      request_reason,
      filed_date,
      date_issued,
      transaction_number,
      use_signature,
      signature_id,
    } = req.body;

    // Get the existing record
    const [existing] = await pool.query(
      `SELECT * FROM certificate_of_action WHERE certificate_of_action_id = ?`,
      [id]
    );

    if (existing.length === 0)
      return res.status(404).json({ error: 'Record not found' });

    const oldRecord = existing[0];
    
    // Generate a NEW transaction number for the new entry
    const newTransactionNumber = generateTransactionNumberForType('CACT');

    // Mark the old record as inactive (to preserve it in history)
    await pool.query(
      `UPDATE certificate_of_action SET is_active = FALSE WHERE certificate_of_action_id = ?`,
      [id]
    );

    // Create a NEW record entry with the updated data and new transaction number
    // This ensures the transaction log shows a new entry
    const [result] = await pool.query(
      `INSERT INTO certificate_of_action 
        (resident_id, complainant_name, respondent_name, barangay_case_no, request_reason, filed_date, date_issued, transaction_number, use_signature, signature_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        complainant_name,
        respondent_name,
        barangay_case_no,
        request_reason,
        filed_date,
        date_issued,
        newTransactionNumber, // New transaction number for the new entry
        use_signature || 0,
        signature_id || null,
      ]
    );

    // Get the newly created record
    const [newRecord] = await pool.query(
      `SELECT * FROM certificate_of_action WHERE certificate_of_action_id = ?`,
      [result.insertId]
    );

    res.json(newRecord[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE certificate of action (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE certificate_of_action SET is_active = FALSE, date_updated = NOW() WHERE certificate_of_action_id = ?`,
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

