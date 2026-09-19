-- V8 Migration: Create floors table and performance indexes

CREATE TABLE floors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    floor_number INT,
    description VARCHAR(500),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_floor_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE INDEX idx_floors_company_id ON floors(company_id);
CREATE INDEX idx_floors_company_status ON floors(company_id, status);
CREATE INDEX idx_floors_company_name ON floors(company_id, name);
