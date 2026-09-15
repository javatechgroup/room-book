-- Initial Schema Migration for H2 / ANSI SQL

CREATE TABLE companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_code VARCHAR(50) NOT NULL UNIQUE,
    contact_information VARCHAR(255),
    address VARCHAR(550),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_department_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT,
    department_id BIGINT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_user_department FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    floor VARCHAR(50),
    capacity INT NOT NULL,
    description VARCHAR(1000),
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_room_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE booking_policies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL UNIQUE,
    max_advance_booking_days INT DEFAULT 30,
    min_booking_duration_minutes INT DEFAULT 30,
    max_booking_duration_hours INT DEFAULT 4,
    cancellation_cutoff_minutes INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_policy_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    booker_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_booking_room FOREIGN KEY (room_id) REFERENCES rooms(id),
    CONSTRAINT fk_booking_booker FOREIGN KEY (booker_id) REFERENCES users(id)
);

CREATE TABLE booking_participants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_participant_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_participant_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE booking_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by_user_id BIGINT NOT NULL,
    details VARCHAR(2000),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY (performed_by_user_id) REFERENCES users(id)
);

CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    company_id BIGINT,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    old_value VARCHAR(2000),
    new_value VARCHAR(2000),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial Super Admin and Test Company Data
INSERT INTO companies (id, name, company_code, contact_information, address, status)
VALUES (1, 'Acme Corporation', 'ACME', 'admin@acme.com', '100 Tech Park, Suite 400', 'ACTIVE');

INSERT INTO departments (id, company_id, name, status)
VALUES (1, 1, 'Admin', 'ACTIVE');

-- Password for superadmin & companyadmin & employee is 'password123' hashed with BCrypt ($2a$10$e7v1g5YxVw8N... or standard hash)
-- BCrypt for 'password123': $2a$10$8.UnVuG9HHg7ke3CD4048eT8bW9.2XbUjD1Hh6mU4aW3hE8t7Jz/e
INSERT INTO users (id, company_id, department_id, email, password_hash, full_name, role, status)
VALUES 
(1, NULL, NULL, 'superadmin@system.com', '$2a$10$8.UnVuG9HHg7ke3CD4048eT8bW9.2XbUjD1Hh6mU4aW3hE8t7Jz/e', 'System Super Admin', 'SUPER_ADMIN', 'ACTIVE'),
(2, 1, 1, 'admin@acme.com', '$2a$10$8.UnVuG9HHg7ke3CD4048eT8bW9.2XbUjD1Hh6mU4aW3hE8t7Jz/e', 'Acme Admin', 'COMPANY_ADMIN', 'ACTIVE'),
(3, 1, 1, 'john.doe@acme.com', '$2a$10$8.UnVuG9HHg7ke3CD4048eT8bW9.2XbUjD1Hh6mU4aW3hE8t7Jz/e', 'John Doe', 'EMPLOYEE', 'ACTIVE');

INSERT INTO booking_policies (id, company_id, max_advance_booking_days, min_booking_duration_minutes, max_booking_duration_hours, cancellation_cutoff_minutes)
VALUES (1, 1, 30, 30, 4, 30);

INSERT INTO rooms (id, company_id, name, location, floor, capacity, description, status)
VALUES 
(1, 1, 'Conference Room A', 'Building 1', '3rd Floor', 10, 'Main conference room with AV equipment', 'AVAILABLE'),
(2, 1, 'Meeting Room B', 'Building 1', '2nd Floor', 4, 'Small discussion room', 'AVAILABLE');
