const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

// Database connection
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "brgy145",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function setupDatabase() {
  try {
    console.log("Setting up database...");

    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id int(11) NOT NULL AUTO_INCREMENT,
        username varchar(50) NOT NULL,
        name varchar(255) NOT NULL,
        password varchar(255) NOT NULL,
        role enum('admin','staff','chairman') DEFAULT 'staff',
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (user_id),
        UNIQUE KEY username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    console.log("Users table created/verified");

    // Create residents table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS residents (
        resident_id int(11) NOT NULL AUTO_INCREMENT,
        full_name varchar(255) NOT NULL,
        address varchar(255) DEFAULT NULL,
        provincial_address varchar(255) DEFAULT NULL,
        dob date DEFAULT NULL,
        age int(11) DEFAULT NULL,
        civil_status varchar(50) DEFAULT NULL,
        contact_no varchar(50) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (resident_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    console.log("Residents table created/verified");

    // Create certificate_of_cohabitation table if it doesn't exist (FKs to residents)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS certificate_of_cohabitation (
        certificate_of_cohabitation_id int(11) NOT NULL AUTO_INCREMENT,
        resident1_id int(11) NOT NULL,
        resident2_id int(11) NOT NULL,
        full_name1 varchar(255) NOT NULL,
        dob1 date NOT NULL,
        full_name2 varchar(255) NOT NULL,
        dob2 date NOT NULL,
        address varchar(255) NOT NULL,
        date_started year(4) NOT NULL,
        date_issued date NOT NULL,
        witness1_name varchar(255) DEFAULT NULL,
        witness2_name varchar(255) DEFAULT NULL,
        transaction_number varchar(100) NOT NULL,
        is_active tinyint(1) DEFAULT 1,
        date_created datetime DEFAULT current_timestamp(),
        date_updated datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (certificate_of_cohabitation_id),
        KEY resident1_id (resident1_id),
        KEY resident2_id (resident2_id),
        CONSTRAINT certificate_of_cohabitation_ibfk_1 FOREIGN KEY (resident1_id) REFERENCES residents (resident_id) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT certificate_of_cohabitation_ibfk_2 FOREIGN KEY (resident2_id) REFERENCES residents (resident_id) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    console.log("Cohabitation table created/verified");

    // Create certificates table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        certificate_id int(11) NOT NULL AUTO_INCREMENT,
        resident_id int(11) NOT NULL,
        type enum('action','indigency','barangay_clearance') NOT NULL,
        purpose varchar(255) DEFAULT NULL,
        date_issued timestamp NOT NULL DEFAULT current_timestamp(),
        validity_months int(11) DEFAULT 6,
        issued_by varchar(255) DEFAULT 'Barangay Chairman',
        PRIMARY KEY (certificate_id),
        KEY resident_id (resident_id),
        CONSTRAINT fk_cert_resident FOREIGN KEY (resident_id) REFERENCES residents (resident_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    console.log("Certificates table created/verified");

    // Create request_records table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS request_records (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        birthday DATE NOT NULL,
        age INT NOT NULL,
        provincial_address TEXT,
        contact_no VARCHAR(20),
        civil_status ENUM('Single','Married','Widowed','Divorced','Separated') NOT NULL,
        request_reason TEXT NOT NULL,
        date_issued DATE NOT NULL,
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    console.log("Request records table created/verified");

    // Create official_signature table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS official_signature (
        signature_id INT(11) NOT NULL AUTO_INCREMENT,
        official_name VARCHAR(255) NOT NULL,
        designation VARCHAR(255) NOT NULL,
        signature_path TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (signature_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    console.log("Official signature table created/verified");

    // Add signature fields to certificate_of_action table if they don't exist
    try {
      // Check if columns exist
      const [columns] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'certificate_of_action' 
         AND COLUMN_NAME IN ('use_signature', 'signature_id')`
      );
      
      const existingColumns = columns.map(col => col.COLUMN_NAME);
      
      if (!existingColumns.includes('use_signature')) {
        await pool.query(
          `ALTER TABLE certificate_of_action 
           ADD COLUMN use_signature TINYINT(1) DEFAULT 0 AFTER transaction_number`
        );
        console.log("Added use_signature column to certificate_of_action");
      }
      
      if (!existingColumns.includes('signature_id')) {
        await pool.query(
          `ALTER TABLE certificate_of_action 
           ADD COLUMN signature_id INT(11) NULL AFTER use_signature,
           ADD KEY signature_id (signature_id),
           ADD CONSTRAINT fk_cert_action_signature 
           FOREIGN KEY (signature_id) REFERENCES official_signature (signature_id) 
           ON DELETE SET NULL ON UPDATE CASCADE`
        );
        console.log("Added signature_id column to certificate_of_action");
      }
    } catch (err) {
      // Table might not exist yet, that's okay
      console.log("Note: certificate_of_action table may not exist yet");
    }

    // Check if admin user exists
    const [existingAdmin] = await pool.query(
      "SELECT user_id FROM users WHERE username = 'admin'"
    );

    if (existingAdmin.length === 0) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash("admin123", 10);
      
      await pool.query(
        "INSERT INTO users (username, name, password, role) VALUES (?, ?, ?, ?)",
        ["admin", "System Administrator", hashedPassword, "admin"]
      );
      
      console.log("✅ Admin user created:");
      console.log("   Username: admin");
      console.log("   Password: admin123");
      console.log("   Role: admin");
    } else {
      console.log("Admin user already exists");
    }

    // Check if chairman user exists
    const [existingChairman] = await pool.query(
      "SELECT user_id FROM users WHERE username = 'chairman'"
    );

    if (existingChairman.length === 0) {
      // Create default chairman user
      const hashedPassword = await bcrypt.hash("chairman123", 10);
      
      await pool.query(
        "INSERT INTO users (username, name, password, role) VALUES (?, ?, ?, ?)",
        ["chairman", "Barangay Chairman", hashedPassword, "chairman"]
      );
      
      console.log("✅ Chairman user created:");
      console.log("   Username: chairman");
      console.log("   Password: chairman123");
      console.log("   Role: chairman");
    } else {
      console.log("Chairman user already exists");
    }

    // Check if staff user exists
    const [existingStaff] = await pool.query(
      "SELECT user_id FROM users WHERE username = 'staff'"
    );

    if (existingStaff.length === 0) {
      // Create default staff user
      const hashedPassword = await bcrypt.hash("staff123", 10);
      
      await pool.query(
        "INSERT INTO users (username, name, password, role) VALUES (?, ?, ?, ?)",
        ["staff", "Barangay Staff", hashedPassword, "staff"]
      );
      
      console.log("✅ Staff user created:");
      console.log("   Username: staff");
      console.log("   Password: staff123");
      console.log("   Role: staff");
    } else {
      console.log("Staff user already exists");
    }

    console.log("\n🎉 Database setup completed successfully!");
    console.log("\nDefault login credentials:");
    console.log("┌─────────────┬─────────────┬─────────────┬─────────────┐");
    console.log("│ Username    │ Password    │ Role        │ Access      │");
    console.log("├─────────────┼─────────────┼─────────────┼─────────────┤");
    console.log("│ admin       │ admin123    │ admin       │ Full Access │");
    console.log("│ chairman    │ chairman123 │ chairman    │ Limited     │");
    console.log("│ staff       │ staff123    │ staff       │ Basic       │");
    console.log("└─────────────┴─────────────┴─────────────┴─────────────┘");

  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
