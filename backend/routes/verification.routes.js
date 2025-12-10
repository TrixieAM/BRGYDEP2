// routes/verification.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { generateDocumentHash } = require('../utils/hash.utils');

// API endpoint to verify certificate (for JSON response)
router.get('/indigency/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hash } = req.query;

    const [rows] = await pool.query(
      `SELECT indigency_id, full_name, address, dob, age, provincial_address,
              contact_no, civil_status, remarks, request_reason, date_issued,
              transaction_number, date_created, is_active
       FROM indigency
       WHERE indigency_id = ? AND is_active = TRUE`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        valid: false,
        message: 'Certificate not found or has been revoked',
      });
    }

    const certificate = rows[0];
    const serverHash = generateDocumentHash(certificate);

    if (hash && hash !== serverHash) {
      return res.status(400).json({
        valid: false,
        message:
          'Certificate hash mismatch - document may have been tampered with',
      });
    }

    res.json({
      valid: true,
      message: 'Certificate is authentic',
      certificate: {
        id: certificate.indigency_id,
        transaction_number: certificate.transaction_number,
        full_name: certificate.full_name,
        address: certificate.address,
        date_issued: certificate.date_issued,
        civil_status: certificate.civil_status,
        date_created: certificate.date_created,
      },
      hash: serverHash,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      valid: false,
      message: 'Verification failed due to server error',
    });
  }
});

// HTML verification page (for QR code scanning)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hash } = req.query;

    const [rows] = await pool.query(
      `SELECT indigency_id, full_name, address, date_issued, civil_status,
              transaction_number, is_active
       FROM indigency WHERE indigency_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Certificate Verification</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .invalid { background: #fee; border: 2px solid #c00; padding: 20px; border-radius: 8px; }
            h1 { color: #333; }
            .status { font-size: 24px; font-weight: bold; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="invalid">
            <h1>⚠️ Certificate Not Found</h1>
            <p class="status">INVALID</p>
            <p>This certificate does not exist in our records or has been revoked.</p>
          </div>
        </body>
        </html>
      `);
    }

    const certificate = rows[0];
    const serverHash = generateDocumentHash(certificate);
    const isValid = hash === serverHash && certificate.is_active;

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate Verification - Barangay 145</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 700px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .invalid { border-left: 5px solid #c00; }
          .valid { border-left: 5px solid #0c0; }
          h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
          }
          .status {
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
          }
          .status.valid-status {
            background: #d4edda;
            color: #155724;
          }
          .status.invalid-status {
            background: #f8d7da;
            color: #721c24;
          }
          .details {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            margin-top: 20px;
          }
          .detail-row {
            margin: 12px 0;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: bold;
            color: #555;
            display: inline-block;
            width: 180px;
          }
          .value {
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #0b7030;
          }
          .logo-text {
            color: #0b7030;
            font-size: 16px;
            font-weight: bold;
          }
          .hash {
            font-family: monospace;
            background: #e9ecef;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
            word-break: break-all;
          }
          .transaction-number {
            font-family: monospace;
            background: #fff3cd;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 14px;
            font-weight: bold;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container ${isValid ? 'valid' : 'invalid'}">
          <div class="header">
            <div class="logo-text">BARANGAY 145 ZONE 13 DIST. 1</div>
            <div class="logo-text">CITY OF CALOOCAN</div>
            <h1>Certificate Verification</h1>
          </div>
         
          <div class="status ${isValid ? 'valid-status' : 'invalid-status'}">
            ${isValid ? '✓ CERTIFICATE IS AUTHENTIC' : '⚠️ VERIFICATION FAILED'}
          </div>
         
          ${
            isValid
              ? `
            <p style="text-align: center; color: #666;">
              This Certificate of Indigency has been verified as authentic and valid.
            </p>
           
            <div class="details">
              <h3 style="margin-top: 0; color: #0b7030;">Certificate Details</h3>
              <div class="detail-row">
                <span class="label">Certificate ID:</span>
                <span class="value">${certificate.indigency_id}</span>
              </div>
              <div class="detail-row">
                <span class="label">Transaction Number:</span>
                <span class="value transaction-number">${
                  certificate.transaction_number || 'N/A'
                }</span>
              </div>
              <div class="detail-row">
                <span class="label">Full Name:</span>
                <span class="value">${certificate.full_name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Address:</span>
                <span class="value">${certificate.address}</span>
              </div>
              <div class="detail-row">
                <span class="label">Civil Status:</span>
                <span class="value">${certificate.civil_status}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date Issued:</span>
                <span class="value">${new Date(
                  certificate.date_issued
                ).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</span>
              </div>
              <div class="detail-row">
                <span class="label">Verification Hash:</span>
                <span class="value hash">${serverHash}</span>
              </div>
            </div>
          `
              : `
            <p style="text-align: center; color: #721c24;">
              ${
                hash
                  ? 'The certificate hash does not match our records. This document may have been tampered with.'
                  : 'No verification hash provided.'
              }
            </p>
            <div class="details">
              <h3 style="margin-top: 0; color: #c00;">Why This Failed:</h3>
              <ul>
                <li>The document content may have been modified</li>
                <li>The certificate may have been forged</li>
                <li>The QR code may have been replaced</li>
              </ul>
              <p style="margin-top: 20px;">
                <strong>Certificate ID Found:</strong> ${
                  certificate.indigency_id
                }<br>
                <strong>Transaction Number:</strong> ${
                  certificate.transaction_number || 'N/A'
                }<br>
                <strong>Name on Record:</strong> ${certificate.full_name}
              </p>
            </div>
          `
          }
         
          <p style="text-align: center; margin-top: 30px; color: #888; font-size: 14px;">
            For inquiries, please contact Barangay 145 Office<br>
            Tel. No. 8711-7134
          </p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Verification system error');
  }
});

