-- Optional: Create table to track Barangay ID issuance and print history
-- Run this migration to track when IDs are printed or issued

CREATE TABLE IF NOT EXISTS `barangay_id_issuance` (
  `id_issuance_id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `resident_id` int(11) NOT NULL,
  `issued_date` date DEFAULT CURRENT_DATE,
  `printed_date` timestamp DEFAULT CURRENT_TIMESTAMP,
  `printed_by_user_id` int(11) DEFAULT NULL,
  `id_status` enum('active', 'replaced', 'expired') DEFAULT 'active',
  `expiration_date` date,
  `notes` text,
  `date_created` timestamp DEFAULT CURRENT_TIMESTAMP,
  `date_updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`resident_id`) REFERENCES `residents`(`resident_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Index for faster queries
CREATE INDEX idx_resident_id ON barangay_id_issuance(`resident_id`);
CREATE INDEX idx_issued_date ON barangay_id_issuance(`issued_date`);
CREATE INDEX idx_id_status ON barangay_id_issuance(`id_status`);
