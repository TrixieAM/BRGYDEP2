const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { generateTransactionNumberForType } = require('../utils/transaction.utils');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all active cohabitation certificate records
router.get('/', async (req, res) => {
  try {
    // Check if the table has the required columns
    const [columns] = await pool.query("SHOW COLUMNS FROM certificate_of_cohabitation");
    const hasUseSignature = columns.some(col => col.Field === 'use_signature');
    const hasSecretarySignatureId = columns.some(col => col.Field === 'secretary_signature_id');
    const hasCaptainSignatureId = columns.some(col => col.Field === 'captain_signature_id');
    
    // If the table doesn't have the required columns, add them
    if (!hasUseSignature) {
      await pool.query("ALTER TABLE certificate_of_cohabitation ADD COLUMN use_signature TINYINT(1) DEFAULT 0");
    }
    if (!hasSecretarySignatureId) {
      await pool.query("ALTER TABLE certificate_of_cohabitation ADD COLUMN secretary_signature_id INT NULL");
      // Add foreign key if official_signature table exists
      try {
        await pool.query("ALTER TABLE certificate_of_cohabitation ADD FOREIGN KEY (secretary_signature_id) REFERENCES official_signature(signature_id)");
      } catch (err) {
        // Foreign key might already exist or official_signature table might not exist
        console.log('Could not add foreign key for secretary_signature_id:', err.message);
      }
    }
    if (!hasCaptainSignatureId) {
      await pool.query("ALTER TABLE certificate_of_cohabitation ADD COLUMN captain_signature_id INT NULL");
      // Add foreign key if official_signature table exists
      try {
        await pool.query("ALTER TABLE certificate_of_cohabitation ADD FOREIGN KEY (captain_signature_id) REFERENCES official_signature(signature_id)");
      } catch (err) {
        // Foreign key might already exist or official_signature table might not exist
        console.log('Could not add foreign key for captain_signature_id:', err.message);
      }
    }
    
    // Now query with the appropriate columns
    const [rows] = await pool.query(`
      SELECT 
        coc.*,
        sec_sig.signature_id as sec_signature_id, 
        sec_sig.official_name as sec_official_name, 
        sec_sig.designation as sec_designation, 
        sec_sig.signature_path as sec_signature_path,
        cap_sig.signature_id as cap_signature_id, 
        cap_sig.official_name as cap_official_name, 
        cap_sig.designation as cap_designation, 
        cap_sig.signature_path as cap_signature_path
      FROM certificate_of_cohabitation coc
      LEFT JOIN official_signature sec_sig ON coc.secretary_signature_id = sec_sig.signature_id
      LEFT JOIN official_signature cap_sig ON coc.captain_signature_id = cap_sig.signature_id
      WHERE coc.is_active = 1
      ORDER BY coc.date_created DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cohabitation certificate records' });
  }
});

// GET all records including historical (for transaction log)
router.get('/transactions/all', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        coc.*,
        sec_sig.signature_id as sec_signature_id, 
        sec_sig.official_name as sec_official_name, 
        sec_sig.designation as sec_designation, 
        sec_sig.signature_path as sec_signature_path,
        cap_sig.signature_id as cap_signature_id, 
        cap_sig.official_name as cap_official_name, 
        cap_sig.designation as cap_designation, 
        cap_sig.signature_path as cap_signature_path
      FROM certificate_of_cohabitation coc
      LEFT JOIN official_signature sec_sig ON coc.secretary_signature_id = sec_sig.signature_id
      LEFT JOIN official_signature cap_sig ON coc.captain_signature_id = cap_sig.signature_id
      ORDER BY coc.date_created DESC, coc.certificate_of_cohabitation_id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching transaction history:', err);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// GET single cohabitation certificate by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        coc.*,
        sec_sig.signature_id as sec_signature_id, 
        sec_sig.official_name as sec_official_name, 
        sec_sig.designation as sec_designation, 
        sec_sig.signature_path as sec_signature_path,
        cap_sig.signature_id as cap_signature_id, 
        cap_sig.official_name as cap_official_name, 
        cap_sig.designation as cap_designation, 
        cap_sig.signature_path as cap_signature_path
      FROM certificate_of_cohabitation coc
      LEFT JOIN official_signature sec_sig ON coc.secretary_signature_id = sec_sig.signature_id
      LEFT JOIN official_signature cap_sig ON coc.captain_signature_id = cap_sig.signature_id
      WHERE coc.certificate_of_cohabitation_id = ?
    `, [id]);
    
    if (rows.length === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// CREATE new cohabitation certificate
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      resident1_id,
      resident2_id,
      full_name1,
      dob1,
      full_name2,
      dob2,
      address,
      date_started,
      date_issued,
      witness1_name,
      witness2_name,
      transaction_number,
      use_signature,
      secretary_signature_id,
      captain_signature_id
    } = req.body;

    if (
      !resident1_id ||
      !resident2_id ||
      !full_name1 ||
      !dob1 ||
      !full_name2 ||
      !dob2 ||
      !address ||
      !date_started ||
      !date_issued
    ) {
      await connection.rollback();
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || generateTransactionNumberForType('COH');

    // Check if the table has the required columns
    const [columns] = await connection.query("SHOW COLUMNS FROM certificate_of_cohabitation");
    const hasUseSignature = columns.some(col => col.Field === 'use_signature');
    const hasSecretarySignatureId = columns.some(col => col.Field === 'secretary_signature_id');
    const hasCaptainSignatureId = columns.some(col => col.Field === 'captain_signature_id');
    
    // Build the query dynamically based on available columns
    let query = `
      INSERT INTO certificate_of_cohabitation (
        resident1_id,
        resident2_id,
        full_name1,
        dob1,
        full_name2,
        dob2,
        address,
        date_started,
        date_issued,
        witness1_name,
        witness2_name,
        transaction_number`;
    
    let values = [
      resident1_id,
      resident2_id,
      full_name1,
      dob1,
      full_name2,
      dob2,
      address,
      date_started,
      date_issued,
      witness1_name,
      witness2_name,
      finalTransactionNumber
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
    
    query += ') VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?';
    
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
        coc.*,
        sec_sig.signature_id as sec_signature_id, 
        sec_sig.official_name as sec_official_name, 
        sec_sig.designation as sec_designation, 
        sec_sig.signature_path as sec_signature_path,
        cap_sig.signature_id as cap_signature_id, 
        cap_sig.official_name as cap_official_name, 
        cap_sig.designation as cap_designation, 
        cap_sig.signature_path as cap_signature_path
      FROM certificate_of_cohabitation coc
      LEFT JOIN official_signature sec_sig ON coc.secretary_signature_id = sec_sig.signature_id
      LEFT JOIN official_signature cap_sig ON coc.captain_signature_id = cap_sig.signature_id
      WHERE coc.certificate_of_cohabitation_id = ?
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

// UPDATE existing cohabitation certificate
// When updating, we create a NEW record entry with a new transaction number
// The old record remains in history (marked as inactive)
router.put('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      resident1_id,
      resident2_id,
      full_name1,
      dob1,
      full_name2,
      dob2,
      address,
      date_started,
      date_issued,
      witness1_name,
      witness2_name,
      use_signature,
      secretary_signature_id,
      captain_signature_id
    } = req.body;

    if (
      !resident1_id ||
      !resident2_id ||
      !full_name1 ||
      !dob1 ||
      !full_name2 ||
      !dob2 ||
      !address ||
      !date_started ||
      !date_issued
    ) {
      await connection.rollback();
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get the existing record
    const [existing] = await connection.query(
      'SELECT * FROM certificate_of_cohabitation WHERE certificate_of_cohabitation_id = ?',
      [id]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Record not found' });
    }

    // Generate a NEW transaction number for the new entry
    const newTransactionNumber = generateTransactionNumberForType('COH');

    // Mark the old record as inactive (to preserve it in history)
    await connection.query(
      `UPDATE certificate_of_cohabitation SET is_active = FALSE, date_updated = NOW() WHERE certificate_of_cohabitation_id = ?`,
      [id]
    );

    // Check if the table has the required columns
    const [columns] = await connection.query("SHOW COLUMNS FROM certificate_of_cohabitation");
    const hasUseSignature = columns.some(col => col.Field === 'use_signature');
    const hasSecretarySignatureId = columns.some(col => col.Field === 'secretary_signature_id');
    const hasCaptainSignatureId = columns.some(col => col.Field === 'captain_signature_id');
    
    // Build the query dynamically based on available columns
    let query = `
      INSERT INTO certificate_of_cohabitation (
        resident1_id,
        resident2_id,
        full_name1,
        dob1,
        full_name2,
        dob2,
        address,
        date_started,
        date_issued,
        witness1_name,
        witness2_name,
        transaction_number`;
    
    let values = [
      resident1_id,
      resident2_id,
      full_name1,
      dob1,
      full_name2,
      dob2,
      address,
      date_started,
      date_issued,
      witness1_name,
      witness2_name,
      newTransactionNumber
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
    
    query += ') VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?';
    
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
        coc.*,
        sec_sig.signature_id as sec_signature_id, 
        sec_sig.official_name as sec_official_name, 
        sec_sig.designation as sec_designation, 
        sec_sig.signature_path as sec_signature_path,
        cap_sig.signature_id as cap_signature_id, 
        cap_sig.official_name as cap_official_name, 
        cap_sig.designation as cap_designation, 
        cap_sig.signature_path as cap_signature_path
      FROM certificate_of_cohabitation coc
      LEFT JOIN official_signature sec_sig ON coc.secretary_signature_id = sec_sig.signature_id
      LEFT JOIN official_signature cap_sig ON coc.captain_signature_id = cap_sig.signature_id
      WHERE coc.certificate_of_cohabitation_id = ?
    `, [result.insertId]);

    await connection.commit();
    res.json(newRecord[0]);
  } catch (err) {
    await connection.rollback();
    console.error('Error updating cohabitation certificate record:', err);
    res.status(500).json({ error: 'Failed to update record' });
  } finally {
    connection.release();
  }
});

// DELETE cohabitation certificate (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE certificate_of_cohabitation SET is_active = FALSE, date_updated = NOW() WHERE certificate_of_cohabitation_id = ?`,
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