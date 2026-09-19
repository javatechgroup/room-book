-- V7 Migration: Clean up legacy seed data (keep only SUPER_ADMIN)

-- 1. Remove child records referencing ACME company / test rooms
DELETE FROM booking_participants WHERE booking_id IN (
    SELECT id FROM bookings WHERE company_id IN (SELECT id FROM companies WHERE company_code = 'ACME')
);

DELETE FROM booking_history WHERE booking_id IN (SELECT id FROM bookings WHERE company_id IN (SELECT id FROM companies WHERE company_code = 'ACME'));

DELETE FROM bookings WHERE company_id IN (SELECT id FROM companies WHERE company_code = 'ACME');

DELETE FROM rooms WHERE company_id IN (SELECT id FROM companies WHERE company_code = 'ACME');

DELETE FROM booking_policies WHERE company_id IN (SELECT id FROM companies WHERE company_code = 'ACME');

DELETE FROM audit_logs WHERE company_id IN (SELECT id FROM companies WHERE company_code = 'ACME');

-- 2. Remove default facility admin and employee test users
DELETE FROM users WHERE email IN ('admin@acme.com', 'john.doe@acme.com');

-- 3. Remove default department and company
DELETE FROM departments WHERE company_id IN (SELECT id FROM companies WHERE company_code = 'ACME');

DELETE FROM companies WHERE company_code = 'ACME';
