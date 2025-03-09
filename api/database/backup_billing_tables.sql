-- Script untuk backup table billing
-- Tarikh backup: $(date +%Y%m%d)

-- Backup table billing_attachments
CREATE TABLE backup_billing_attachments_$(date +%Y%m%d) AS SELECT * FROM billing_attachments;

-- Backup table billing_histories
CREATE TABLE backup_billing_histories_$(date +%Y%m%d) AS SELECT * FROM billing_histories;

-- Backup table billing_details
CREATE TABLE backup_billing_details_$(date +%Y%m%d) AS SELECT * FROM billing_details;

-- Backup table billings
CREATE TABLE backup_billings_$(date +%Y%m%d) AS SELECT * FROM billings;

-- Backup table billing_sequences
CREATE TABLE backup_billing_sequences_$(date +%Y%m%d) AS SELECT * FROM billing_sequences;

-- Backup table billing_accesses
CREATE TABLE backup_billing_accesses_$(date +%Y%m%d) AS SELECT * FROM billing_accesses;

-- Backup table budget_histories
CREATE TABLE backup_budget_histories_$(date +%Y%m%d) AS SELECT * FROM budget_histories;

-- Backup selesai
SELECT 'Backup table billing berjaya dilakukan' as message;
