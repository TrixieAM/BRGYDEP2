-- Migration: Add signature fields to certificate_of_action table
-- Run this script to add e-signature support to existing database

ALTER TABLE `certificate_of_action` 
ADD COLUMN `use_signature` TINYINT(1) DEFAULT 0 AFTER `transaction_number`,
ADD COLUMN `signature_id` INT(11) NULL AFTER `use_signature`,
ADD KEY `signature_id` (`signature_id`),
ADD CONSTRAINT `fk_cert_action_signature` FOREIGN KEY (`signature_id`) REFERENCES `official_signature` (`signature_id`) ON DELETE SET NULL ON UPDATE CASCADE;

