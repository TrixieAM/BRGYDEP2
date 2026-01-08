// routes/role-permissions.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.config');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.use(verifyToken);

// Allow any authenticated user to read their own role permissions
router.get('/me', async (req, res) => {
  try {
    const { role } = req.user;
    const [rows] = await pool.query(
      'SELECT permission FROM role_permissions WHERE role = ? AND allowed = 1',
      [role]
    );
    res.json({
      role,
      permissions: rows.map((row) => row.permission),
    });
  } catch (err) {
    console.error('Error fetching current user role permissions:', err);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

// Admin-only operations below
router.use(requireRole('admin'));

// GET all role permissions
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT role_permission_id, role, permission, allowed FROM role_permissions ORDER BY role, permission'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching role permissions:', err);
    res.status(500).json({ error: 'Failed to fetch role permissions' });
  }
});

// POST bulk upsert role permissions
router.post('/bulk', async (req, res) => {
  try {
    const { permissions } = req.body;
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({ error: 'permissions array is required' });
    }

    // Ensure unique constraint exists (role + permission should be unique)
    // Insert or update each permission individually to handle cases where the entry doesn't exist
    for (const perm of permissions) {
      await pool.query(
        `INSERT INTO role_permissions (role, permission, allowed)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE allowed = VALUES(allowed)`,
        [perm.role, perm.permission, perm.allowed ? 1 : 0]
      );
    }

    res.json({ success: true, updated: permissions.length });
  } catch (err) {
    console.error('Error updating role permissions:', err);
    res.status(500).json({ error: 'Failed to update role permissions' });
  }
});

// POST initialize default page permissions
router.post('/initialize', async (req, res) => {
  try {
    const roles = ['admin', 'chairman', 'staff'];
    const pagePermissions = [
      // Main Pages
      'access_residents',
      'access_reports',
      'access_transaction',
      // Request Forms
      'access_indigency',
      'access_certification_action',
      'access_solo_parent',
      'access_business_clearance',
      'access_barangay_clearance',
      'access_barangay_clearance_crud',
      'access_certificate_residency',
      'access_permit_travel',
      'access_oath_job_seeker',
      'access_cash_assistance',
      'access_financial_assistance',
      'access_cohabitation',
      'access_verify_cohabitation',
      'access_bhert_normal',
      'access_bhert_positive',
    ];

    // Default permissions: admin has all, chairman and staff have most except admin-only features
    const defaultPermissions = {
      admin: pagePermissions.reduce((acc, perm) => {
        acc[perm] = true;
        return acc;
      }, {}),
      chairman: pagePermissions.reduce((acc, perm) => {
        // Chairman can access all pages except some admin-only features
        acc[perm] = true;
        return acc;
      }, {}),
      staff: pagePermissions.reduce((acc, perm) => {
        // Staff can access most pages
        acc[perm] = true;
        return acc;
      }, {}),
    };

    const inserts = [];
    for (const role of roles) {
      for (const permission of pagePermissions) {
        inserts.push([
          role,
          permission,
          defaultPermissions[role][permission] ? 1 : 0,
        ]);
      }
    }

    if (inserts.length > 0) {
      // Insert each permission individually to handle the ON DUPLICATE KEY UPDATE properly
      for (const insert of inserts) {
        await pool.query(
          `INSERT INTO role_permissions (role, permission, allowed)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE allowed = VALUES(allowed)`,
          insert
        );
      }
    }

    res.json({ success: true, initialized: inserts.length });
  } catch (err) {
    console.error('Error initializing page permissions:', err);
    res.status(500).json({ error: 'Failed to initialize page permissions' });
  }
});

module.exports = router;
