package com.magicbricks.booking.config;

import com.magicbricks.booking.domain.*;
import com.magicbricks.booking.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(UserRepository userRepository,
                           CompanyRepository companyRepository,
                           DepartmentRepository departmentRepository,
                           RoomRepository roomRepository,
                           BookingRepository bookingRepository,
                           AuditLogRepository auditLogRepository,
                           PasswordEncoder passwordEncoder,
                           JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        log.info("Checking and initializing default credentials, rooms across floors, departments, and employees...");

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

        // 2. Ensure Departments exist for company
        Department adminDept = initOrGetDepartment(company, "Admin");
        Department engDept = initOrGetDepartment(company, "Engineering");
        Department prodDept = initOrGetDepartment(company, "Product & Design");
        Department mktDept = initOrGetDepartment(company, "Marketing & Growth");
        Department salesDept = initOrGetDepartment(company, "Enterprise Sales");
        Department hrDept = initOrGetDepartment(company, "People & Culture");

        // 3. Ensure Super Admin user exists with correct passwordHash
        initOrUpdateUser("superadmin@system.com", "password123", "System Super Admin", Role.SUPER_ADMIN, null, null);

        // 4. Ensure Facility Admin user exists and is attached to the Admin department
        User facilityAdmin = initOrUpdateUser("admin@acme.com", "password123", "Acme Admin", Role.COMPANY_ADMIN, company, adminDept);

        // 5. Ensure Employees exist across departments
        User john = initOrUpdateUser("john.doe@acme.com", "password123", "John Doe", Role.EMPLOYEE, company, engDept);
        User sarah = initOrUpdateUser("sarah.connor@acme.com", "password123", "Sarah Connor", Role.EMPLOYEE, company, prodDept);
        User alex = initOrUpdateUser("alex.morgan@acme.com", "password123", "Alex Morgan", Role.EMPLOYEE, company, mktDept);
        User david = initOrUpdateUser("david.kim@acme.com", "password123", "David Kim", Role.EMPLOYEE, company, salesDept);
        User emily = initOrUpdateUser("emily.watson@acme.com", "password123", "Emily Watson", Role.EMPLOYEE, company, hrDept);

        // 6. Ensure Rooms exist across multiple office floors
        initRoom(company, "Focus Pod 101", "Floor 1", "East Wing", 2, "Private acoustic booth with 4K display and monitor hookup", "AVAILABLE");
        initRoom(company, "Team Room 102", "Floor 1", "West Wing", 6, "Collaborative space with digital whiteboard & video conferencing", "AVAILABLE");
        initRoom(company, "Sprint Pod 201", "Floor 2", "North Wing", 4, "High-focus huddle room with glass whiteboard", "AVAILABLE");
        initRoom(company, "Conference Room A", "Floor 2", "Central Wing", 10, "Main conference room with 85-inch 4K screen & omni mic array", "AVAILABLE");
        initRoom(company, "Executive Boardroom", "Floor 3", "Sky Wing", 18, "Executive presentation suite with dual-screen VC & luxury seating", "AVAILABLE");
        initRoom(company, "Design Studio 302", "Floor 3", "South Wing", 8, "Creative workshop space with dual stylus monitors & corkboards", "AVAILABLE");
        initRoom(company, "Innovation Lab 401", "Floor 4", "Rooftop Annex", 14, "Spacious ideation room with standing tables & live streaming equipment", "AVAILABLE");
        initRoom(company, "Quiet Pod 402", "Floor 4", "East Wing", 3, "Soundproof private discussion room (Under scheduled maintenance)", "MAINTENANCE");
        initRoom(company, "Townhall Forum", "Ground Floor", "Main Atrium", 40, "All-hands presentation auditorium with surround audio", "AVAILABLE");

        // 7. Ensure sample bookings exist for live monitor
        if (bookingRepository.count() == 0) {
            Room confA = roomRepository.findByCompanyIdAndName(company.getId(), "Conference Room A").orElse(null);
            Room team102 = roomRepository.findByCompanyIdAndName(company.getId(), "Team Room 102").orElse(null);
            Room boardRoom = roomRepository.findByCompanyIdAndName(company.getId(), "Executive Boardroom").orElse(null);

            LocalDate today = LocalDate.now();

            if (confA != null && facilityAdmin != null) {
                Booking b1 = new Booking();
                b1.setCompany(company);
                b1.setRoom(confA);
                b1.setBooker(facilityAdmin);
                b1.setTitle("Q3 Facilities & Workplace Review");
                b1.setDescription("Quarterly operations review with company leads");
                b1.setStartTime(LocalDateTime.of(today, LocalTime.of(10, 0)));
                b1.setEndTime(LocalDateTime.of(today, LocalTime.of(11, 30)));
                b1.setStatus("CONFIRMED");
                bookingRepository.save(b1);
            }

            if (team102 != null && john != null) {
                Booking b2 = new Booking();
                b2.setCompany(company);
                b2.setRoom(team102);
                b2.setBooker(john);
                b2.setTitle("Engineering Sprint Sync");
                b2.setDescription("Daily architecture checkpoint and code review");
                b2.setStartTime(LocalDateTime.of(today, LocalTime.of(14, 0)));
                b2.setEndTime(LocalDateTime.of(today, LocalTime.of(15, 0)));
                b2.setStatus("CONFIRMED");
                bookingRepository.save(b2);
            }

            if (boardRoom != null && sarah != null) {
                Booking b3 = new Booking();
                b3.setCompany(company);
                b3.setRoom(boardRoom);
                b3.setBooker(sarah);
                b3.setTitle("Product Roadmap Alignment");
                b3.setDescription("Cross-functional design and product roadmap walk-through");
                b3.setStartTime(LocalDateTime.of(today, LocalTime.of(16, 0)));
                b3.setEndTime(LocalDateTime.of(today, LocalTime.of(17, 30)));
                b3.setStatus("CONFIRMED");
                bookingRepository.save(b3);
            }
        }

        // 8. Ensure default system audit logs are initialized
        if (auditLogRepository.count() == 0) {
            AuditLog log1 = new AuditLog();
            log1.setUserId(1L);
            log1.setCompanyId(company.getId());
            log1.setAction("REGISTER_COMPANY");
            log1.setEntityType("COMPANY");
            log1.setEntityId(company.getId());
            log1.setNewValue("Registered company: " + company.getName() + " (" + company.getCompanyCode() + ")");
            log1.setTimestamp(LocalDateTime.now().minusDays(30));
            auditLogRepository.save(log1);

            AuditLog log2 = new AuditLog();
            log2.setUserId(1L);
            log2.setCompanyId(company.getId());
            log2.setAction("CREATE_FACILITY_ADMIN");
            log2.setEntityType("USER");
            log2.setEntityId(2L);
            log2.setNewValue("Created Facility Admin: Acme Admin (admin@acme.com) for company " + company.getName());
            log2.setTimestamp(LocalDateTime.now().minusDays(29));
            auditLogRepository.save(log2);

            AuditLog log3 = new AuditLog();
            log3.setUserId(1L);
            log3.setAction("SYSTEM_INIT");
            log3.setEntityType("SYSTEM");
            log3.setEntityId(1L);
            log3.setNewValue("System provisioned with Super Admin master credentials and default tenant isolation.");
            log3.setTimestamp(LocalDateTime.now().minusDays(31));
            auditLogRepository.save(log3);
        }

        // 9. Sync H2 auto-increment identity sequence counters with max(id) + 1
        syncH2IdentitySequences();

        log.info("Facility Admin domain entities, rooms across floors, and default credentials successfully synchronized.");
    }

    private Department initOrGetDepartment(Company company, String name) {
        return departmentRepository.findByCompanyId(company.getId()).stream()
                .filter(d -> name.equalsIgnoreCase(d.getName()))
                .findFirst()
                .orElseGet(() -> {
                    Department d = new Department();
                    d.setName(name);
                    d.setCompany(company);
                    d.setStatus("ACTIVE");
                    return departmentRepository.save(d);
                });
    }

    private void initRoom(Company company, String name, String floor, String location, int capacity, String desc, String status) {
        Optional<Room> existing = roomRepository.findByCompanyIdAndName(company.getId(), name);
        if (existing.isEmpty()) {
            Room r = new Room();
            r.setCompany(company);
            r.setName(name);
            r.setFloor(floor);
            r.setLocation(location);
            r.setCapacity(capacity);
            r.setDescription(desc);
            r.setStatus(status);
            roomRepository.save(r);
            log.info("Initialized Room: {} on {}", name, floor);
        }
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

    private User initOrUpdateUser(String email, String rawPassword, String fullName, Role role, Company company, Department department) {
        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        String encodedPassword = passwordEncoder.encode(rawPassword);

        if (existingUserOpt.isPresent()) {
            User user = existingUserOpt.get();
            user.setPasswordHash(encodedPassword);
            user.setStatus("ACTIVE");
            if (role != null) user.setRole(role);
            if (company != null && user.getCompany() == null) user.setCompany(company);
            if (department != null && user.getDepartment() == null) user.setDepartment(department);
            User saved = userRepository.save(user);
            log.info("Updated password & active status for user: {}", email);
            return saved;
        } else {
            User user = new User();
            user.setEmail(email);
            user.setPasswordHash(encodedPassword);
            user.setFullName(fullName);
            user.setRole(role);
            user.setStatus("ACTIVE");
            user.setCompany(company);
            user.setDepartment(department);
            User saved = userRepository.save(user);
            log.info("Created user: {}", email);
            return saved;
        }
    }
}
