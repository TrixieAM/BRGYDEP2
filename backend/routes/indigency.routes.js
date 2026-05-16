// routes/indigency.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { generateTransactionNumber, generateTransactionNumberForType } = require('../utils/transaction.utils');

router.use(verifyToken);

// ─── SELECT helper (reused in every query) ───────────────────────────────────
const SELECT_FIELDS = `
  indigency.indigency_id, indigency.resident_id, indigency.full_name,
  indigency.address, indigency.barangay, indigency.provincial_address,
  indigency.dob, indigency.age, indigency.civil_status, indigency.contact_no,
  indigency.source_of_income, indigency.monthly_income,
  indigency.request_reason, indigency.remarks,
  indigency.date_issued, indigency.transaction_number, indigency.control_no,
  indigency.prepared_by_name, indigency.prepared_by_position,
  indigency.date_created, indigency.date_updated, indigency.is_active,
  indigency.use_signature, indigency.signature_id,
  sig.official_name, sig.designation, sig.signature_path
`;

const FROM_JOIN = `
  FROM indigency
  LEFT JOIN official_signature sig ON indigency.signature_id = sig.signature_id
`;

// ─── GET all active records ───────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${SELECT_FIELDS} ${FROM_JOIN}
       WHERE indigency.is_active = TRUE
       ORDER BY indigency.indigency_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch indigency records' });
  }
});

// ─── GET all records including historical ────────────────────────────────────
router.get('/transactions/all', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${SELECT_FIELDS} ${FROM_JOIN}
       ORDER BY indigency.date_created DESC, indigency.indigency_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// ─── GET single record by ID ──────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT ${SELECT_FIELDS} ${FROM_JOIN}
       WHERE indigency.indigency_id = ?`,
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

// ─── GET record by transaction number ────────────────────────────────────────
router.get('/transaction/:transactionNumber', async (req, res) => {
  try {
    const { transactionNumber } = req.params;
    const [rows] = await pool.query(
      `SELECT ${SELECT_FIELDS} ${FROM_JOIN}
       WHERE indigency.transaction_number = ? AND indigency.is_active = TRUE`,
      [transactionNumber]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Certificate not found with this transaction number' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

// ─── Helper: extract & validate body ─────────────────────────────────────────
function extractBody(body) {
  const {
    resident_id,
    full_name,
    address,
    barangay,
    provincial_address,
    dob,
    age,
    civil_status,
    contact_no,
    source_of_income,
    monthly_income,
    request_reason,
    remarks,
    date_issued,
    transaction_number,
    control_no,
    prepared_by_name,
    prepared_by_position,
    use_signature,
    signature_id,
  } = body;

  return {
    resident_id,
    full_name,
    address,
    barangay: barangay || null,
    provincial_address: provincial_address || null,
    dob,
    age,
    civil_status,
    contact_no: contact_no || null,
    source_of_income: source_of_income || null,
    monthly_income: monthly_income || null,
    request_reason,
    remarks: remarks || null,
    date_issued,
    transaction_number,
    control_no: control_no || null,
    prepared_by_name: prepared_by_name || null,
    prepared_by_position: prepared_by_position || null,
    use_signature: use_signature ? 1 : 0,
    signature_id: use_signature && signature_id ? signature_id : null,
  };
}

function validateRequired(fields) {
  const { full_name, address, dob, age, civil_status, request_reason, date_issued } = fields;
  return full_name && address && dob && Number.isFinite(Number(age)) && civil_status && request_reason && date_issued;
}

// ─── INSERT helper ────────────────────────────────────────────────────────────
async function insertRecord(fields, transactionNum) {
  const [result] = await pool.query(
    `INSERT INTO indigency
      (resident_id, full_name, address, barangay, provincial_address, dob, age,
       civil_status, contact_no, source_of_income, monthly_income,
       request_reason, remarks, date_issued, transaction_number, control_no,
       prepared_by_name, prepared_by_position, use_signature, signature_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      fields.resident_id,
      fields.full_name,
      fields.address,
      fields.barangay,
      fields.provincial_address,
      fields.dob,
      Number(fields.age),
      fields.civil_status,
      fields.contact_no,
      fields.source_of_income,
      fields.monthly_income,
      fields.request_reason,
      fields.remarks,
      fields.date_issued,
      transactionNum,
      fields.control_no,
      fields.prepared_by_name,
      fields.prepared_by_position,
      fields.use_signature,
      fields.signature_id,
    ]
  );
  return result.insertId;
}

// ─── SELECT newly inserted/updated record ─────────────────────────────────────
async function fetchById(id) {
  const [rows] = await pool.query(
    `SELECT ${SELECT_FIELDS} ${FROM_JOIN}
     WHERE indigency.indigency_id = ?`,
    [id]
  );
  return rows[0];
}

// ─── CREATE ───────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const fields = extractBody(req.body);

    if (!fields.resident_id || !validateRequired(fields))
      return res.status(400).json({ error: 'Missing required fields' });

    let transactionNum = fields.transaction_number || generateTransactionNumber();

    // Ensure unique transaction number
    const [existing] = await pool.query(
      'SELECT indigency_id FROM indigency WHERE transaction_number = ?',
      [transactionNum]
    );
    if (existing.length > 0) transactionNum = generateTransactionNumber();

    const insertId = await insertRecord(fields, transactionNum);
    const record = await fetchById(insertId);
    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// ─── UPDATE (creates new record, marks old as inactive) ───────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = extractBody(req.body);

    if (!validateRequired(fields))
      return res.status(400).json({ error: 'Missing required fields' });

    const [existing] = await pool.query(
      'SELECT * FROM indigency WHERE indigency_id = ?',
      [id]
    );
    if (existing.length === 0)
      return res.status(404).json({ error: 'Record not found' });

    // Mark old record inactive
    await pool.query(
      'UPDATE indigency SET is_active = FALSE WHERE indigency_id = ?',
      [id]
    );

    // Insert new record with new transaction number
    const newTransactionNumber = generateTransactionNumberForType('IND');
    const insertId = await insertRecord(fields, newTransactionNumber);
    const record = await fetchById(insertId);
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// ─── DELETE (soft delete) ─────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE indigency SET is_active = FALSE, date_updated = NOW() WHERE indigency_id = ?',
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