// routes/bhert-certificate-normal.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { generateTransactionNumberForType } = require('../utils/transaction.utils');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all active BHERT records
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         bhert_certificate_normal_id, resident_id, full_name, address,
         requestor, purpose, date_issued, transaction_number,
         is_active, date_created, date_updated
       FROM bhert_certificate_normal
       WHERE is_active = TRUE
       ORDER BY bhert_certificate_normal_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch BHERT records' });
  }
});

// GET single record by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT
         bhert_certificate_normal_id, resident_id, full_name, address,
         requestor, purpose, date_issued, transaction_number,
         is_active, date_created, date_updated
       FROM bhert_certificate_normal
       WHERE bhert_certificate_normal_id = ?`,
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

// GET all records including historical (for transaction log)
router.get('/transactions/all', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM bhert_certificate_normal ORDER BY date_created DESC, bhert_certificate_normal_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching BHERT transaction history:', err);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// GET record by transaction number
router.get('/transaction/:transactionNumber', async (req, res) => {
  try {
    const { transactionNumber } = req.params;
    const [rows] = await pool.query(
      `SELECT
         bhert_certificate_normal_id, resident_id, full_name, address,
         requestor, purpose, date_issued, transaction_number,
         is_active, date_created, date_updated
       FROM bhert_certificate_normal
       WHERE transaction_number = ? AND is_active = TRUE`,
      [transactionNumber]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: 'Certificate not found' });

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
      requestor,
      purpose,
      date_issued,
      transaction_number,
    } = req.body;

    if (
      !resident_id ||
      !full_name ||
      !address ||
      !requestor ||
      !purpose ||
      !date_issued
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || generateTransactionNumberForType('BHERT');

    const [existing] = await pool.query(
      'SELECT bhert_certificate_normal_id FROM bhert_certificate_normal WHERE transaction_number = ?',
      [finalTransactionNumber]
    );

    const newTxnNum =
      existing.length > 0 ? generateTransactionNumberForType('BHERT') : finalTransactionNumber;

    const [result] = await pool.query(
      `INSERT INTO bhert_certificate_normal
       (resident_id, full_name, address, requestor, purpose, date_issued, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [resident_id, full_name, address, requestor, purpose, date_issued, newTxnNum]
    );

    const [rows] = await pool.query(
      `SELECT * FROM bhert_certificate_normal WHERE bhert_certificate_normal_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// UPDATE existing record - create a NEW record, mark old inactive, new transaction number
router.put('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      resident_id,
      full_name,
      address,
      requestor,
      purpose,
      date_issued,
    } = req.body;

    if (!full_name || !address || !requestor || !purpose || !date_issued) {
      await connection.rollback();
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [existing] = await connection.query(
      'SELECT * FROM bhert_certificate_normal WHERE bhert_certificate_normal_id = ?',
      [id]
    );
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Record not found' });
    }

    const newTransactionNumber = generateTransactionNumberForType('BHERT');

    await connection.query(
      `UPDATE bhert_certificate_normal
       SET is_active = FALSE, date_updated = NOW()
       WHERE bhert_certificate_normal_id = ?`,
      [id]
    );

    const [result] = await connection.query(
      `INSERT INTO bhert_certificate_normal
       (resident_id, full_name, address, requestor, purpose, date_issued, transaction_number)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        full_name,
        address,
        requestor,
        purpose,
        date_issued,
        newTransactionNumber,
      ]
    );

    const [newRecord] = await connection.query(
      `SELECT * FROM bhert_certificate_normal WHERE bhert_certificate_normal_id = ?`,
      [result.insertId]
    );

    await connection.commit();
    res.json(newRecord[0]);
  } catch (err) {
    await connection.rollback();
    console.error('Failed to update BHERT record', err);
    res.status(500).json({ error: 'Failed to update record' });
  } finally {
    connection.release();
  }
});

// DELETE record (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE bhert_certificate_normal
       SET is_active = FALSE, date_updated = NOW()
       WHERE bhert_certificate_normal_id = ?`,
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

