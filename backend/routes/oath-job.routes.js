// routes/oath-job.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { generateTransactionNumber, generateTransactionNumberForType } = require('../utils/transaction.utils');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all active oath_job records
router.get('/', async (req, res) => {
  try {
    // Check if is_active column exists, if not, get all records
    const [rows] = await pool.query(
      `SELECT * FROM oath_job ORDER BY date_created DESC`
    );
    // Filter active records if is_active column exists in the data
    const activeRows = rows.filter(r => r.is_active !== false && r.is_active !== 0);
    res.json(activeRows);
  } catch (err) {
    console.error('Error fetching oath_job records:', err);
    res
      .status(500)
      .json({ message: 'Error fetching records', error: err.message });
  }
});

// GET all records including historical (for transaction log)
router.get('/transactions/all', async (req, res) => {
  try {
    // Get all records including inactive ones for complete transaction history
    // This shows all transactions including old ones that were edited
    const [rows] = await pool.query(
      `SELECT * FROM oath_job ORDER BY date_created DESC, id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching transaction history:', err);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// GET single oath_job record by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM oath_job WHERE id = ?', [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching oath_job record:', err);
    res
      .status(500)
      .json({ message: 'Error fetching record', error: err.message });
  }
});

// POST create oath_job record
router.post('/', async (req, res) => {
  const { resident_id, full_name, age, address, date_issued } = req.body;

  if (!full_name) {
    return res.status(400).json({ message: 'Full name is required.' });
  }

  const transaction_number = generateTransactionNumber();

  try {
    const [result] = await pool.query(
      'INSERT INTO oath_job (resident_id, transaction_number, full_name, age, address, date_issued) VALUES (?, ?, ?, ?, ?, ?)',
      [resident_id, transaction_number, full_name, age, address, date_issued]
    );
    res.status(201).json({
      message: 'Record created successfully',
      id: result.insertId,
      transaction_number: transaction_number,
      ...req.body,
    });
  } catch (err) {
    console.error('Error creating oath_job record:', err);
    res
      .status(500)
      .json({ message: 'Error creating record', error: err.message });
  }
});

// PUT update oath_job record
// When updating, we create a NEW record entry with a new transaction number
// The old record remains in history (marked as inactive or kept active)
router.put('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { resident_id, full_name, age, address, date_issued } = req.body;

    if (!full_name) {
      await connection.rollback();
      return res.status(400).json({ message: 'Full name is required.' });
    }

    // Get the existing record
    const [existing] = await connection.query(
      'SELECT * FROM oath_job WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Record not found' });
    }

    // Generate a NEW transaction number for the new entry
    const newTransactionNumber = generateTransactionNumberForType('OJS');

    // Mark the old record as inactive (to preserve it in history)
    // Try to update is_active if column exists, otherwise just update date_updated
    try {
      await connection.query(
        `UPDATE oath_job SET is_active = FALSE, date_updated = NOW() WHERE id = ?`,
        [id]
      );
    } catch (err) {
      // If is_active column doesn't exist, just update date_updated
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        await connection.query(
          `UPDATE oath_job SET date_updated = NOW() WHERE id = ?`,
          [id]
        );
      } else {
        throw err;
      }
    }

    // Create a NEW record entry with the updated data and new transaction number
    const [result] = await connection.query(
      `INSERT INTO oath_job (resident_id, transaction_number, full_name, age, address, date_issued) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [resident_id, newTransactionNumber, full_name, age, address, date_issued]
    );

    // Get the newly created record
    const [newRecord] = await connection.query(
      'SELECT * FROM oath_job WHERE id = ?',
      [result.insertId]
    );

    await connection.commit();
    res.json(newRecord[0]);
  } catch (err) {
    await connection.rollback();
    console.error('Error updating oath_job record:', err);
    res
      .status(500)
      .json({ message: 'Error updating record', error: err.message });
  } finally {
    connection.release();
  }
});

// DELETE oath_job record
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM oath_job WHERE id = ?', [
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully', id: id });
  } catch (err) {
    console.error('Error deleting oath_job record:', err);
    res
      .status(500)
      .json({ message: 'Error deleting record', error: err.message });
  }
});

module.exports = router;

