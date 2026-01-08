-- Creates role_permissions table (run in DB)
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
