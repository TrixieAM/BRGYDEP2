// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;

// Database pool for migrations
const migrationPool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'brgy145',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Run migrations on startup
async function runMigrations() {
  try {
    console.log('🚀 Running database migrations...\n');

    const migrations = [
      'migrations/certificate-of-residency-fields.sql',
      'migrations/indigency-fields.sql',
      'migrations/business-clearance-fields.sql',
      'migrations/certificate-of-low-income.sql',
      'migrations/certificate-of-good-moral.sql',
    ];

    for (const migration of migrations) {
      const filePath = path.join(__dirname, migration);
      console.log(`📝 Running: ${migration}`);

      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${filePath}`);
        continue;
      }

      const sql = fs.readFileSync(filePath, 'utf8');
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        try {
          await migrationPool.query(statement);
        } catch (err) {
          console.error(`❌ Error executing statement: ${err.message}`);
        }
      }
    }

    console.log('\n✅ Migrations completed!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run migrations before starting server
(async () => {
  await runMigrations();
})();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files for signatures
app.use('/uploads/signatures', express.static('uploads/signatures'));
// Serve static files for officials
app.use('/uploads/officials', express.static('uploads/officials'));

// Import routes
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const residentsRoutes = require('./routes/residents.routes');
const indigencyRoutes = require('./routes/indigency.routes');
const barangayClearanceRoutes = require('./routes/barangay-clearance.routes');
const businessClearanceRoutes = require('./routes/business-clearance.routes');
const certificateOfResidencyRoutes = require('./routes/certificate-of-residency.routes');
const permitToTravelRoutes = require('./routes/permit-to-travel.routes');
const cashAssistanceRoutes = require('./routes/cash-assistance.routes');
const financialAssistanceRoutes = require('./routes/financial-assistance.routes');
const bhertCertPositiveRoutes = require('./routes/bhert-certificate-positive.routes');
const bhertCertNormalRoutes = require('./routes/bhert-certificate-normal.routes');
const certificateOfActionRoutes = require('./routes/certificate-of-action.routes');
const certificateOfCohabitationRoutes = require('./routes/certificate-of-cohabitation.routes');
const certificateOfLowIncomeRoutes = require('./routes/certificate-of-low-income.routes');
const certificateOfGoodMoralRoutes = require('./routes/certificate-of-good-moral.routes');
const certificatesRoutes = require('./routes/certificates.routes');
const requestRecordsRoutes = require('./routes/request-records.routes');
const oathJobRoutes = require('./routes/oath-job.routes');
const soloParentRoutes = require('./routes/solo-parent.routes');
const verificationRoutes = require('./routes/verification.routes');
const signatureRoutes = require('./routes/signature.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const rolePermissionsRoutes = require('./routes/role-permissions.routes');
const auditRoutes = require('./routes/audit.routes');


/**
 * ROOT
 */
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Barangay 145 API 🚀' });
});

/**
 * ROUTES
 */
// Public routes (no authentication required)
app.use('/verify', verificationRoutes);

// Authentication routes
app.use('/auth', authRoutes);

// Protected routes (require authentication)
app.use('/users', usersRoutes);
app.use('/residents', residentsRoutes);
app.use('/indigency', indigencyRoutes);
app.use('/barangay-clearance', barangayClearanceRoutes);
app.use('/business-clearance', businessClearanceRoutes);
app.use('/certificate-of-residency', certificateOfResidencyRoutes);
app.use('/permit-to-travel', permitToTravelRoutes);
app.use('/cash-assistance', cashAssistanceRoutes);
app.use('/financial-assistance', financialAssistanceRoutes);
app.use('/bhert-certificate-positive', bhertCertPositiveRoutes);
app.use('/bhert-certificate-normal', bhertCertNormalRoutes);
app.use('/certificate-of-action', certificateOfActionRoutes);
app.use('/certificate-of-cohabitation', certificateOfCohabitationRoutes);
app.use('/certificate-of-low-income', certificateOfLowIncomeRoutes);
app.use('/certificate-of-good-moral', certificateOfGoodMoralRoutes);
app.use('/certificates', certificatesRoutes);
app.use('/request-records', requestRecordsRoutes);
app.use('/oath-job', oathJobRoutes);
app.use('/solo-parent-records', soloParentRoutes);
app.use('/api/signature', signatureRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/role-permissions', rolePermissionsRoutes);
app.use('/audit-logs', auditRoutes);



// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
