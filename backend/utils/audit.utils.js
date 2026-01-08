const { pool } = require('../config/db.config');

async function logAudit(user, action, entityType, entityId, metadata = {}) {
  try {
    const userId = user?.user_id || null;
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId, action, entityType || null, entityId || null, JSON.stringify(metadata)]
    );
  } catch (err) {
    // Fail silently to avoid blocking main flow
    console.error('Failed to write audit log:', err);
  }
}

module.exports = { logAudit };
