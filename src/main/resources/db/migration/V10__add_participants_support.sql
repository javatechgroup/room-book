-- Migration V10: Support rich email participants (internal and external)
ALTER TABLE booking_participants ALTER COLUMN user_id BIGINT NULL;
ALTER TABLE booking_participants ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE booking_participants ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE booking_participants ADD COLUMN IF NOT EXISTS is_external BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_participants_email ON booking_participants(email);
