-- Migration V5: Add phone column to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
