-- Migration: Create settings_pages table if it doesn't exist
-- This table stores dynamic content pages like Mission & Vision, About, etc.
-- Supports JSON content storage for flexible data structure

-- Create table if it doesn't exist
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

-- Insert default pages if they don't exist
INSERT IGNORE INTO `settings_pages` (`slug`, `title`, `content`, `is_active`) VALUES
('mission-vision', 'Mission & Vision', '{"mission":"","vision":""}', 1),
('about', 'About Barangay 145', '{"description":"","history":"","images":[]}', 1),
('security-privacy', 'Security & Privacy', '{}', 1);
