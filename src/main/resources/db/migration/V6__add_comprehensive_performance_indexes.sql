-- Migration V6: Comprehensive Performance Indexes for High-Throughput Booking & Search
-- Optimizes:
-- 1. Real-time booking conflict checking and slot validation
-- 2. Live campus room occupancy matrix queries
-- 3. Date range and calendar day schedule filtering
-- 4. Multi-tenant company/department/floor/status composite lookups
-- 5. User action history and booking participant joins

-- 1. Bookings Table Performance Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_room_status_time ON bookings(room_id, status, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_company_status_time ON bookings(company_id, status, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_company_time ON bookings(company_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_booker_id ON bookings(booker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_company_status ON bookings(company_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);

-- 2. Rooms Table Performance Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_company_floor ON rooms(company_id, floor);
CREATE INDEX IF NOT EXISTS idx_rooms_company_status_floor ON rooms(company_id, status, floor);
CREATE INDEX IF NOT EXISTS idx_rooms_company_name ON rooms(company_id, name);

-- 3. Users Table Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_company_dept ON users(company_id, department_id);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_company_status ON users(company_id, status);

-- 4. Departments Table Performance Indexes
CREATE INDEX IF NOT EXISTS idx_departments_company_status ON departments(company_id, status);
CREATE INDEX IF NOT EXISTS idx_departments_company_name ON departments(company_id, name);

-- 5. Booking Participants & History Indexes
CREATE INDEX IF NOT EXISTS idx_participants_booking_id ON booking_participants(booking_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON booking_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_history_booking_id ON booking_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_history_user_id ON booking_history(performed_by_user_id);
