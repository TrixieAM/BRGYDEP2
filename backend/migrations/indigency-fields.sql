-- Add control_no, prepared_by_name, and prepared_by_position fields to indigency table
ALTER TABLE `indigency`
  ADD COLUMN IF NOT EXISTS `control_no` VARCHAR(50) NULL AFTER `transaction_number`,
  ADD COLUMN IF NOT EXISTS `prepared_by_name` VARCHAR(255) NULL AFTER `control_no`,
  ADD COLUMN IF NOT EXISTS `prepared_by_position` VARCHAR(255) NULL AFTER `prepared_by_name`;

-- Create index on control_no for faster queries if it doesn't exist
CREATE INDEX IF NOT EXISTS `idx_indigency_control_no` ON `indigency` (`control_no`);
