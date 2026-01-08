-- Creates audit_logs table (run in DB)
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
