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
    // First, let's check if the table has the required columns
    const [columns] = await pool.query("SHOW COLUMNS FROM oath_job");
    const hasIsActive = columns.some(col => col.Field === 'is_active');
    const hasUseSignature = columns.some(col => col.Field === 'use_signature');
    const hasSignatureId = columns.some(col => col.Field === 'signature_id');
    
    // If the table doesn't have the required columns, add them
    if (!hasUseSignature) {
      await pool.query("ALTER TABLE oath_job ADD COLUMN use_signature TINYINT(1) DEFAULT 0");
    }
    if (!hasSignatureId) {
      await pool.query("ALTER TABLE oath_job ADD COLUMN signature_id INT NULL");
      // Add foreign key if official_signature table exists
      try {
        await pool.query("ALTER TABLE oath_job ADD FOREIGN KEY (signature_id) REFERENCES official_signature(signature_id)");
      } catch (err) {
        // Foreign key might already exist or official_signature table might not exist
        console.log('Could not add foreign key:', err.message);
      }
    }
    if (!hasIsActive) {
      await pool.query("ALTER TABLE oath_job ADD COLUMN is_active TINYINT(1) DEFAULT 1");
    }
    
    // Now query with the appropriate columns
    if (hasIsActive) {
      const [rows] = await pool.query(
        `SELECT oj.*, 
                sig.signature_id, sig.official_name, sig.designation, sig.signature_path
         FROM oath_job oj
         LEFT JOIN official_signature sig ON oj.signature_id = sig.signature_id
         WHERE oj.is_active = TRUE 
         ORDER BY oj.date_created DESC, oj.id DESC`
      );
      res.json(rows);
    } else {
      // If is_active doesn't exist, get all records and filter in the application
      const [rows] = await pool.query(
        `SELECT oj.*, 
                sig.signature_id, sig.official_name, sig.designation, sig.signature_path
         FROM oath_job oj
         LEFT JOIN official_signature sig ON oj.signature_id = sig.signature_id
         ORDER BY oj.date_created DESC, oj.id DESC`
      );
      // Filter out records that might be marked as inactive if the column exists
      const activeRows = rows.filter(r => r.is_active !== false && r.is_active !== 0);
      res.json(activeRows);
    }
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
    const [rows] = await pool.query(
      `SELECT oj.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM oath_job oj
       LEFT JOIN official_signature sig ON oj.signature_id = sig.signature_id
       WHERE oj.id = ?`,
      [id]
    );
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
  const { 
    resident_id, 
    full_name, 
    age, 
    address, 
    date_issued,
    use_signature,  // Add this
    signature_id    // Add this
  } = req.body;

  if (!full_name) {
    return res.status(400).json({ message: 'Full name is required.' });
  }

  const transaction_number = generateTransactionNumber();

  try {
    // Check if the table has the required columns
    const [columns] = await pool.query("SHOW COLUMNS FROM oath_job");
    const hasUseSignature = columns.some(col => col.Field === 'use_signature');
    const hasSignatureId = columns.some(col => col.Field === 'signature_id');
    
    // Build the query dynamically based on available columns
    let query = 'INSERT INTO oath_job (resident_id, transaction_number, full_name, age, address, date_issued';
    let values = [resident_id, transaction_number, full_name, age, address, date_issued];
    
    if (hasUseSignature) {
      query += ', use_signature';
      values.push(use_signature || 0);
    }
    
    if (hasSignatureId) {
      query += ', signature_id';
      values.push(signature_id || null);
    }
    
    query += ') VALUES (?, ?, ?, ?, ?, ?';
    
    if (hasUseSignature) {
      query += ', ?';
    }
    
    if (hasSignatureId) {
      query += ', ?';
    }
    
    query += ')';
    
    const [result] = await pool.query(query, values);
    
    // Get the newly created record with signature info
    const [newRecord] = await pool.query(
      `SELECT oj.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM oath_job oj
       LEFT JOIN official_signature sig ON oj.signature_id = sig.signature_id
       WHERE oj.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json(newRecord[0]);
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
    const { 
      resident_id, 
      full_name, 
      age, 
      address, 
      date_issued,
      use_signature,  // Add this
      signature_id    // Add this
    } = req.body;

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

    // Check if the table has the required columns
    const [columns] = await connection.query("SHOW COLUMNS FROM oath_job");
    const hasIsActive = columns.some(col => col.Field === 'is_active');
    const hasUseSignature = columns.some(col => col.Field === 'use_signature');
    const hasSignatureId = columns.some(col => col.Field === 'signature_id');

    // Generate a NEW transaction number for the new entry
    const newTransactionNumber = generateTransactionNumberForType('OJS');

    // Mark the old record as inactive (to preserve it in history)
    if (hasIsActive) {
      await connection.query(
        `UPDATE oath_job SET is_active = FALSE, date_updated = NOW() WHERE id = ?`,
        [id]
      );
    } else {
      // If is_active doesn't exist, just update date_updated if it exists
      try {
        await connection.query(
          `UPDATE oath_job SET date_updated = NOW() WHERE id = ?`,
          [id]
        );
      } catch (err) {
        // date_updated might not exist either, just continue
        console.log('Could not update date_updated:', err.message);
      }
    }

    // Create a NEW record entry with the updated data and new transaction number
    let query = `INSERT INTO oath_job (resident_id, transaction_number, full_name, age, address, date_issued`;
    let values = [resident_id, newTransactionNumber, full_name, age, address, date_issued];
    
    if (hasUseSignature) {
      query += ', use_signature';
      values.push(use_signature || 0);
    }
    
    if (hasSignatureId) {
      query += ', signature_id';
      values.push(signature_id || null);
    }
    
    query += ') VALUES (?, ?, ?, ?, ?, ?';
    
    if (hasUseSignature) {
      query += ', ?';
    }
    
    if (hasSignatureId) {
      query += ', ?';
    }
    
    query += ')';
    
    const [result] = await connection.query(query, values);

    // Get the newly created record with signature info
    const [newRecord] = await connection.query(
      `SELECT oj.*, 
              sig.signature_id, sig.official_name, sig.designation, sig.signature_path
       FROM oath_job oj
       LEFT JOIN official_signature sig ON oj.signature_id = sig.signature_id
       WHERE oj.id = ?`,
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

// DELETE oath_job record (soft delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the table has the is_active column
    const [columns] = await pool.query("SHOW COLUMNS FROM oath_job");
    const hasIsActive = columns.some(col => col.Field === 'is_active');
    
    if (hasIsActive) {
      const [result] = await pool.query(
        'UPDATE oath_job SET is_active = FALSE, date_updated = NOW() WHERE id = ?',
        [id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Record not found' });
      }
    } else {
      // If is_active doesn't exist, do a hard delete
      const [result] = await pool.query('DELETE FROM oath_job WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Record not found' });
      }
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