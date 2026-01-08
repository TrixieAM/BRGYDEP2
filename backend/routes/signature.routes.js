// routes/signature.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db.config');
const { logAudit } = require('../utils/audit.utils');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/signatures');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `signature-${uniqueSuffix}${ext}`);
  }
});

// File filter - only allow PNG and JPG
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PNG and JPG images are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: fileFilter
});

// GET all signatures
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM official_signature ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch signatures' });
  }
});

// GET single signature by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM official_signature WHERE signature_id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Signature not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch signature' });
  }
});

// POST upload new signature (Admin/Chairman only)
router.post('/upload', requireRole(['admin', 'chairman']), upload.single('signature'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { official_name, designation } = req.body;

    if (!official_name || !designation) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Official name and designation are required' });
    }

    // Store relative path for easier serving
    const signaturePath = `/uploads/signatures/${req.file.filename}`;

    const [result] = await pool.query(
      `INSERT INTO official_signature (official_name, designation, signature_path)
       VALUES (?, ?, ?)`,
      [official_name, designation, signaturePath]
    );
    await logAudit(req.user, 'SIGNATURE_UPLOAD', 'official_signature', result.insertId, { official_name, designation });

    const [rows] = await pool.query(
      `SELECT * FROM official_signature WHERE signature_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload signature' });
  }
});

// PUT update signature (Admin/Chairman only)
router.put('/:id', requireRole(['admin', 'chairman']), upload.single('signature'), async (req, res) => {
  try {
    const { id } = req.params;
    const { official_name, designation } = req.body;

    // Get existing signature
    const [existing] = await pool.query(
      `SELECT * FROM official_signature WHERE signature_id = ?`,
      [id]
    );

    if (existing.length === 0) {
      // Clean up uploaded file if record doesn't exist
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: 'Signature not found' });
    }

    const oldSignature = existing[0];
    let signaturePath = oldSignature.signature_path;

    // If new file uploaded, update path and delete old file
    if (req.file) {
      signaturePath = `/uploads/signatures/${req.file.filename}`;
      
      // Delete old file
      const oldFilePath = path.join(__dirname, '..', oldSignature.signature_path);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update database
    const updateFields = [];
    const updateValues = [];

    if (official_name) {
      updateFields.push('official_name = ?');
      updateValues.push(official_name);
    }
    if (designation) {
      updateFields.push('designation = ?');
      updateValues.push(designation);
    }
    if (req.file) {
      updateFields.push('signature_path = ?');
      updateValues.push(signaturePath);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(id);

    await pool.query(
      `UPDATE official_signature SET ${updateFields.join(', ')}, updated_at = NOW() WHERE signature_id = ?`,
      updateValues
    );

    const [rows] = await pool.query(
      `SELECT * FROM official_signature WHERE signature_id = ?`,
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to update signature' });
  }
});

// DELETE signature (Admin/Chairman only)
router.delete('/:id', requireRole(['admin', 'chairman']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get signature to delete file
    const [existing] = await pool.query(
      `SELECT * FROM official_signature WHERE signature_id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Signature not found' });
    }

    // Delete file
    const filePath = path.join(__dirname, '..', existing[0].signature_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await pool.query(
      `DELETE FROM official_signature WHERE signature_id = ?`,
      [id]
    );

    res.json({ message: 'Signature deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete signature' });
  }
});

module.exports = router;

