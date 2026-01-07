// routes/solo-parent.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { generateTransactionNumberForType } = require('../utils/transaction.utils');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all active solo parent records
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
  } catch (error) {
    console.error('Error fetching solo parent records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// GET all records including historical (for transaction log)
router.get('/transactions/all', async (req, res) => {
  try {
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
      ORDER BY spr.date_created DESC, spr.solo_parent_id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// Get single solo parent record by ID
router.get('/:id', async (req, res) => {
  try {
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
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching solo parent record:', error);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// Create new solo parent record
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
      use_signature,
      secretary_signature_id,
      captain_signature_id
    } = req.body;

    const transactionNum = `SP-${Date.now()}`;

    // Check if the table has the required columns
    const [columns] = await connection.query("SHOW COLUMNS FROM solo_parent_records");
    const hasUseSignature = columns.some(col => col.Field === 'use_signature');
    const hasSecretarySignatureId = columns.some(col => col.Field === 'secretary_signature_id');
    const hasCaptainSignatureId = columns.some(col => col.Field === 'captain_signature_id');
    
    // Build the query dynamically based on available columns
    let query = `
      INSERT INTO solo_parent_records (
        resident_id,
        transactionNum,
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
      transactionNum,
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
      transactionNum
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
    
    query += ') VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?';
    
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
  } catch (error) {
    await connection.rollback();
    console.error('Error creating solo parent record:', error);
    res.status(500).json({ error: 'Failed to create record' });
  } finally {
    connection.release();
  }
});

// Update solo parent record
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

    // Get the existing record
    const [existing] = await connection.query(
      'SELECT * FROM solo_parent_records WHERE solo_parent_id = ?',
      [id]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Record not found' });
    }

    // Generate a NEW transaction number for the new entry
    const newTransactionNumber = generateTransactionNumberForType('SP');

    // Mark the old record as inactive (to preserve it in history)
    await connection.query(
      'UPDATE solo_parent_records SET is_active = 0, date_updated = NOW() WHERE solo_parent_id = ?',
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
        transactionNum,
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
      newTransactionNumber,
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
    
    query += ') VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?';
    
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
  } catch (error) {
    await connection.rollback();
    console.error('Error updating solo parent record:', error);
    res.status(500).json({ error: 'Failed to update record' });
  } finally {
    connection.release();
  }
});

// Soft delete solo parent record
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const [result] = await connection.query(
      'UPDATE solo_parent_records SET is_active = 0 WHERE solo_parent_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Record not found' });
    }

    await connection.commit();
    res.json({ message: 'Solo parent record deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting solo parent record:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  } finally {
    connection.release();
  }
});

// Get all children for a solo parent
router.get('/:soloParentId/children', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM solo_parent_children WHERE solo_parent_id = ? ORDER BY date_created ASC',
      [req.params.soloParentId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({ error: 'Failed to fetch children' });
  }
});

// Create children for a solo parent (bulk insert)
router.post('/:soloParentId/children', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const soloParentId = req.params.soloParentId;
    const children = req.body;

    if (!Array.isArray(children) || children.length === 0) {
      return res.status(400).json({ error: 'Invalid children data' });
    }

    await connection.query(
      'DELETE FROM solo_parent_children WHERE solo_parent_id = ?',
      [soloParentId]
    );

    const values = children.map(child => [
      soloParentId,
      child.child_name,
      child.child_age,
      child.child_birthday,
      child.child_level,
      child.child_level_remarks,
      child.child_gender,
      child.child_relationship,
      child.child_relationship_remarks
    ]);

    await connection.query(`
      INSERT INTO solo_parent_children (
        solo_parent_id,
        child_name,
        child_age,
        child_birthday,
        child_level,
        child_level_remarks,
        child_gender,
        child_relationship,
        child_relationship_remarks
      ) VALUES ?
    `, [values]);

    await connection.commit();
    res.status(201).json({ message: 'Children records created successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating children records:', error);
    res.status(500).json({ error: 'Failed to create children records' });
  } finally {
    connection.release();
  }
});

// Update children for a solo parent (replace all)
router.put('/:soloParentId/children', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const soloParentId = req.params.soloParentId;
    const children = req.body;

    await connection.query(
      'DELETE FROM solo_parent_children WHERE solo_parent_id = ?',
      [soloParentId]
    );

    if (Array.isArray(children) && children.length > 0) {
      const values = children.map(child => [
        soloParentId,
        child.child_name,
        child.child_age,
        child.child_birthday,
        child.child_level,
        child.child_level_remarks,
        child.child_gender,
        child.child_relationship,
        child.child_relationship_remarks
      ]);

      await connection.query(`
        INSERT INTO solo_parent_children (
          solo_parent_id,
          child_name,
          child_age,
          child_birthday,
          child_level,
          child_level_remarks,
          child_gender,
          child_relationship,
          child_relationship_remarks
        ) VALUES ?
      `, [values]);
    }

    await connection.commit();
    res.json({ message: 'Children records updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating children records:', error);
    res.status(500).json({ error: 'Failed to update children records' });
  } finally {
    connection.release();
  }
});

// Delete a specific child
router.delete('/:soloParentId/children/:childId', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM solo_parent_children WHERE child_id = ? AND solo_parent_id = ?',
      [req.params.childId, req.params.soloParentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Child record not found' });
    }

    res.json({ message: 'Child record deleted successfully' });
  } catch (error) {
    console.error('Error deleting child record:', error);
    res.status(500).json({ error: 'Failed to delete child record' });
  }
});

// Search solo parent records
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = `%${req.params.query}%`;
    const [rows] = await pool.query(`
      SELECT * FROM solo_parent_records
      WHERE is_active = 1
      AND (
        full_name LIKE ? OR
        address LIKE ? OR
        contact_no LIKE ? OR
        transaction_number LIKE ?
      )
      ORDER BY date_created DESC
    `, [searchQuery, searchQuery, searchQuery, searchQuery]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error searching records:', error);
    res.status(500).json({ error: 'Failed to search records' });
  }
});

// Get statistics
router.get('/statistics/all', async (req, res) => {
  try {
    const [totalRecords] = await pool.query(
      'SELECT COUNT(*) as count FROM solo_parent_records WHERE is_active = 1'
    );
    
    const [totalChildren] = await pool.query(
      'SELECT COUNT(*) as count FROM solo_parent_children'
    );
    
    const [recordsThisMonth] = await pool.query(`
      SELECT COUNT(*) as count FROM solo_parent_records
      WHERE is_active = 1
      AND MONTH(date_created) = MONTH(CURRENT_DATE())
      AND YEAR(date_created) = YEAR(CURRENT_DATE())
    `);

    res.json({
      totalRecords: totalRecords[0].count,
      totalChildren: totalChildren[0].count,
      recordsThisMonth: recordsThisMonth[0].count
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;