// Get verification hash for a certificate
router.get('/api/indigency/:id/hash', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT indigency_id, full_name, date_issued, transaction_number
       FROM indigency WHERE indigency_id = ? AND is_active = TRUE`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const hash = generateDocumentHash(rows[0]);
    res.json({
      hash,
      certificate_id: id,
      transaction_number: rows[0].transaction_number,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate hash' });
  }
});

// API endpoint to verify business clearance certificate
router.get('/business-clearance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hash } = req.query;

    const [rows] = await pool.query(
      `SELECT business_clearance_id, full_name, address, dob, age, provincial_address,
              contact_no, civil_status, remarks, request_reason, date_issued,
              transaction_number, date_created, is_active
       FROM business_clearance
       WHERE business_clearance_id = ? AND is_active = TRUE`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        valid: false,
        message: 'Certificate not found or has been revoked',
      });
    }

    const certificate = rows[0];
    const serverHash = generateDocumentHash({
      ...certificate,
      indigency_id: certificate.business_clearance_id,
      type: 'business_clearance',
    });

    if (hash && hash !== serverHash) {
      return res.status(400).json({
        valid: false,
        message:
          'Certificate hash mismatch - document may have been tampered with',
      });
    }

    res.json({
      valid: true,
      message: 'Certificate is authentic',
      certificate: {
        id: certificate.business_clearance_id,
        transaction_number: certificate.transaction_number,
        full_name: certificate.full_name,
        address: certificate.address,
        date_issued: certificate.date_issued,
        civil_status: certificate.civil_status,
        date_created: certificate.date_created,
      },
      hash: serverHash,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      valid: false,
      message: 'Verification failed due to server error',
    });
  }
});

// Get verification hash for business clearance certificate
router.get('/api/business-clearance/:id/hash', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT business_clearance_id, full_name, date_issued, transaction_number
       FROM business_clearance WHERE business_clearance_id = ? AND is_active = TRUE`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const hash = generateDocumentHash({
      ...rows[0],
      indigency_id: rows[0].business_clearance_id,
      type: 'business_clearance',
    });
    res.json({
      hash,
      certificate_id: id,
      transaction_number: rows[0].transaction_number,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate hash' });
  }
});

module.exports = router;

