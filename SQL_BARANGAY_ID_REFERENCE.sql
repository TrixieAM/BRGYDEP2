-- ============================================================================
-- BARANGAY ID MODULE - SQL REFERENCE & EXAMPLES
-- ============================================================================

-- ============================================================================
-- 1. VERIFY EXISTING RESIDENTS TABLE
-- ============================================================================

-- Check table structure
DESC residents;

-- Count residents
SELECT COUNT(*) as total_residents FROM residents;

-- View all residents (for testing)
SELECT 
  resident_id,
  full_name,
  address,
  provincial_address,
  dob,
  age,
  civil_status,
  contact_no,
  created_at
FROM residents
ORDER BY full_name ASC;

-- ============================================================================
-- 2. OPTIONAL: CREATE ID ISSUANCE TRACKING TABLE
-- ============================================================================

-- Create tracking table (optional but recommended)
CREATE TABLE IF NOT EXISTS `barangay_id_issuance` (
  `id_issuance_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `issued_date` date DEFAULT NULL,
  `printed_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `printed_by_user_id` int(11) DEFAULT NULL,
  `id_status` enum('active','replaced','expired') DEFAULT 'active',
  `expiration_date` date DEFAULT NULL,
  `notes` text,
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_issuance_id`),
  FOREIGN KEY (`resident_id`) REFERENCES `residents`(`resident_id`) ON DELETE CASCADE,
  FOREIGN KEY (`printed_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  KEY `idx_resident_id` (`resident_id`),
  KEY `idx_issued_date` (`issued_date`),
  KEY `idx_id_status` (`id_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- 3. TRACKING QUERIES - AFTER APPLYING MIGRATION
-- ============================================================================

-- View all ID issuance records
SELECT 
  i.id_issuance_id,
  r.full_name,
  i.issued_date,
  i.printed_date,
  i.id_status,
  i.expiration_date,
  i.notes
FROM barangay_id_issuance i
JOIN residents r ON i.resident_id = r.resident_id
ORDER BY i.printed_date DESC;

-- Get active IDs
SELECT 
  r.resident_id,
  r.full_name,
  i.issued_date,
  i.expiration_date,
  i.id_status
FROM barangay_id_issuance i
JOIN residents r ON i.resident_id = r.resident_id
WHERE i.id_status = 'active'
ORDER BY r.full_name;

-- Get expired IDs
SELECT 
  r.resident_id,
  r.full_name,
  i.expiration_date,
  i.id_status,
  DATEDIFF(CURDATE(), i.expiration_date) as days_expired
FROM barangay_id_issuance i
JOIN residents r ON i.resident_id = r.resident_id
WHERE i.id_status = 'expired'
  OR (i.expiration_date IS NOT NULL AND i.expiration_date < CURDATE())
ORDER BY i.expiration_date ASC;

-- Count IDs printed per resident
SELECT 
  r.resident_id,
  r.full_name,
  COUNT(i.id_issuance_id) as times_printed,
  MAX(i.printed_date) as last_printed
FROM barangay_id_issuance i
JOIN residents r ON i.resident_id = r.resident_id
GROUP BY r.resident_id, r.full_name
ORDER BY times_printed DESC;

-- Get print history for specific resident
SELECT 
  r.full_name,
  i.printed_date,
  i.issued_date,
  i.id_status,
  i.expiration_date,
  i.notes
FROM barangay_id_issuance i
JOIN residents r ON i.resident_id = r.resident_id
WHERE r.resident_id = 1  -- Replace 1 with resident ID
ORDER BY i.printed_date DESC;

-- ============================================================================
-- 4. INSERT SAMPLE ID ISSUANCE RECORDS
-- ============================================================================

-- Insert sample issuance records
INSERT INTO barangay_id_issuance (
  resident_id,
  issued_date,
  printed_date,
  id_status,
  expiration_date,
  notes
) VALUES
(1, CURDATE(), NOW(), 'active', DATE_ADD(CURDATE(), INTERVAL 5 YEAR), 'Initial issuance'),
(6, CURDATE(), NOW(), 'active', DATE_ADD(CURDATE(), INTERVAL 5 YEAR), 'Initial issuance'),
(7, CURDATE(), NOW(), 'active', DATE_ADD(CURDATE(), INTERVAL 5 YEAR), 'Initial issuance'),
(8, CURDATE(), NOW(), 'active', DATE_ADD(CURDATE(), INTERVAL 5 YEAR), 'Initial issuance');

-- ============================================================================
-- 5. UPDATE QUERIES
-- ============================================================================

-- Mark ID as expired
UPDATE barangay_id_issuance
SET id_status = 'expired'
WHERE resident_id = 1 AND id_status = 'active';

-- Mark ID as replaced (e.g., for lost ID)
UPDATE barangay_id_issuance
SET id_status = 'replaced'
WHERE resident_id = 6 AND id_status = 'active';

-- Update expiration date for specific resident
UPDATE barangay_id_issuance
SET expiration_date = DATE_ADD(CURDATE(), INTERVAL 5 YEAR)
WHERE resident_id = 1 AND id_status = 'active';

-- Add notes to existing record
UPDATE barangay_id_issuance
SET notes = 'Card lost, new ID issued'
WHERE id_issuance_id = 1;

-- ============================================================================
-- 6. DELETE QUERIES (Use with caution)
-- ============================================================================

-- Delete old tracking records (keep only last 2 years)
DELETE FROM barangay_id_issuance
WHERE printed_date < DATE_SUB(NOW(), INTERVAL 2 YEAR);

-- Delete all issuance records for specific resident
DELETE FROM barangay_id_issuance
WHERE resident_id = 1;

-- ============================================================================
-- 7. ANALYTICS QUERIES
-- ============================================================================

-- Total IDs printed in last 30 days
SELECT COUNT(*) as ids_printed_last_30_days
FROM barangay_id_issuance
WHERE printed_date >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- IDs by status
SELECT 
  id_status,
  COUNT(*) as count
FROM barangay_id_issuance
GROUP BY id_status;

-- IDs expiring soon (within 30 days)
SELECT 
  r.resident_id,
  r.full_name,
  i.expiration_date,
  DATEDIFF(i.expiration_date, CURDATE()) as days_until_expiration
FROM barangay_id_issuance i
JOIN residents r ON i.resident_id = r.resident_id
WHERE i.id_status = 'active'
  AND i.expiration_date IS NOT NULL
  AND i.expiration_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
ORDER BY i.expiration_date ASC;

-- Monthly print activity
SELECT 
  DATE_FORMAT(printed_date, '%Y-%m') as month,
  COUNT(*) as ids_printed
FROM barangay_id_issuance
GROUP BY DATE_FORMAT(printed_date, '%Y-%m')
ORDER BY month DESC;

-- Residents with multiple active IDs (should not happen)
SELECT 
  r.resident_id,
  r.full_name,
  COUNT(i.id_issuance_id) as active_count
FROM barangay_id_issuance i
JOIN residents r ON i.resident_id = r.resident_id
WHERE i.id_status = 'active'
GROUP BY r.resident_id, r.full_name
HAVING active_count > 1;

-- ============================================================================
-- 8. MAINTENANCE QUERIES
-- ============================================================================

-- Check for orphaned records (resident deleted but ID record remains)
SELECT i.*
FROM barangay_id_issuance i
LEFT JOIN residents r ON i.resident_id = r.resident_id
WHERE r.resident_id IS NULL;

-- Fix foreign key constraint if needed
-- (Must be done carefully - ensure residents still exist)
ALTER TABLE barangay_id_issuance 
ADD CONSTRAINT fk_resident_id 
FOREIGN KEY (resident_id) REFERENCES residents(resident_id) 
ON DELETE CASCADE;

-- ============================================================================
-- 9. VERIFICATION QUERIES FOR DEBUGGING
-- ============================================================================

-- Verify residents table has data
SELECT 
  COUNT(*) as total_residents,
  MIN(resident_id) as min_id,
  MAX(resident_id) as max_id,
  COUNT(DISTINCT civil_status) as unique_statuses
FROM residents;

-- Check for residents with missing required fields
SELECT 
  resident_id,
  CONCAT_WS(', ', 
    IF(full_name IS NULL OR full_name = '', 'missing_name', NULL),
    IF(address IS NULL OR address = '', 'missing_address', NULL),
    IF(dob IS NULL, 'missing_dob', NULL),
    IF(age IS NULL, 'missing_age', NULL)
  ) as missing_fields
FROM residents
WHERE full_name IS NULL OR full_name = ''
   OR address IS NULL OR address = ''
   OR dob IS NULL
   OR age IS NULL;

-- Verify age calculation accuracy
SELECT 
  resident_id,
  full_name,
  dob,
  age,
  TIMESTAMPDIFF(YEAR, dob, CURDATE()) as calculated_age,
  IF(age = TIMESTAMPDIFF(YEAR, dob, CURDATE()), 'OK', 'MISMATCH') as age_status
FROM residents
WHERE dob IS NOT NULL
ORDER BY age_status;

-- ============================================================================
-- 10. SAMPLE DATA QUERIES
-- ============================================================================

-- Get specific resident data (as API would return)
SELECT 
  resident_id,
  full_name,
  address,
  provincial_address,
  dob,
  age,
  civil_status,
  contact_no,
  created_at
FROM residents
WHERE resident_id = 1;

-- Get all active residents with contact
SELECT 
  resident_id,
  full_name,
  address,
  contact_no
FROM residents
WHERE contact_no IS NOT NULL AND contact_no != ''
ORDER BY full_name;

-- Get residents by civil status
SELECT 
  civil_status,
  COUNT(*) as count,
  GROUP_CONCAT(full_name ORDER BY full_name) as names
FROM residents
GROUP BY civil_status
ORDER BY count DESC;

-- ============================================================================
-- END OF REFERENCE FILE
-- ============================================================================

-- Usage Instructions:
-- 1. Copy entire sections (1-10) as needed
-- 2. Modify table/column names if different in your database
-- 3. Replace example values (e.g., resident_id = 1) with actual values
-- 4. Always backup before running DELETE or UPDATE queries
-- 5. Test UPDATE queries in transaction first: START TRANSACTION; ... ROLLBACK;

-- Tips:
-- - Always include WHERE clause in UPDATE/DELETE to avoid accidents
-- - Use LIMIT 1 when testing queries
-- - Check BEFORE running on production
-- - Keep audit trail enabled if available
-- - Schedule backups before major operations

-- Contact: Database Administrator or Development Team
-- Last Updated: January 17, 2026
