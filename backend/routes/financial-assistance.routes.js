// routes/financial-assistance.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { generateTransactionNumberForType } = require('../utils/transaction.utils');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all active financial assistance records
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM financial_assistance WHERE is_active = TRUE ORDER BY financial_assistance_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch financial assistance records' });
  }
});

// GET all records including historical (for transaction log)
router.get('/transactions/all', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM financial_assistance ORDER BY date_created DESC, financial_assistance_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching transaction history:', err);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// GET single financial assistance record by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM financial_assistance WHERE financial_assistance_id = ?`,
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

// CREATE new financial assistance record
router.post('/', async (req, res) => {
  try {
    const {
      resident_id,
      full_name,
      age,
      dob,
      address,
      occupation,
      purpose,
      monthly_income,
      date_issued,
      transaction_number,
    } = req.body;

    if (!full_name || !address || !purpose || !date_issued) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || generateTransactionNumberForType('FIN');

    const [result] = await pool.query(
      `INSERT INTO financial_assistance 
        (resident_id, full_name, age, dob, address, occupation, purpose, monthly_income, date_issued, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        full_name,
        age,
        dob,
        address,
        occupation,
        purpose,
        monthly_income,
        date_issued,
        finalTransactionNumber,
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM financial_assistance WHERE financial_assistance_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing financial assistance record
// When updating, we create a NEW record entry with a new transaction number
// The old record remains in history (marked as inactive)
router.put('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      resident_id,
      full_name,
      age,
      dob,
      address,
      occupation,
      purpose,
      monthly_income,
      date_issued,
    } = req.body;

    // Get the existing record
    const [existing] = await connection.query(
      'SELECT * FROM financial_assistance WHERE financial_assistance_id = ?',
      [id]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Record not found' });
    }

    // Generate a NEW transaction number for the new entry
    const newTransactionNumber = generateTransactionNumberForType('FIN');

    // Mark the old record as inactive (to preserve it in history)
    await connection.query(
      `UPDATE financial_assistance SET is_active = FALSE, date_updated = NOW() WHERE financial_assistance_id = ?`,
      [id]
    );

    // Create a NEW record entry with the updated data and new transaction number
    const [result] = await connection.query(
      `INSERT INTO financial_assistance 
        (resident_id, full_name, age, dob, address, occupation, purpose, monthly_income, date_issued, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        full_name,
        age,
        dob,
        address,
        occupation,
        purpose,
        monthly_income,
        date_issued,
        newTransactionNumber,
      ]
    );

    // Get the newly created record
    const [newRecord] = await connection.query(
      'SELECT * FROM financial_assistance WHERE financial_assistance_id = ?',
      [result.insertId]
    );

    await connection.commit();
    res.json(newRecord[0]);
  } catch (err) {
    await connection.rollback();
    console.error('Error updating financial assistance record:', err);
    res.status(500).json({ error: 'Failed to update record' });
  } finally {
    connection.release();
  }
});

// DELETE financial assistance (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE financial_assistance SET is_active = FALSE, date_updated = NOW() WHERE financial_assistance_id = ?`,
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

