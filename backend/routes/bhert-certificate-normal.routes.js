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
    // Check if the table has the required columns
    const [columns] = await pool.query("SHOW COLUMNS FROM bhert_certificate_normal");
    const hasUseSignature = columns.some(col => col.Field === 'use_signature');
    const hasSecretarySignatureId = columns.some(col => col.Field === 'secretary_signature_id');
    const hasCaptainSignatureId = columns.some(col => col.Field === 'captain_signature_id');
    
    // If the table doesn't have the required columns, add them
    if (!hasUseSignature) {
      await pool.query("ALTER TABLE bhert_certificate_normal ADD COLUMN use_signature TINYINT(1) DEFAULT 0");
    }
    if (!hasSecretarySignatureId) {
      await pool.query("ALTER TABLE bhert_certificate_normal ADD COLUMN secretary_signature_id INT NULL");
      // Add foreign key if official_signature table exists
      try {
        await pool.query("ALTER TABLE bhert_certificate_normal ADD FOREIGN KEY (secretary_signature_id) REFERENCES official_signature(signature_id)");
      } catch (err) {
        // Foreign key might already exist or official_signature table might not exist
        console.log('Could not add foreign key for secretary_signature_id:', err.message);
      }
    }
    if (!hasCaptainSignatureId) {
      await pool.query("ALTER TABLE bhert_certificate_normal ADD COLUMN captain_signature_id INT NULL");
      // Add foreign key if official_signature table exists
      try {
        await pool.query("ALTER TABLE bhert_certificate_normal ADD FOREIGN KEY (captain_signature_id) REFERENCES official_signature(signature_id)");
      } catch (err) {
        // Foreign key might already exist or official_signature table might not exist
        console.log('Could not add foreign key for captain_signature_id:', err.message);
      }
    }
    
    // Now query with the appropriate columns
    const [rows] = await pool.query(`
      SELECT 
        bcn.*,
        sec_sig.signature_id as sec_signature_id, 
        sec_sig.official_name as sec_official_name, 
        sec_sig.designation as sec_designation, 
        sec_sig.signature_path as sec_signature_path,
        cap_sig.signature_id as cap_signature_id, 
        cap_sig.official_name as cap_official_name, 
        cap_sig.designation as cap_designation, 
        cap_sig.signature_path as cap_signature_path
      FROM bhert_certificate_normal bcn
      LEFT JOIN official_signature sec_sig ON bcn.secretary_signature_id = sec_sig.signature_id
      LEFT JOIN official_signature cap_sig ON bcn.captain_signature_id = cap_sig.signature_id
      WHERE bcn.is_active = 1
      ORDER BY bcn.date_created DESC
    `);
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
    const [rows] = await pool.query(`
      SELECT 
        bcn.*,
        sec_sig.signature_id as sec_signature_id, 
        sec_sig.official_name as sec_official_name, 
        sec_sig.designation as sec_designation, 
        sec_sig.signature_path as sec_signature_path,
        cap_sig.signature_id as cap_signature_id, 
        cap_sig.official_name as cap_official_name, 
        cap_sig.designation as cap_designation, 
        cap_sig.signature_path as cap_signature_path
      FROM bhert_certificate_normal bcn
      LEFT JOIN official_signature sec_sig ON bcn.secretary_signature_id = sec_sig.signature_id
      LEFT JOIN official_signature cap_sig ON bcn.captain_signature_id = cap_sig.signature_id
      WHERE bcn.bhert_certificate_normal_id = ?
    `, [id]);

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
    const [rows] = await pool.query(`
      SELECT 
        bcn.*,
        sec_sig.signature_id as sec_signature_id, 
        sec_sig.official_name as sec_official_name, 
        sec_sig.designation as sec_designation, 
        sec_sig.signature_path as sec_signature_path,
        cap_sig.signature_id as cap_signature_id, 
        cap_sig.official_name as cap_official_name, 
        cap_sig.designation as cap_designation, 
        cap_sig.signature_path as cap_signature_path
      FROM bhert_certificate_normal bcn
      LEFT JOIN official_signature sec_sig ON bcn.secretary_signature_id = sec_sig.signature_id
      LEFT JOIN official_signature cap_sig ON bcn.captain_signature_id = cap_sig.signature_id
      ORDER BY bcn.date_created DESC, bcn.bhert_certificate_normal_id DESC
    `);
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
    const [rows] = await pool.query(`
      SELECT 
        bcn.*,
        sec_sig.signature_id as sec_signature_id, 
        sec_sig.official_name as sec_official_name, 
        sec_sig.designation as sec_designation, 
        sec_sig.signature_path as sec_signature_path,
        cap_sig.signature_id as cap_signature_id, 
        cap_sig.official_name as cap_official_name, 
        cap_sig.designation as cap_designation, 
        cap_sig.signature_path as cap_signature_path
      FROM bhert_certificate_normal bcn
      LEFT JOIN official_signature sec_sig ON bcn.secretary_signature_id = sec_sig.signature_id
      LEFT JOIN official_signature cap_sig ON bcn.captain_signature_id = cap_sig.signature_id
      WHERE bcn.transaction_number = ? AND bcn.is_active = TRUE
    `, [transactionNumber]);

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
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      resident_id,
      full_name,
      address,
      requestor,
      purpose,
      date_issued,
      transaction_number,
      use_signature,
      secretary_signature_id,
      captain_signature_id
    } = req.body;

    if (
      !resident_id ||
      !full_name ||
      !address ||
      !requestor ||
      !purpose ||
      !date_issued
    ) {
      await connection.rollback();
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || generateTransactionNumberForType('BHERT');

    const [existing] = await connection.query(
      'SELECT bhert_certificate_normal_id FROM bhert_certificate_normal WHERE transaction_number = ?',
      [finalTransactionNumber]
    );

    const newTxnNum =
      existing.length > 0 ? generateTransactionNumberForType('BHERT') : finalTransactionNumber;

    // Check if the table has the required columns
    const [columns] = await connection.query("SHOW COLUMNS FROM bhert_certificate_normal");
    const hasUseSignature = columns.some(col => col.Field === 'use_signature');
    const hasSecretarySignatureId = columns.some(col => col.Field === 'secretary_signature_id');
    const hasCaptainSignatureId = columns.some(col => col.Field === 'captain_signature_id');
    
    // Build the query dynamically based on available columns
    let query = `
      INSERT INTO bhert_certificate_normal (
        resident_id,
        full_name,
        address,
        requestor,
        purpose,
        date_issued,
        transaction_number`;
    
    let values = [
      resident_id,
      full_name,
      address,
      requestor,
      purpose,
      date_issued,
      newTxnNum
    ];
    
    if (hasUseSignature) {
      query += ', use_signature';
      values.push(use_signature || 0);
    }
    
    if (hasSecretarySignatureId) {
      query += ', secretary_signature_id';
      values.push(secretary_signature_id || null);
    }
    
    if (hasCaptainSignatureId) {
      query += ', captain_signature_id';
      values.push(captain_signature_id || null);
    }
    
    query += ') VALUES (?, ?, ?, ?, ?, ?, ?';
    
    if (hasUseSignature) {
      query += ', ?';
    }
    
    if (hasSecretarySignatureId) {
      query += ', ?';
    }
    
    if (hasCaptainSignatureId) {
      query += ', ?';
    }
    
    query += ')';

    const [result] = await connection.query(query, values);

    // Get the newly created record with signature info
    const [newRecord] = await connection.query(`
      SELECT 
        bcn.*,
        sec_sig.signature_id as sec_signature_id, 
        sec_sig.official_name as sec_official_name, 
        sec_sig.designation as sec_designation, 
        sec_sig.signature_path as sec_signature_path,
        cap_sig.signature_id as cap_signature_id, 
        cap_sig.official_name as cap_official_name, 
        cap_sig.designation as cap_designation, 
        cap_sig.signature_path as cap_signature_path
      FROM bhert_certificate_normal bcn
      LEFT JOIN official_signature sec_sig ON bcn.secretary_signature_id = sec_sig.signature_id
      LEFT JOIN official_signature cap_sig ON bcn.captain_signature_id = cap_sig.signature_id
      WHERE bcn.bhert_certificate_normal_id = ?
    `, [result.insertId]);

    await connection.commit();
    res.status(201).json(newRecord[0]);
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  } finally {
    connection.release();
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
      use_signature,
      secretary_signature_id,
      captain_signature_id
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

    // Check if the table has the required columns
    const [columns] = await connection.query("SHOW COLUMNS FROM bhert_certificate_normal");
    const hasUseSignature = columns.some(col => col.Field === 'use_signature');
    const hasSecretarySignatureId = columns.some(col => col.Field === 'secretary_signature_id');
    const hasCaptainSignatureId = columns.some(col => col.Field === 'captain_signature_id');
    
    // Build the query dynamically based on available columns
    let query = `
      INSERT INTO bhert_certificate_normal (
        resident_id,
        full_name,
        address,
        requestor,
        purpose,
        date_issued,
        transaction_number`;
    
    let values = [
      resident_id,
      full_name,
      address,
      requestor,
      purpose,
      date_issued,
      newTransactionNumber,
    ];
    
    if (hasUseSignature) {
      query += ', use_signature';
      values.push(use_signature || 0);
    }
    
    if (hasSecretarySignatureId) {
      query += ', secretary_signature_id';
      values.push(secretary_signature_id || null);
    }
    
    if (hasCaptainSignatureId) {
      query += ', captain_signature_id';
      values.push(captain_signature_id || null);
    }
    
    query += ') VALUES (?, ?, ?, ?, ?, ?, ?';
    
    if (hasUseSignature) {
      query += ', ?';
    }
    
    if (hasSecretarySignatureId) {
      query += ', ?';
    }
    
    if (hasCaptainSignatureId) {
      query += ', ?';
    }
    
    query += ')';

    const [result] = await connection.query(query, values);

    // Get the newly created record with signature info
    const [newRecord] = await connection.query(`
      SELECT 
        bcn.*,
        sec_sig.signature_id as sec_signature_id, 
        sec_sig.official_name as sec_official_name, 
        sec_sig.designation as sec_designation, 
        sec_sig.signature_path as sec_signature_path,
        cap_sig.signature_id as cap_signature_id, 
        cap_sig.official_name as cap_official_name, 
        cap_sig.designation as cap_designation, 
        cap_sig.signature_path as cap_signature_path
      FROM bhert_certificate_normal bcn
      LEFT JOIN official_signature sec_sig ON bcn.secretary_signature_id = sec_sig.signature_id
      LEFT JOIN official_signature cap_sig ON bcn.captain_signature_id = cap_sig.signature_id
      WHERE bcn.bhert_certificate_normal_id = ?
    `, [result.insertId]);

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