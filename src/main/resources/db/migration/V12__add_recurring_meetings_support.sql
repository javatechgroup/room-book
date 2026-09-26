-- V12: Add recurring meetings support to bookings

ALTER TABLE bookings ADD COLUMN recurrence_id VARCHAR(50);
ALTER TABLE bookings ADD COLUMN recurrence_rule VARCHAR(30);
ALTER TABLE bookings ADD COLUMN is_recurrence_parent BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_bookings_recurrence_id ON bookings(recurrence_id);
CREATE INDEX idx_bookings_recurrence_time ON bookings(recurrence_id, start_time);
