-- Alternative database bootstrap for Barangay 145
-- Run this in MySQL/MariaDB to create the required tables and seed defaults.
-- Uses IF NOT EXISTS / INSERT IGNORE so it can be re-run safely.

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff','chairman') DEFAULT 'staff',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `residents` (
  `resident_id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(150) NOT NULL,
  `address` varchar(255) NOT NULL,
  `provincial_address` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Separated','Divorced') DEFAULT 'Single',
  `contact_no` varchar(20) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT 'Male',
  `sss_no` varchar(50) DEFAULT NULL,
  `tin_no` varchar(50) DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `emergency_name` varchar(255) DEFAULT NULL,
  `emergency_address` text DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `id_no` varchar(100) DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `photo` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`resident_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `official_signature` (
  `signature_id` int(11) NOT NULL AUTO_INCREMENT,
  `official_name` varchar(255) NOT NULL,
  `designation` varchar(255) NOT NULL,
  `signature_path` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`signature_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `barangay_clearance` (
  `barangay_clearance_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `transactionNum` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `provincial_address` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Divorced','Separated') NOT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `request_reason` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`barangay_clearance_id`),
  KEY `resident_id` (`resident_id`),
  KEY `signature_id` (`signature_id`),
  CONSTRAINT `barangay_clearance_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `barangay_clearance_signature_fk` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `bhert_certificate_normal` (
  `bhert_certificate_normal_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `requestor` varchar(255) NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `date_issued` date NOT NULL,
  `transaction_number` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` datetime DEFAULT current_timestamp(),
  `date_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `secretary_signature_id` int(11) DEFAULT NULL,
  `captain_signature_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`bhert_certificate_normal_id`),
  KEY `resident_id` (`resident_id`),
  KEY `secretary_signature_id` (`secretary_signature_id`),
  KEY `captain_signature_id` (`captain_signature_id`),
  CONSTRAINT `bhert_certificate_normal_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `bhert_certificate_normal_secretary_fk` FOREIGN KEY (`secretary_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bhert_certificate_normal_captain_fk` FOREIGN KEY (`captain_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `bhert_certificate_positive` (
  `bhert_certificate_positive_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `request_reason` text NOT NULL,
  `date_issued` date NOT NULL,
  `transaction_number` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` datetime DEFAULT current_timestamp(),
  `date_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `secretary_signature_id` int(11) DEFAULT NULL,
  `captain_signature_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`bhert_certificate_positive_id`),
  KEY `resident_id` (`resident_id`),
  KEY `secretary_signature_id` (`secretary_signature_id`),
  KEY `captain_signature_id` (`captain_signature_id`),
  CONSTRAINT `bhert_certificate_positive_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `bhert_certificate_positive_secretary_fk` FOREIGN KEY (`secretary_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bhert_certificate_positive_captain_fk` FOREIGN KEY (`captain_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `business_clearance` (
  `business_clearance_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `nature_of_business` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `date_issued` date NOT NULL,
  `date_expired` date NOT NULL,
  `remarks` text DEFAULT NULL,
  `request_reason` text NOT NULL,
  `transaction_number` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` datetime DEFAULT current_timestamp(),
  `date_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  `control_no` varchar(50) DEFAULT NULL,
  `prepared_by_name` varchar(255) DEFAULT NULL,
  `prepared_by_position` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`business_clearance_id`),
  KEY `resident_id` (`resident_id`),
  KEY `signature_id` (`signature_id`),
  KEY `idx_business_clearance_control_no` (`control_no`),
  CONSTRAINT `business_clearance_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `business_clearance_signature_fk` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `cash_assistance` (
  `cash_assistance_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `since_year` year(4) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `request_reason` text DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` datetime DEFAULT current_timestamp(),
  `date_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `secretary_signature_id` int(11) DEFAULT NULL,
  `captain_signature_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`cash_assistance_id`),
  KEY `resident_id` (`resident_id`),
  KEY `secretary_signature_id` (`secretary_signature_id`),
  KEY `captain_signature_id` (`captain_signature_id`),
  CONSTRAINT `cash_assistance_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cash_assistance_secretary_fk` FOREIGN KEY (`secretary_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cash_assistance_captain_fk` FOREIGN KEY (`captain_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `certificates` (
  `certificate_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `certificate_type` varchar(100) NOT NULL,
  `reason` text DEFAULT NULL,
  `validity_period` varchar(50) DEFAULT NULL,
  `date_issued` date NOT NULL,
  `timestap` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`certificate_id`),
  KEY `resident_id` (`resident_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `certificate_of_action` (
  `certificate_of_action_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `complainant_name` varchar(255) NOT NULL,
  `respondent_name` varchar(255) NOT NULL,
  `barangay_case_no` varchar(50) NOT NULL,
  `request_reason` text NOT NULL,
  `filed_date` date NOT NULL,
  `date_issued` date NOT NULL,
  `transaction_number` varchar(100) NOT NULL,
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` datetime DEFAULT current_timestamp(),
  `date_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`certificate_of_action_id`),
  KEY `resident_id` (`resident_id`),
  KEY `signature_id` (`signature_id`),
  CONSTRAINT `certificate_of_action_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `certificate_of_action_signature_fk` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `certificate_of_cohabitation` (
  `certificate_of_cohabitation_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident1_id` int(11) NOT NULL,
  `resident2_id` int(11) NOT NULL,
  `full_name1` varchar(255) NOT NULL,
  `dob1` date NOT NULL,
  `full_name2` varchar(255) NOT NULL,
  `dob2` date NOT NULL,
  `address` varchar(255) NOT NULL,
  `date_started` year(4) NOT NULL,
  `date_issued` date NOT NULL,
  `witness1_name` varchar(255) DEFAULT NULL,
  `witness2_name` varchar(255) DEFAULT NULL,
  `transaction_number` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` datetime DEFAULT current_timestamp(),
  `date_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `secretary_signature_id` int(11) DEFAULT NULL,
  `captain_signature_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`certificate_of_cohabitation_id`),
  KEY `resident1_id` (`resident1_id`),
  KEY `resident2_id` (`resident2_id`),
  KEY `secretary_signature_id` (`secretary_signature_id`),
  KEY `captain_signature_id` (`captain_signature_id`),
  CONSTRAINT `certificate_of_cohabitation_resident1_fk` FOREIGN KEY (`resident1_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `certificate_of_cohabitation_resident2_fk` FOREIGN KEY (`resident2_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `certificate_of_cohabitation_secretary_fk` FOREIGN KEY (`secretary_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `certificate_of_cohabitation_captain_fk` FOREIGN KEY (`captain_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `certificate_of_good_moral` (
  `certificate_of_good_moral_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `civil_status` varchar(50) DEFAULT NULL,
  `date_issued` date NOT NULL,
  `date_expired` date NOT NULL,
  `remarks` text DEFAULT NULL,
  `request_reason` varchar(255) DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `control_no` varchar(50) DEFAULT NULL,
  `prepared_by_name` varchar(255) DEFAULT NULL,
  `prepared_by_position` varchar(255) DEFAULT NULL,
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`certificate_of_good_moral_id`),
  KEY `idx_resident_id` (`resident_id`),
  KEY `idx_transaction_number` (`transaction_number`),
  KEY `idx_control_no` (`control_no`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_date_created` (`date_created`),
  KEY `signature_id` (`signature_id`),
  CONSTRAINT `certificate_of_good_moral_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `certificate_of_good_moral_signature_fk` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `certificate_of_low_income` (
  `certificate_of_low_income_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `source_of_income` varchar(255) DEFAULT NULL,
  `income_amount` varchar(100) DEFAULT NULL,
  `civil_status` varchar(50) DEFAULT NULL,
  `date_issued` date NOT NULL,
  `date_expired` date DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `request_reason` text DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `control_no` varchar(50) DEFAULT NULL,
  `prepared_by_name` varchar(255) DEFAULT NULL,
  `prepared_by_position` varchar(255) DEFAULT NULL,
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`certificate_of_low_income_id`),
  KEY `idx_resident_id` (`resident_id`),
  KEY `idx_transaction_number` (`transaction_number`),
  KEY `idx_control_no` (`control_no`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_date_created` (`date_created`),
  KEY `signature_id` (`signature_id`),
  CONSTRAINT `certificate_of_low_income_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `certificate_of_low_income_signature_fk` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `certificate_of_residency` (
  `certificate_of_residency_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `transactionNum` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `provincial_address` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Divorced','Separated') NOT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `request_reason` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  `control_no` varchar(50) DEFAULT NULL,
  `prepared_by_name` varchar(255) DEFAULT NULL,
  `prepared_by_position` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`certificate_of_residency_id`),
  KEY `resident_id` (`resident_id`),
  KEY `signature_id` (`signature_id`),
  KEY `idx_control_no` (`control_no`),
  CONSTRAINT `certificate_of_residency_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `certificate_of_residency_signature_fk` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `financial_assistance` (
  `financial_assistance_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `purpose` text DEFAULT NULL,
  `monthly_income` decimal(12,2) DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `secretary_signature_id` int(11) DEFAULT NULL,
  `captain_signature_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`financial_assistance_id`),
  KEY `resident_id` (`resident_id`),
  KEY `secretary_signature_id` (`secretary_signature_id`),
  KEY `captain_signature_id` (`captain_signature_id`),
  CONSTRAINT `financial_assistance_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `financial_assistance_secretary_fk` FOREIGN KEY (`secretary_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `financial_assistance_captain_fk` FOREIGN KEY (`captain_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `indigency` (
  `indigency_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `transactionNum` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `barangay` varchar(255) DEFAULT NULL,
  `provincial_address` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Divorced','Separated') NOT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `source_of_income` varchar(255) DEFAULT NULL,
  `monthly_income` decimal(12,2) DEFAULT NULL,
  `request_reason` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  `control_no` varchar(50) DEFAULT NULL,
  `prepared_by_name` varchar(255) DEFAULT NULL,
  `prepared_by_position` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`indigency_id`),
  KEY `resident_id` (`resident_id`),
  KEY `signature_id` (`signature_id`),
  KEY `idx_indigency_control_no` (`control_no`),
  CONSTRAINT `indigency_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `indigency_signature_fk` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `oath_job` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `resident_id` (`resident_id`),
  KEY `signature_id` (`signature_id`),
  CONSTRAINT `oath_job_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `oath_job_signature_fk` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `permit_to_travel` (
  `permit_to_travel_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `transactionNum` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `provincial_address` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Divorced','Separated') NOT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `request_reason` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`permit_to_travel_id`),
  KEY `resident_id` (`resident_id`),
  KEY `signature_id` (`signature_id`),
  CONSTRAINT `permit_to_travel_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `permit_to_travel_signature_fk` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_permission_id` int(11) NOT NULL AUTO_INCREMENT,
  `role` enum('admin','staff','chairman') NOT NULL,
  `permission` varchar(150) NOT NULL,
  `allowed` tinyint(1) NOT NULL DEFAULT 1,
  `updated_by` int(11) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`role_permission_id`),
  UNIQUE KEY `uniq_role_permission` (`role`,`permission`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `settings_pages` (
  `page_id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) NOT NULL,
  `title` varchar(150) NOT NULL,
  `content` text NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `updated_by` int(11) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`page_id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `settings_pages_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `security_settings` (
  `security_settings_id` int(11) NOT NULL AUTO_INCREMENT,
  `mfa_enabled` tinyint(1) DEFAULT 0,
  `twofa_optional` tinyint(1) DEFAULT 1,
  `data_retention_days` int(11) DEFAULT NULL,
  `encryption_at_rest` tinyint(1) DEFAULT 1,
  `encryption_in_transit` tinyint(1) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`security_settings_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `announcements` (
  `announcement_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `announcement_type` varchar(100) DEFAULT 'Notice',
  `date_posted` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`announcement_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_announcements_active` (`is_active`),
  KEY `idx_announcements_date_posted` (`date_posted`),
  CONSTRAINT `announcements_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `events` (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_name` varchar(255) NOT NULL,
  `event_description` text DEFAULT NULL,
  `event_date` date NOT NULL,
  `event_time` time DEFAULT NULL,
  `event_location` varchar(255) DEFAULT 'Barangay Hall',
  `event_type` varchar(100) DEFAULT 'Community',
  `created_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`event_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_events_active` (`is_active`),
  KEY `idx_events_date` (`event_date`),
  CONSTRAINT `events_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `audit_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(150) NOT NULL,
  `entity_type` varchar(150) DEFAULT NULL,
  `entity_id` varchar(150) DEFAULT NULL,
  `metadata` text DEFAULT NULL,
  `ip_address` varchar(64) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`audit_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `faqs` (
  `faq_id` int(11) NOT NULL AUTO_INCREMENT,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `updated_by` int(11) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`faq_id`),
  KEY `updated_by` (`updated_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `request_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `birthday` date NOT NULL,
  `age` int(11) NOT NULL,
  `provincial_address` text DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Divorced','Separated') NOT NULL,
  `request_reason` text NOT NULL,
  `date_issued` date NOT NULL,
  `date_created` timestamp DEFAULT current_timestamp(),
  `date_updated` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` boolean DEFAULT TRUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `barangay_officials` (
  `official_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `position_order` int(11) NOT NULL DEFAULT 0,
  `image_path` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`official_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_position_order` (`position_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `solo_parent_records` (
  `solo_parent_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `transactionNum` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `residents_since_year` varchar(10) DEFAULT NULL,
  `unwed_since_year` varchar(10) DEFAULT NULL,
  `employment_status` enum('Employed','Unemployed','Self-Employed','Business Owner','Freelancer','Contract Worker','Others') DEFAULT NULL,
  `employment_remarks` varchar(255) DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `secretary_signature_id` int(11) DEFAULT NULL,
  `captain_signature_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`solo_parent_id`),
  KEY `resident_id` (`resident_id`),
  KEY `secretary_signature_id` (`secretary_signature_id`),
  KEY `captain_signature_id` (`captain_signature_id`),
  CONSTRAINT `solo_parent_records_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `solo_parent_records_secretary_fk` FOREIGN KEY (`secretary_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `solo_parent_records_captain_fk` FOREIGN KEY (`captain_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `solo_parent_children` (
  `child_id` int(11) NOT NULL AUTO_INCREMENT,
  `solo_parent_id` int(11) NOT NULL,
  `child_name` varchar(255) NOT NULL,
  `child_age` varchar(10) DEFAULT NULL,
  `child_birthday` date DEFAULT NULL,
  `child_level` enum('Nursery','Kindergarten','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12','College 1st Year','College 2nd Year','College 3rd Year','College 4th Year','College 5th Year','Graduate School','Others') DEFAULT NULL,
  `child_level_remarks` varchar(255) DEFAULT NULL,
  `child_gender` enum('Male','Female','Others') DEFAULT NULL,
  `child_relationship` enum('Son','Daughter','Others') DEFAULT NULL,
  `child_relationship_remarks` varchar(255) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`child_id`),
  KEY `solo_parent_id` (`solo_parent_id`),
  CONSTRAINT `solo_parent_children_parent_fk` FOREIGN KEY (`solo_parent_id`) REFERENCES `solo_parent_records` (`solo_parent_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `settings_pages` (`slug`, `title`, `content`, `is_active`) VALUES
('mission-vision', 'Mission & Vision', '{"mission":"","vision":""}', 1),
('about', 'About Barangay 145', '{"description":"","history":"","images":[]}', 1),
('security-privacy', 'Security & Privacy', '{}', 1);

INSERT IGNORE INTO `security_settings` (`security_settings_id`, `mfa_enabled`, `twofa_optional`, `data_retention_days`, `encryption_at_rest`, `encryption_in_transit`, `notes`, `updated_by`) VALUES
(1, 0, 1, NULL, 1, 1, NULL, NULL);

INSERT IGNORE INTO `users` (`username`, `name`, `password`, `role`) VALUES
('admin', 'System Administrator', '$2a$10$LB8HgWCLmuBvQQBvAK60SuOoFAkpLW3kjC3vK5lOFa2UwsqqKrGMi', 'admin'),
('chairman', 'Barangay Chairman', '$2a$10$3vUayoiyJkozCh3cY.ScFeu0dh3iX7Af3aNjsquRRkrGTAvLrLnVq', 'chairman'),
('staff', 'Barangay Staff', '$2a$10$eexvv293dPnAixgTr9P8Kew3dVn8og1xNt38XiJWnXb9mml4YZMX.', 'staff');

ALTER TABLE `residents`
  ADD COLUMN IF NOT EXISTS `gender` enum('Male','Female','Other') DEFAULT 'Male' AFTER `contact_no`,
  ADD COLUMN IF NOT EXISTS `sss_no` varchar(50) DEFAULT NULL AFTER `gender`,
  ADD COLUMN IF NOT EXISTS `tin_no` varchar(50) DEFAULT NULL AFTER `sss_no`,
  ADD COLUMN IF NOT EXISTS `expiration_date` date DEFAULT NULL AFTER `tin_no`,
  ADD COLUMN IF NOT EXISTS `emergency_name` varchar(255) DEFAULT NULL AFTER `expiration_date`,
  ADD COLUMN IF NOT EXISTS `emergency_address` text DEFAULT NULL AFTER `emergency_name`,
  ADD COLUMN IF NOT EXISTS `emergency_phone` varchar(20) DEFAULT NULL AFTER `emergency_address`,
  ADD COLUMN IF NOT EXISTS `id_no` varchar(100) DEFAULT NULL AFTER `emergency_phone`,
  ADD COLUMN IF NOT EXISTS `date_issued` date DEFAULT NULL AFTER `id_no`,
  ADD COLUMN IF NOT EXISTS `photo` longtext DEFAULT NULL AFTER `date_issued`;

-- Optional compatibility ALTERs for databases that already have the base tables.
ALTER TABLE `certificate_of_action`
  ADD COLUMN IF NOT EXISTS `use_signature` TINYINT(1) DEFAULT 0 AFTER `transaction_number`,
  ADD COLUMN IF NOT EXISTS `signature_id` INT(11) NULL AFTER `use_signature`;

ALTER TABLE `certificate_of_residency`
  ADD COLUMN IF NOT EXISTS `control_no` VARCHAR(50) NULL AFTER `transaction_number`,
  ADD COLUMN IF NOT EXISTS `prepared_by_name` VARCHAR(255) NULL AFTER `control_no`,
  ADD COLUMN IF NOT EXISTS `prepared_by_position` VARCHAR(255) NULL AFTER `prepared_by_name`;

ALTER TABLE `indigency`
  ADD COLUMN IF NOT EXISTS `barangay` VARCHAR(255) NULL AFTER `address`,
  ADD COLUMN IF NOT EXISTS `source_of_income` VARCHAR(255) NULL AFTER `contact_no`,
  ADD COLUMN IF NOT EXISTS `monthly_income` DECIMAL(12,2) NULL AFTER `source_of_income`,
  ADD COLUMN IF NOT EXISTS `control_no` VARCHAR(50) NULL AFTER `transaction_number`,
  ADD COLUMN IF NOT EXISTS `prepared_by_name` VARCHAR(255) NULL AFTER `control_no`,
  ADD COLUMN IF NOT EXISTS `prepared_by_position` VARCHAR(255) NULL AFTER `prepared_by_name`;

ALTER TABLE `business_clearance`
  ADD COLUMN IF NOT EXISTS `control_no` VARCHAR(50) NULL AFTER `transaction_number`,
  ADD COLUMN IF NOT EXISTS `prepared_by_name` VARCHAR(255) NULL AFTER `control_no`,
  ADD COLUMN IF NOT EXISTS `prepared_by_position` VARCHAR(255) NULL AFTER `prepared_by_name`;

COMMIT;
CREATE DATABASE IF NOT EXISTS `brgy145`;
USE `brgy145`;

CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff','chairman') DEFAULT 'staff',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `residents` (
  `resident_id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(150) NOT NULL,
  `address` varchar(255) NOT NULL,
  `provincial_address` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Separated','Divorced') DEFAULT 'Single',
  `contact_no` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`resident_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `official_signature` (
  `signature_id` int(11) NOT NULL AUTO_INCREMENT,
  `official_name` varchar(255) NOT NULL,
  `designation` varchar(255) NOT NULL,
  `signature_path` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`signature_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `barangay_clearance` (
  `barangay_clearance_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `transactionNum` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `provincial_address` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Divorced','Separated') NOT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `request_reason` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`barangay_clearance_id`),
  KEY `resident_id` (`resident_id`),
  KEY `signature_id` (`signature_id`),
  CONSTRAINT `barangay_clearance_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `barangay_clearance_signature_fk` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `bhert_certificate_normal` (
  `bhert_certificate_normal_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `requestor` varchar(255) NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `date_issued` date NOT NULL,
  `transaction_number` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` datetime DEFAULT current_timestamp(),
  `date_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `secretary_signature_id` int(11) DEFAULT NULL,
  `captain_signature_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`bhert_certificate_normal_id`),
  KEY `resident_id` (`resident_id`),
  KEY `secretary_signature_id` (`secretary_signature_id`),
  KEY `captain_signature_id` (`captain_signature_id`),
  CONSTRAINT `bhert_certificate_normal_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `bhert_certificate_normal_secretary_fk` FOREIGN KEY (`secretary_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bhert_certificate_normal_captain_fk` FOREIGN KEY (`captain_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `bhert_certificate_positive` (
  `bhert_certificate_positive_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `request_reason` text NOT NULL,
  `date_issued` date NOT NULL,
  `transaction_number` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` datetime DEFAULT current_timestamp(),
  `date_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `secretary_signature_id` int(11) DEFAULT NULL,
  `captain_signature_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`bhert_certificate_positive_id`),
  KEY `resident_id` (`resident_id`),
  KEY `secretary_signature_id` (`secretary_signature_id`),
  KEY `captain_signature_id` (`captain_signature_id`),
  CONSTRAINT `bhert_certificate_positive_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `bhert_certificate_positive_secretary_fk` FOREIGN KEY (`secretary_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bhert_certificate_positive_captain_fk` FOREIGN KEY (`captain_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `business_clearance` (
  `business_clearance_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `nature_of_business` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `date_issued` date NOT NULL,
  `date_expired` date NOT NULL,
  `remarks` text DEFAULT NULL,
  `request_reason` text NOT NULL,
  `transaction_number` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` datetime DEFAULT current_timestamp(),
  `date_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  `control_no` varchar(50) DEFAULT NULL,
  `prepared_by_name` varchar(255) DEFAULT NULL,
  `prepared_by_position` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`business_clearance_id`),
  KEY `resident_id` (`resident_id`),
  KEY `signature_id` (`signature_id`),
  KEY `idx_business_clearance_control_no` (`control_no`),
  CONSTRAINT `business_clearance_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `business_clearance_signature_fk` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `cash_assistance` (
  `cash_assistance_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `since_year` year(4) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `request_reason` text DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` datetime DEFAULT current_timestamp(),
  `date_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `secretary_signature_id` int(11) DEFAULT NULL,
  `captain_signature_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`cash_assistance_id`),
  KEY `resident_id` (`resident_id`),
  KEY `secretary_signature_id` (`secretary_signature_id`),
  KEY `captain_signature_id` (`captain_signature_id`),
  CONSTRAINT `cash_assistance_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cash_assistance_secretary_fk` FOREIGN KEY (`secretary_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cash_assistance_captain_fk` FOREIGN KEY (`captain_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `certificates` (
  `certificate_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `certificate_type` varchar(100) NOT NULL,
  `reason` text DEFAULT NULL,
  `validity_period` varchar(50) DEFAULT NULL,
  `date_issued` date NOT NULL,
  `timestap` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`certificate_id`),
  KEY `resident_id` (`resident_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `certificate_of_action` (
  `certificate_of_action_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `complainant_name` varchar(255) NOT NULL,
  `respondent_name` varchar(255) NOT NULL,
  `barangay_case_no` varchar(50) NOT NULL,
  `request_reason` text NOT NULL,
  `filed_date` date NOT NULL,
  `date_issued` date NOT NULL,
  `transaction_number` varchar(100) NOT NULL,
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` datetime DEFAULT current_timestamp(),
  `date_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`certificate_of_action_id`),
  KEY `resident_id` (`resident_id`),
  KEY `signature_id` (`signature_id`),
  CONSTRAINT `certificate_of_action_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `certificate_of_action_signature_fk` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `certificate_of_cohabitation` (
  `certificate_of_cohabitation_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident1_id` int(11) NOT NULL,
  `resident2_id` int(11) NOT NULL,
  `full_name1` varchar(255) NOT NULL,
  `dob1` date NOT NULL,
  `full_name2` varchar(255) NOT NULL,
  `dob2` date NOT NULL,
  `address` varchar(255) NOT NULL,
  `date_started` year(4) NOT NULL,
  `date_issued` date NOT NULL,
  `witness1_name` varchar(255) DEFAULT NULL,
  `witness2_name` varchar(255) DEFAULT NULL,
  `transaction_number` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` datetime DEFAULT current_timestamp(),
  `date_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `secretary_signature_id` int(11) DEFAULT NULL,
  `captain_signature_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`certificate_of_cohabitation_id`),
  KEY `resident1_id` (`resident1_id`),
  KEY `resident2_id` (`resident2_id`),
  KEY `secretary_signature_id` (`secretary_signature_id`),
  KEY `captain_signature_id` (`captain_signature_id`),
  CONSTRAINT `certificate_of_cohabitation_resident1_fk` FOREIGN KEY (`resident1_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `certificate_of_cohabitation_resident2_fk` FOREIGN KEY (`resident2_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `certificate_of_cohabitation_secretary_fk` FOREIGN KEY (`secretary_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `certificate_of_cohabitation_captain_fk` FOREIGN KEY (`captain_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `certificate_of_good_moral` (
  `certificate_of_good_moral_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `civil_status` varchar(50) DEFAULT NULL,
  `date_issued` date NOT NULL,
  `date_expired` date NOT NULL,
  `remarks` text DEFAULT NULL,
  `request_reason` varchar(255) DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `control_no` varchar(50) DEFAULT NULL,
  `prepared_by_name` varchar(255) DEFAULT NULL,
  `prepared_by_position` varchar(255) DEFAULT NULL,
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`certificate_of_good_moral_id`),
  KEY `idx_resident_id` (`resident_id`),
  KEY `idx_transaction_number` (`transaction_number`),
  KEY `idx_control_no` (`control_no`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_date_created` (`date_created`),
  KEY `signature_id` (`signature_id`),
  CONSTRAINT `certificate_of_good_moral_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `certificate_of_good_moral_signature_fk` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `certificate_of_low_income` (
  `certificate_of_low_income_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `source_of_income` varchar(255) DEFAULT NULL,
  `income_amount` varchar(100) DEFAULT NULL,
  `civil_status` varchar(50) DEFAULT NULL,
  `date_issued` date NOT NULL,
  `date_expired` date DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `request_reason` text DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `control_no` varchar(50) DEFAULT NULL,
  `prepared_by_name` varchar(255) DEFAULT NULL,
  `prepared_by_position` varchar(255) DEFAULT NULL,
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`certificate_of_low_income_id`),
  KEY `idx_resident_id` (`resident_id`),
  KEY `idx_transaction_number` (`transaction_number`),
  KEY `idx_control_no` (`control_no`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_date_created` (`date_created`),
  KEY `signature_id` (`signature_id`),
  CONSTRAINT `certificate_of_low_income_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `certificate_of_low_income_signature_fk` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `certificate_of_residency` (
  `certificate_of_residency_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `transactionNum` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `provincial_address` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Divorced','Separated') NOT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `request_reason` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  `control_no` varchar(50) DEFAULT NULL,
  `prepared_by_name` varchar(255) DEFAULT NULL,
  `prepared_by_position` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`certificate_of_residency_id`),
  KEY `resident_id` (`resident_id`),
  KEY `signature_id` (`signature_id`),
  KEY `idx_control_no` (`control_no`),
  CONSTRAINT `certificate_of_residency_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `certificate_of_residency_signature_fk` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `financial_assistance` (
  `financial_assistance_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `purpose` text DEFAULT NULL,
  `monthly_income` decimal(12,2) DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `secretary_signature_id` int(11) DEFAULT NULL,
  `captain_signature_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`financial_assistance_id`),
  KEY `resident_id` (`resident_id`),
  KEY `secretary_signature_id` (`secretary_signature_id`),
  KEY `captain_signature_id` (`captain_signature_id`),
  CONSTRAINT `financial_assistance_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `financial_assistance_secretary_fk` FOREIGN KEY (`secretary_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `financial_assistance_captain_fk` FOREIGN KEY (`captain_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `indigency` (
  `indigency_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `transactionNum` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `barangay` varchar(255) DEFAULT NULL,
  `provincial_address` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Divorced','Separated') NOT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `source_of_income` varchar(255) DEFAULT NULL,
  `monthly_income` decimal(12,2) DEFAULT NULL,
  `request_reason` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  `control_no` varchar(50) DEFAULT NULL,
  `prepared_by_name` varchar(255) DEFAULT NULL,
  `prepared_by_position` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`indigency_id`),
  KEY `resident_id` (`resident_id`),
  KEY `signature_id` (`signature_id`),
  KEY `idx_indigency_control_no` (`control_no`),
  CONSTRAINT `indigency_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `indigency_signature_fk` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `oath_job` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `resident_id` (`resident_id`),
  KEY `signature_id` (`signature_id`),
  CONSTRAINT `oath_job_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `oath_job_signature_fk` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `permit_to_travel` (
  `permit_to_travel_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `transactionNum` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `provincial_address` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Divorced','Separated') NOT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `request_reason` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `signature_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`permit_to_travel_id`),
  KEY `resident_id` (`resident_id`),
  KEY `signature_id` (`signature_id`),
  CONSTRAINT `permit_to_travel_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `permit_to_travel_signature_fk` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_permission_id` int(11) NOT NULL AUTO_INCREMENT,
  `role` enum('admin','staff','chairman') NOT NULL,
  `permission` varchar(150) NOT NULL,
  `allowed` tinyint(1) NOT NULL DEFAULT 1,
  `updated_by` int(11) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`role_permission_id`),
  UNIQUE KEY `uniq_role_permission` (`role`, `permission`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `role_permissions_updated_by_fk` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `settings_pages` (
  `page_id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) NOT NULL,
  `title` varchar(150) NOT NULL,
  `content` text NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `updated_by` int(11) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`page_id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `settings_pages_updated_by_fk` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `security_settings` (
  `security_settings_id` int(11) NOT NULL AUTO_INCREMENT,
  `mfa_enabled` tinyint(1) DEFAULT 0,
  `twofa_optional` tinyint(1) DEFAULT 1,
  `data_retention_days` int(11) DEFAULT NULL,
  `encryption_at_rest` tinyint(1) DEFAULT 1,
  `encryption_in_transit` tinyint(1) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`security_settings_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `announcements` (
  `announcement_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `announcement_type` varchar(100) DEFAULT 'Notice',
  `date_posted` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`announcement_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_announcements_active` (`is_active`),
  KEY `idx_announcements_date_posted` (`date_posted`),
  CONSTRAINT `announcements_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `events` (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_name` varchar(255) NOT NULL,
  `event_description` text DEFAULT NULL,
  `event_date` date NOT NULL,
  `event_time` time DEFAULT NULL,
  `event_location` varchar(255) DEFAULT 'Barangay Hall',
  `event_type` varchar(100) DEFAULT 'Community',
  `created_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`event_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_events_active` (`is_active`),
  KEY `idx_events_date` (`event_date`),
  CONSTRAINT `events_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `audit_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(150) NOT NULL,
  `entity_type` varchar(150) DEFAULT NULL,
  `entity_id` varchar(150) DEFAULT NULL,
  `metadata` text DEFAULT NULL,
  `ip_address` varchar(64) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`audit_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `faqs` (
  `faq_id` int(11) NOT NULL AUTO_INCREMENT,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `updated_by` int(11) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`faq_id`),
  KEY `updated_by` (`updated_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `request_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `birthday` date NOT NULL,
  `age` int(11) NOT NULL,
  `provincial_address` text DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Divorced','Separated') NOT NULL,
  `request_reason` text NOT NULL,
  `date_issued` date NOT NULL,
  `date_created` timestamp NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `barangay_officials` (
  `official_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `position_order` int(11) NOT NULL DEFAULT 0,
  `image_path` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`official_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_position_order` (`position_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `solo_parent_records` (
  `solo_parent_id` int(11) NOT NULL AUTO_INCREMENT,
  `resident_id` int(11) NOT NULL,
  `transactionNum` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `residents_since_year` varchar(10) DEFAULT NULL,
  `unwed_since_year` varchar(10) DEFAULT NULL,
  `employment_status` enum('Employed','Unemployed','Self-Employed','Business Owner','Freelancer','Contract Worker','Others') DEFAULT NULL,
  `employment_remarks` varchar(255) DEFAULT NULL,
  `date_issued` date DEFAULT NULL,
  `transaction_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `use_signature` tinyint(1) DEFAULT 0,
  `secretary_signature_id` int(11) DEFAULT NULL,
  `captain_signature_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`solo_parent_id`),
  KEY `resident_id` (`resident_id`),
  KEY `secretary_signature_id` (`secretary_signature_id`),
  KEY `captain_signature_id` (`captain_signature_id`),
  CONSTRAINT `solo_parent_records_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `solo_parent_records_secretary_fk` FOREIGN KEY (`secretary_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `solo_parent_records_captain_fk` FOREIGN KEY (`captain_signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `solo_parent_children` (
  `child_id` int(11) NOT NULL AUTO_INCREMENT,
  `solo_parent_id` int(11) NOT NULL,
  `child_name` varchar(255) NOT NULL,
  `child_age` varchar(10) DEFAULT NULL,
  `child_birthday` date DEFAULT NULL,
  `child_level` enum('Nursery','Kindergarten','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12','College 1st Year','College 2nd Year','College 3rd Year','College 4th Year','College 5th Year','Graduate School','Others') DEFAULT NULL,
  `child_level_remarks` varchar(255) DEFAULT NULL,
  `child_gender` enum('Male','Female','Others') DEFAULT NULL,
  `child_relationship` enum('Son','Daughter','Others') DEFAULT NULL,
  `child_relationship_remarks` varchar(255) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`child_id`),
  KEY `solo_parent_id` (`solo_parent_id`),
  CONSTRAINT `solo_parent_children_parent_fk` FOREIGN KEY (`solo_parent_id`) REFERENCES `solo_parent_records` (`solo_parent_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `settings_pages` (`slug`, `title`, `content`, `is_active`) VALUES
('mission-vision', 'Mission & Vision', '{"mission":"","vision":""}', 1),
('about', 'About Barangay 145', '{"description":"","history":"","images":[]}', 1),
('security-privacy', 'Security & Privacy', '{}', 1);

INSERT IGNORE INTO `security_settings` (`security_settings_id`, `mfa_enabled`, `twofa_optional`, `data_retention_days`, `encryption_at_rest`, `encryption_in_transit`, `notes`, `updated_by`) VALUES
(1, 0, 1, NULL, 1, 1, NULL, NULL);

INSERT IGNORE INTO `users` (`user_id`, `username`, `name`, `password`, `role`, `created_at`) VALUES
(1, 'admin', 'System Administrator', '$2a$10$LB8HgWCLmuBvQQBvAK60SuOoFAkpLW3kjC3vK5lOFa2UwsqqKrGMi', 'admin', '2025-09-22 04:37:24'),
(2, 'chairman', 'Barangay Chairman', '$2a$10$3vUayoiyJkozCh3cY.ScFeu0dh3iX7Af3aNjsquRRkrGTAvLrLnVq', 'chairman', '2025-09-22 04:37:24'),
(3, 'staff', 'Barangay Staff', '$2a$10$eexvv293dPnAixgTr9P8Kew3dVn8og1xNt38XiJWnXb9mml4YZMX.', 'staff', '2025-09-22 04:37:24');
