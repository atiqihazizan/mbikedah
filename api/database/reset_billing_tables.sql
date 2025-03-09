-- Script untuk reset table billing dan auto increment
-- Backup dulu sebelum run script ini

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Reset table billing_attachments
TRUNCATE TABLE billing_attachments;
ALTER TABLE billing_attachments AUTO_INCREMENT = 1;

-- Reset table billing_histories
TRUNCATE TABLE billing_histories;
ALTER TABLE billing_histories AUTO_INCREMENT = 1;

-- Reset table billing_details
TRUNCATE TABLE billing_details;
ALTER TABLE billing_details AUTO_INCREMENT = 1;

-- Reset table billings
TRUNCATE TABLE billings;
ALTER TABLE billings AUTO_INCREMENT = 1;

-- Reset table billing_sequences
TRUNCATE TABLE billing_sequences;
ALTER TABLE billing_sequences AUTO_INCREMENT = 1;

-- Reset table billing_accesses
TRUNCATE TABLE billing_accesses;
ALTER TABLE billing_accesses AUTO_INCREMENT = 1;

-- Reset table budget_histories
TRUNCATE TABLE budget_histories;
ALTER TABLE budget_histories AUTO_INCREMENT = 1;

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Reset selesai
SELECT 'Reset table billing berjaya dilakukan' as message;
