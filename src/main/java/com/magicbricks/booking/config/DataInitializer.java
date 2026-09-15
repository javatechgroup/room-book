package com.magicbricks.booking.config;

import com.magicbricks.booking.domain.Company;
import com.magicbricks.booking.domain.Department;
import com.magicbricks.booking.domain.Role;
import com.magicbricks.booking.domain.User;
import com.magicbricks.booking.repository.CompanyRepository;
import com.magicbricks.booking.repository.DepartmentRepository;
import com.magicbricks.booking.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(UserRepository userRepository,
                           CompanyRepository companyRepository,
                           DepartmentRepository departmentRepository,
                           PasswordEncoder passwordEncoder,
                           JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        log.info("Checking and initializing default credentials and enterprise users...");

        // 1. Ensure default company exists
        Company company = companyRepository.findByCompanyCode("ACME").orElseGet(() -> {
            Company c = new Company();
            c.setName("Acme Corporation");
            c.setCompanyCode("ACME");
            c.setContactInformation("admin@acme.com");
            c.setAddress("100 Tech Park, Suite 400");
            c.setStatus("ACTIVE");
            return companyRepository.save(c);
        });

        // 2. Ensure default Admin department exists for company
        Department adminDept = departmentRepository.findByCompanyId(company.getId()).stream()
                .filter(d -> "Admin".equalsIgnoreCase(d.getName()))
                .findFirst()
                .orElseGet(() -> {
                    Department d = new Department();
                    d.setName("Admin");
                    d.setCompany(company);
                    d.setStatus("ACTIVE");
                    return departmentRepository.save(d);
                });

        // 3. Ensure Super Admin user exists with correct passwordHash
        initOrUpdateUser("superadmin@system.com", "password123", "System Super Admin", Role.SUPER_ADMIN, null, null);

        // 4. Ensure Facility Admin user exists and is attached to the Admin department
        initOrUpdateUser("admin@acme.com", "password123", "Acme Admin", Role.COMPANY_ADMIN, company, adminDept);

        // 5. Ensure Employee user exists with correct passwordHash
        initOrUpdateUser("john.doe@acme.com", "password123", "John Doe", Role.EMPLOYEE, company, adminDept);

        // 6. Sync H2 auto-increment identity sequence counters with max(id) + 1
        syncH2IdentitySequences();

        log.info("Default user accounts and database identity sequences successfully synchronized.");
    }

    private void syncH2IdentitySequences() {
        String[] tables = {"companies", "departments", "users", "rooms", "booking_policies", "bookings", "booking_participants", "booking_history", "audit_logs"};
        for (String table : tables) {
            try {
                jdbcTemplate.execute("ALTER TABLE " + table + " ALTER COLUMN id RESTART WITH (SELECT COALESCE(MAX(id), 0) + 1 FROM " + table + ")");
            } catch (Exception e) {
                log.debug("Skipped identity sequence sync for {}: {}", table, e.getMessage());
            }
        }
    }

    private void initOrUpdateUser(String email, String rawPassword, String fullName, Role role, Company company, Department department) {
        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        String encodedPassword = passwordEncoder.encode(rawPassword);

        if (existingUserOpt.isPresent()) {
            User user = existingUserOpt.get();
            user.setPasswordHash(encodedPassword);
            user.setStatus("ACTIVE");
            if (role != null) user.setRole(role);
            if (company != null && user.getCompany() == null) user.setCompany(company);
            if (department != null && user.getDepartment() == null) user.setDepartment(department);
            userRepository.save(user);
            log.info("Updated password & active status for user: {}", email);
        } else {
            User user = new User();
            user.setEmail(email);
            user.setPasswordHash(encodedPassword);
            user.setFullName(fullName);
            user.setRole(role);
            user.setStatus("ACTIVE");
            user.setCompany(company);
            user.setDepartment(department);
            userRepository.save(user);
            log.info("Created user: {}", email);
        }
    }
}
