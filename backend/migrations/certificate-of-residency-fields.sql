-- Add control_no, prepared_by_name, and prepared_by_position fields to certificate_of_residency table
ALTER TABLE `certificate_of_residency`
  ADD COLUMN IF NOT EXISTS `control_no` VARCHAR(50) NULL AFTER `transaction_number`,
  ADD COLUMN IF NOT EXISTS `prepared_by_name` VARCHAR(255) NULL AFTER `control_no`,
  ADD COLUMN IF NOT EXISTS `prepared_by_position` VARCHAR(255) NULL AFTER `prepared_by_name`;

-- Create index on control_no for faster queries if it doesn't exist
CREATE INDEX IF NOT EXISTS `idx_control_no` ON `certificate_of_residency` (`control_no`);
