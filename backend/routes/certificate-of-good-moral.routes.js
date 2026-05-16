const express = require("express");
const { verifyToken } = require("../middleware/auth.middleware");
const { pool } = require("../config/db.config");
const { generateTransactionNumberForType } = require("../utils/transaction.utils");

const router = express.Router();

// GET all active records
router.get("/", verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        cgm.*,
        os.official_name,
        os.signature_path
      FROM certificate_of_good_moral cgm
      LEFT JOIN official_signature os ON cgm.signature_id = os.signature_id
      WHERE cgm.is_active = TRUE
      ORDER BY cgm.date_created DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

// GET all records including historical
router.get("/transactions/all", verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        cgm.*,
        os.official_name,
        os.signature_path
      FROM certificate_of_good_moral cgm
      LEFT JOIN official_signature os ON cgm.signature_id = os.signature_id
      ORDER BY cgm.date_created DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// GET single record
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        cgm.*,
        os.official_name,
        os.signature_path
      FROM certificate_of_good_moral cgm
      LEFT JOIN official_signature os ON cgm.signature_id = os.signature_id
      WHERE cgm.certificate_of_good_moral_id = ?
    `;
    const [rows] = await pool.query(query, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching record:", error);
    res.status(500).json({ error: "Failed to fetch record" });
  }
});

// POST create new record
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      resident_id,
      full_name,
      address,
      civil_status,
      date_issued,
      date_expired,
      remarks,
      request_reason,
      transaction_number,
      control_no,
      prepared_by_name,
      prepared_by_position,
      use_signature,
      signature_id,
    } = req.body;

    // Validate required fields
    if (!full_name || !address || !date_issued || !date_expired || !request_reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const finalTransactionNumber = transaction_number || generateTransactionNumberForType("GCM");

    const query = `
      INSERT INTO certificate_of_good_moral (
        resident_id, full_name, address, civil_status, date_issued, date_expired,
        remarks, request_reason, transaction_number, control_no, prepared_by_name,
        prepared_by_position, use_signature, signature_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      resident_id || null,
      full_name,
      address,
      civil_status || null,
      date_issued,
      date_expired,
      remarks || null,
      request_reason,
      finalTransactionNumber,
      control_no || null,
      prepared_by_name || null,
      prepared_by_position || null,
      use_signature ? 1 : 0,
      signature_id || null,
    ]);

    // Fetch and return the created record
    const getQuery = `
      SELECT 
        cgm.*,
        os.official_name,
        os.signature_path
      FROM certificate_of_good_moral cgm
      LEFT JOIN official_signature os ON cgm.signature_id = os.signature_id
      WHERE cgm.certificate_of_good_moral_id = ?
    `;
    const [newRecord] = await pool.query(getQuery, [result.insertId]);
    res.status(201).json(newRecord[0]);
  } catch (error) {
    console.error("Error creating record:", error);
    res.status(500).json({ error: "Failed to create record" });
  }
});

// PUT update record
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const {
      resident_id,
      full_name,
      address,
      civil_status,
      date_issued,
      date_expired,
      remarks,
      request_reason,
      transaction_number,
      control_no,
      prepared_by_name,
      prepared_by_position,
      use_signature,
      signature_id,
    } = req.body;

    // Mark old record as inactive
    const inactiveQuery = `UPDATE certificate_of_good_moral SET is_active = FALSE WHERE certificate_of_good_moral_id = ?`;
    await pool.query(inactiveQuery, [req.params.id]);

    // Create new entry with updated data
    const finalTransactionNumber = transaction_number || generateTransactionNumberForType("GCM");

    const insertQuery = `
      INSERT INTO certificate_of_good_moral (
        resident_id, full_name, address, civil_status, date_issued, date_expired,
        remarks, request_reason, transaction_number, control_no, prepared_by_name,
        prepared_by_position, use_signature, signature_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(insertQuery, [
      resident_id || null,
      full_name,
      address,
      civil_status || null,
      date_issued,
      date_expired,
      remarks || null,
      request_reason,
      finalTransactionNumber,
      control_no || null,
      prepared_by_name || null,
      prepared_by_position || null,
      use_signature ? 1 : 0,
      signature_id || null,
    ]);

    // Fetch and return the updated record
    const getQuery = `
      SELECT 
        cgm.*,
        os.official_name,
        os.signature_path
      FROM certificate_of_good_moral cgm
      LEFT JOIN official_signature os ON cgm.signature_id = os.signature_id
      WHERE cgm.certificate_of_good_moral_id = ?
    `;
    const [updatedRecord] = await pool.query(getQuery, [result.insertId]);
    res.json(updatedRecord[0]);
  } catch (error) {
    console.error("Error updating record:", error);
    res.status(500).json({ error: "Failed to update record" });
  }
});

// DELETE soft delete record
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const query = `UPDATE certificate_of_good_moral SET is_active = FALSE, date_updated = NOW() WHERE certificate_of_good_moral_id = ?`;
    const [result] = await pool.query(query, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("Error deleting record:", error);
    res.status(500).json({ error: "Failed to delete record" });
  }
});

module.exports = router;
