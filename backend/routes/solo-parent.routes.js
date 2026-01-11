// routes/solo-parent.routes.js
// Backend route for Solo Parent records
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { generateTransactionNumberForType } = require('../utils/transaction.utils');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all active Solo Parent records
router.get('/', async (req, res) => {
  try {
    // Check if the table has the required columns
    const [columns] = await pool.query("SHOW COLUMNS FROM solo_parent_records");
    const hasUseSignature = columns.some(col => col.Field === 'use_signature');
    const hasSecretarySignatureId = columns.some(col => col.Field === 'secretary_signature_id');
    const hasCaptainSignatureId = columns.some(col => col.Field === 'captain_signature_id');
    
    // If the table doesn't have the required columns, add them
    if (!hasUseSignature) {
      await pool.query("ALTER TABLE solo_parent_records ADD COLUMN use_signature TINYINT(1) DEFAULT 0");
    }
    if (!hasSecretarySignatureId) {
      await pool.query("ALTER TABLE solo_parent_records ADD COLUMN secretary_signature_id INT NULL");
      // Add foreign key if official_signature table exists
      try {
        await pool.query("ALTER TABLE solo_parent_records ADD FOREIGN KEY (secretary_signature_id) REFERENCES official_signature(signature_id)");
      } catch (err) {
        // Foreign key might already exist or official_signature table might not exist
        console.log('Could not add foreign key for secretary_signature_id:', err.message);
      }
    }
    if (!hasCaptainSignatureId) {
      await pool.query("ALTER TABLE solo_parent_records ADD COLUMN captain_signature_id INT NULL");
      // Add foreign key if official_signature table exists
      try {
        await pool.query("ALTER TABLE solo_parent_records ADD FOREIGN KEY (captain_signature_id) REFERENCES official_signature(signature_id)");
      } catch (err) {
        // Foreign key might already exist or official_signature table might not exist
        console.log('Could not add foreign key for captain_signature_id:', err.message);
      }
    }
    
    // Now query with the appropriate columns
    const [rows] = await pool.query(`
      SELECT 
        spr.*,
        sec_sig.signature_id as sec_signature_id, 
        sec_sig.official_name as sec_official_name, 
        sec_sig.designation as sec_designation, 
        sec_sig.signature_path as sec_signature_path,
        cap_sig.signature_id as cap_signature_id, 
        cap_sig.official_name as cap_official_name, 
        cap_sig.designation as cap_designation, 
        cap_sig.signature_path as cap_signature_path
      FROM solo_parent_records spr
      LEFT JOIN official_signature sec_sig ON spr.secretary_signature_id = sec_sig.signature_id
      LEFT JOIN official_signature cap_sig ON spr.captain_signature_id = cap_sig.signature_id
      WHERE spr.is_active = 1
      ORDER BY spr.date_created DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Solo Parent records' });
  }
});

// GET valid certificates for a resident
router.get('/resident/:residentId/valid', async (req, res) => {
  try {
    const { residentId } = req.params;
    const { date } = req.query; // Date to check from (six months ago)
    
    const [rows] = await pool.query(`
      SELECT 
        spr.*,
        sec_sig.signature_id as sec_signature_id, 
        sec_sig.official_name as sec_official_name, 
        sec_sig.designation as sec_designation, 
        sec_sig.signature_path as sec_signature_path,
        cap_sig.signature_id as cap_signature_id, 
        cap_sig.official_name as cap_official_name, 
        cap_sig.designation as cap_designation, 
        cap_sig.signature_path as cap_signature_path
      FROM solo_parent_records spr
      LEFT JOIN official_signature sec_sig ON spr.secretary_signature_id = sec_sig.signature_id
      LEFT JOIN official_signature cap_sig ON spr.captain_signature_id = cap_sig.signature_id
      WHERE spr.resident_id = ? AND spr.is_active = 1 AND spr.date_issued >= ?
      ORDER BY spr.date_issued DESC
    `, [residentId, date]);
    
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch valid certificates' });
  }
});

// GET single Solo Parent record by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        spr.*,
        sec_sig.signature_id as sec_signature_id, 
        sec_sig.official_name as sec_official_name, 
        sec_sig.designation as sec_designation, 
        sec_sig.signature_path as sec_signature_path,
        cap_sig.signature_id as cap_signature_id, 
        cap_sig.official_name as cap_official_name, 
        cap_sig.designation as cap_designation, 
        cap_sig.signature_path as cap_signature_path
      FROM solo_parent_records spr
      LEFT JOIN official_signature sec_sig ON spr.secretary_signature_id = sec_sig.signature_id
      LEFT JOIN official_signature cap_sig ON spr.captain_signature_id = cap_sig.signature_id
      WHERE spr.solo_parent_id = ?
    `, [id]);
    
    if (rows.length === 0)
      return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// CREATE new Solo Parent record
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      resident_id,
      full_name,
      age,
      address,
      dob,
      contact_no,
      residents_since_year,
      unwed_since_year,
      employment_status,
      employment_remarks,
      date_issued,
      transaction_number,
      use_signature,
      secretary_signature_id,
      captain_signature_id
    } = req.body;

    if (!full_name || !address || !dob) {
      await connection.rollback();
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const finalTransactionNumber =
      transaction_number || generateTransactionNumberForType('SP');

    // Check if the table has the required columns
    const [columns] = await connection.query("SHOW COLUMNS FROM solo_parent_records");
    const hasUseSignature = columns.some(col => col.Field === 'use_signature');
    const hasSecretarySignatureId = columns.some(col => col.Field === 'secretary_signature_id');
    const hasCaptainSignatureId = columns.some(col => col.Field === 'captain_signature_id');
    
    // Build the query dynamically based on available columns
    let query = `
      INSERT INTO solo_parent_records (
        resident_id,
        full_name,
        age,
        address,
        dob,
        contact_no,
        residents_since_year,
        unwed_since_year,
        employment_status,
        employment_remarks,
        date_issued,
        transaction_number`;
    
    let values = [
      resident_id,
      full_name,
      age,
      address,
      dob,
      contact_no,
      residents_since_year,
      unwed_since_year,
      employment_status,
      employment_remarks,
      date_issued,
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
        spr.*,
        sec_sig.signature_id as sec_signature_id, 
        sec_sig.official_name as sec_official_name, 
        sec_sig.designation as sec_designation, 
        sec_sig.signature_path as sec_signature_path,
        cap_sig.signature_id as cap_signature_id, 
        cap_sig.official_name as cap_official_name, 
        cap_sig.designation as cap_designation, 
        cap_sig.signature_path as cap_signature_path
      FROM solo_parent_records spr
      LEFT JOIN official_signature sec_sig ON spr.secretary_signature_id = sec_sig.signature_id
      LEFT JOIN official_signature cap_sig ON spr.captain_signature_id = cap_sig.signature_id
      WHERE spr.solo_parent_id = ?
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

// UPDATE existing Solo Parent record
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
      dob,
      contact_no,
      residents_since_year,
      unwed_since_year,
      employment_status,
      employment_remarks,
      date_issued,
      use_signature,
      secretary_signature_id,
      captain_signature_id
    } = req.body;

    const [existing] = await connection.query(
      'SELECT * FROM solo_parent_records WHERE solo_parent_id = ?',
      [id]
    );
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Record not found' });
    }

    const newTransactionNumber = generateTransactionNumberForType('SP');

    await connection.query(
      `UPDATE solo_parent_records
       SET is_active = FALSE, date_updated = NOW()
       WHERE solo_parent_id = ?`,
      [id]
    );

    // Check if the table has the required columns
    const [columns] = await connection.query("SHOW COLUMNS FROM solo_parent_records");
    const hasUseSignature = columns.some(col => col.Field === 'use_signature');
    const hasSecretarySignatureId = columns.some(col => col.Field === 'secretary_signature_id');
    const hasCaptainSignatureId = columns.some(col => col.Field === 'captain_signature_id');
    
    // Build the query dynamically based on available columns
    let query = `
      INSERT INTO solo_parent_records (
        resident_id,
        full_name,
        age,
        address,
        dob,
        contact_no,
        residents_since_year,
        unwed_since_year,
        employment_status,
        employment_remarks,
        date_issued,
        transaction_number`;
    
    let values = [
      resident_id,
      full_name,
      age,
      address,
      dob,
      contact_no,
      residents_since_year,
      unwed_since_year,
      employment_status,
      employment_remarks,
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
        spr.*,
        sec_sig.signature_id as sec_signature_id, 
        sec_sig.official_name as sec_official_name, 
        sec_sig.designation as sec_designation, 
        sec_sig.signature_path as sec_signature_path,
        cap_sig.signature_id as cap_signature_id, 
        cap_sig.official_name as cap_official_name, 
        cap_sig.designation as cap_designation, 
        cap_sig.signature_path as cap_signature_path
      FROM solo_parent_records spr
      LEFT JOIN official_signature sec_sig ON spr.secretary_signature_id = sec_sig.signature_id
      LEFT JOIN official_signature cap_sig ON spr.captain_signature_id = cap_sig.signature_id
      WHERE spr.solo_parent_id = ?
    `, [result.insertId]);

    await connection.commit();
    res.json(newRecord[0]);
  } catch (err) {
    await connection.rollback();
    console.error('Failed to update Solo Parent record', err);
    res.status(500).json({ error: 'Failed to update record' });
  } finally {
    connection.release();
  }
});

// DELETE Solo Parent record (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE solo_parent_records SET is_active = FALSE, date_updated = NOW() WHERE solo_parent_id = ?`,
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