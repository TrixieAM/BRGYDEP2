const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "brgy145",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function runMigrations() {
  try {
    console.log("🚀 Running database migrations...\n");

    const migrations = [
      "migrations/certificate-of-residency-fields.sql",
      "migrations/indigency-fields.sql",
      "migrations/business-clearance-fields.sql",
      "migrations/certificate-of-low-income.sql",
      "migrations/certificate-of-good-moral.sql",
    ];

    for (const migration of migrations) {
      const filePath = path.join(__dirname, migration);
      console.log(`📝 Running: ${migration}`);

      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${filePath}`);
        continue;
      }

      const sql = fs.readFileSync(filePath, "utf8");
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        try {
          await pool.query(statement);
        } catch (err) {
          console.error(`❌ Error executing statement: ${err.message}`);
          throw err;
        }
      }

      console.log(`✅ ${migration} completed\n`);
    }

    console.log("✨ All migrations completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

runMigrations();
