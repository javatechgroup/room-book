-- Migration V4: Add Composite Performance Indexes for System Audit Logs
-- Optimizes audit log ordering by timestamp and filtering by action, entity_type, and company_id

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action_timestamp ON audit_logs(action, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity_timestamp ON audit_logs(entity_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_company_timestamp ON audit_logs(company_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user_timestamp ON audit_logs(user_id, timestamp DESC);
