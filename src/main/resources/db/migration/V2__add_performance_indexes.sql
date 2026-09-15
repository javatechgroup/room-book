-- Migration V2: Add Performance Optimization Indexes

-- 1. Indexes on companies for search, status filtering, and sorting
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_status_name ON companies(status, name);
CREATE INDEX IF NOT EXISTS idx_companies_status_created_at ON companies(status, created_at);

-- 2. Relational and filter indexes for high-throughput counting & lookups
CREATE INDEX IF NOT EXISTS idx_departments_company_id ON departments(company_id);
CREATE INDEX IF NOT EXISTS idx_rooms_company_id ON rooms(company_id);
CREATE INDEX IF NOT EXISTS idx_rooms_company_status ON rooms(company_id, status);
CREATE INDEX IF NOT EXISTS idx_users_company_role ON users(company_id, role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs(company_id);
