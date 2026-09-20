-- Migration V9: Add attendees_count and department to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS attendees_count INT DEFAULT 2;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS department VARCHAR(100);
