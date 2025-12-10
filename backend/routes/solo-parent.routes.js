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
    const [rows] = await pool.query(`
      SELECT 
        solo_parent_id,
        resident_id,
        transactionNum,
        full_name,
        address,
        dob,
        age,
        contact_no,
        residents_since_year,
        unwed_since_year,
        employment_status,
        employment_remarks,
        date_issued,
        transaction_number,
        is_active,
        date_created,
        date_updated
      FROM solo_parent_records
      WHERE is_active = 1
      ORDER BY date_created DESC
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
        solo_parent_id,
        resident_id,
        transactionNum,
        full_name,
        address,
        dob,
        age,
        contact_no,
        residents_since_year,
        unwed_since_year,
        employment_status,
        employment_remarks,
        date_issued,
        transaction_number,
        is_active,
        date_created,
        date_updated
      FROM solo_parent_records
      ORDER BY date_created DESC, solo_parent_id DESC
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
    const [rows] = await pool.query(
      'SELECT * FROM solo_parent_records WHERE solo_parent_id = ?',
      [req.params.id]
    );
    
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
      date_issued
    } = req.body;

    const transactionNum = `SP-${Date.now()}`;

    const [result] = await connection.query(`
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
        transaction_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
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
    ]);

    await connection.commit();
    
    res.status(201).json({
      solo_parent_id: result.insertId,
      transactionNum,
      message: 'Solo parent record created successfully'
    });
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
      date_issued
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

    // Create a NEW record entry with the updated data and new transaction number
    const [result] = await connection.query(`
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
        transaction_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
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
    ]);

    // Get the newly created record
    const [newRecord] = await connection.query(
      'SELECT * FROM solo_parent_records WHERE solo_parent_id = ?',
      [result.insertId]
    );

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

