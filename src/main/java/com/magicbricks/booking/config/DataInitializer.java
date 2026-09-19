package com.magicbricks.booking.config;

import com.magicbricks.booking.domain.Company;
import com.magicbricks.booking.domain.Role;
import com.magicbricks.booking.domain.User;
import com.magicbricks.booking.repository.CompanyRepository;
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
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(UserRepository userRepository,
                           CompanyRepository companyRepository,
                           PasswordEncoder passwordEncoder,
                           JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        log.info("Checking and initializing system credentials...");

        // Ensure Super Admin user exists with correct passwordHash and active status
        initOrUpdateSuperAdmin("superadmin@system.com", "password123", "System Super Admin");

        // Ensure default Facility Admin exists so direct logins can authenticate with real JWT tokens
        initOrUpdateFacilityAdmin("admin@acme.com", "password123", "Acme Administrator");

        // Sync H2 auto-increment identity sequence counters with max(id) + 1
        syncH2IdentitySequences();

        log.info("System credentials initialization complete.");
    }

    private void initOrUpdateSuperAdmin(String email, String rawPassword, String fullName) {
        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        String encodedPassword = passwordEncoder.encode(rawPassword);

        if (existingUserOpt.isPresent()) {
            User user = existingUserOpt.get();
            user.setPasswordHash(encodedPassword);
            user.setStatus("ACTIVE");
            user.setRole(Role.SUPER_ADMIN);
            user.setCompany(null);
            user.setDepartment(null);
            userRepository.save(user);
            log.info("Updated password & active status for Super Admin: {}", email);
        } else {
            User user = new User();
            user.setEmail(email);
            user.setPasswordHash(encodedPassword);
            user.setFullName(fullName);
            user.setRole(Role.SUPER_ADMIN);
            user.setStatus("ACTIVE");
            user.setCompany(null);
            user.setDepartment(null);
            userRepository.save(user);
            log.info("Created Super Admin user: {}", email);
        }
    }

    private void initOrUpdateFacilityAdmin(String email, String rawPassword, String fullName) {
        Company acmeCompany = companyRepository.findByCompanyCode("ACME").orElseGet(() -> {
            Company company = new Company();
            company.setName("Acme Corporation");
            company.setCompanyCode("ACME");
            company.setContactInformation("contact@acme.com");
            company.setStatus("ACTIVE");
            return companyRepository.save(company);
        });

        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        String encodedPassword = passwordEncoder.encode(rawPassword);

        if (existingUserOpt.isPresent()) {
            User user = existingUserOpt.get();
            user.setPasswordHash(encodedPassword);
            user.setStatus("ACTIVE");
            user.setRole(Role.COMPANY_ADMIN);
            user.setCompany(acmeCompany);
            userRepository.save(user);
            log.info("Updated password & active status for Facility Admin: {}", email);
        } else {
            User user = new User();
            user.setEmail(email);
            user.setPasswordHash(encodedPassword);
            user.setFullName(fullName);
            user.setRole(Role.COMPANY_ADMIN);
            user.setStatus("ACTIVE");
            user.setCompany(acmeCompany);
            userRepository.save(user);
            log.info("Created Facility Admin user: {}", email);
        }
    }

    private void syncH2IdentitySequences() {
        String[] tables = {"companies", "departments", "floors", "users", "rooms", "booking_policies", "bookings", "booking_participants", "booking_history", "audit_logs"};
        for (String table : tables) {
            try {
                jdbcTemplate.execute("ALTER TABLE " + table + " ALTER COLUMN id RESTART WITH (SELECT COALESCE(MAX(id), 0) + 1 FROM " + table + ")");
            } catch (Exception e) {
                log.debug("Skipped identity sequence sync for {}: {}", table, e.getMessage());
            }
        }
    }
}
