-- Migration V3: Add Composite Performance Indexes for Facility Admin Search & Filtering
-- Optimizes queries filtering by role, status, company_id, fullName, and email

-- 1. Composite indexes for users filtering
CREATE INDEX IF NOT EXISTS idx_users_role_status_company ON users(role, status, company_id);
CREATE INDEX IF NOT EXISTS idx_users_role_company ON users(role, company_id);
CREATE INDEX IF NOT EXISTS idx_users_role_fullname ON users(role, full_name);
CREATE INDEX IF NOT EXISTS idx_users_role_email ON users(role, email);

-- 2. Covering index on companies for JOIN and company name filter
CREATE INDEX IF NOT EXISTS idx_companies_id_name ON companies(id, name);
