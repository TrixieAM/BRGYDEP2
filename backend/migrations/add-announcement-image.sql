-- Adds optional image_path to announcements table for announcement pictures
ALTER TABLE `announcements`
  ADD COLUMN IF NOT EXISTS `image_path` varchar(255) DEFAULT NULL AFTER `content`;

