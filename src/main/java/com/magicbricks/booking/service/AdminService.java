package com.magicbricks.booking.service;

import com.magicbricks.booking.common.BookingConflictException;
import com.magicbricks.booking.common.PageResponse;
import com.magicbricks.booking.common.ResourceNotFoundException;
import com.magicbricks.booking.domain.AuditLog;
import com.magicbricks.booking.domain.Company;
import com.magicbricks.booking.domain.Department;
import com.magicbricks.booking.domain.Role;
import com.magicbricks.booking.domain.User;
import com.magicbricks.booking.dto.AdminRegistrationRequest;
import com.magicbricks.booking.dto.AdminResponse;
import com.magicbricks.booking.dto.AdminUpdateRequest;
import com.magicbricks.booking.repository.AuditLogRepository;
import com.magicbricks.booking.repository.CompanyRepository;
import com.magicbricks.booking.repository.DepartmentRepository;
import com.magicbricks.booking.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository,
                        CompanyRepository companyRepository,
                        DepartmentRepository departmentRepository,
                        AuditLogRepository auditLogRepository,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminResponse> getFacilityAdminsPaginated(
            int page,
            int size,
            String search,
            String companyFilter,
            String status,
            String sortBy,
            String sortDir) {

        int pageIndex = page > 0 ? page - 1 : 0;
        int pageSize = size > 0 ? size : 10;

        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortProperty = "fullName";
        if ("email".equalsIgnoreCase(sortBy)) sortProperty = "email";
        else if ("status".equalsIgnoreCase(sortBy)) sortProperty = "status";
        else if ("id".equalsIgnoreCase(sortBy)) sortProperty = "id";
        else if ("createdAt".equalsIgnoreCase(sortBy)) sortProperty = "createdAt";

        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(direction, sortProperty));

        Long companyId = null;
        if (companyFilter != null && !"ALL".equalsIgnoreCase(companyFilter.trim())) {
            try {
                companyId = Long.parseLong(companyFilter.trim());
            } catch (NumberFormatException ignored) {}
        }

        String searchKeyword = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String statusFilter = (status != null && !"ALL".equalsIgnoreCase(status.trim())) ? status.trim().toUpperCase() : "ALL";

        Page<User> adminPage = userRepository.searchFacilityAdmins(
                Role.COMPANY_ADMIN,
                companyId,
                statusFilter,
                searchKeyword,
                pageable
        );

        List<AdminResponse> content = adminPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                pageIndex + 1,
                adminPage.getSize(),
                adminPage.getTotalElements(),
                adminPage.getTotalPages(),
                adminPage.isFirst(),
                adminPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public AdminResponse getAdminById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility Administrator not found with id: " + id));

        if (user.getRole() != Role.COMPANY_ADMIN) {
            throw new ResourceNotFoundException("User with id " + id + " is not a Facility Administrator");
        }

        return mapToResponse(user);
    }

    @Transactional
    public AdminResponse createFacilityAdmin(AdminRegistrationRequest request, Long currentUserId) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BookingConflictException("User with email '" + email + "' already exists");
        }

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.getCompanyId()));

        // Assign default 'Admin' department if available, or first department in company
        List<Department> depts = departmentRepository.findByCompanyId(company.getId());
        Department department = depts.stream()
                .filter(d -> "Admin".equalsIgnoreCase(d.getName()))
                .findFirst()
                .orElse(!depts.isEmpty() ? depts.get(0) : null);

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setCompany(company);
        user.setDepartment(department);
        user.setRole(Role.COMPANY_ADMIN);
        user.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "ACTIVE");

        User savedUser = userRepository.save(user);

        // Audit Log
        AuditLog log = new AuditLog();
        log.setUserId(currentUserId);
        log.setCompanyId(company.getId());
        log.setAction("CREATE_FACILITY_ADMIN");
        log.setEntityType("USER");
        log.setEntityId(savedUser.getId());
        log.setNewValue("Created Facility Admin: " + savedUser.getFullName() + " (" + savedUser.getEmail() + ") for company " + company.getName());
        auditLogRepository.save(log);

        return mapToResponse(savedUser);
    }

    @Transactional
    public AdminResponse updateFacilityAdmin(Long id, AdminUpdateRequest request, Long currentUserId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility Administrator not found with id: " + id));

        if (user.getRole() != Role.COMPANY_ADMIN) {
            throw new ResourceNotFoundException("User with id " + id + " is not a Facility Administrator");
        }

        String newEmail = request.getEmail().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(newEmail) && userRepository.existsByEmail(newEmail)) {
            throw new BookingConflictException("User with email '" + newEmail + "' already exists");
        }

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.getCompanyId()));

        String oldValue = "Name: " + user.getFullName() + ", Email: " + user.getEmail() + ", Company: " + (user.getCompany() != null ? user.getCompany().getName() : "None") + ", Status: " + user.getStatus();

        user.setFullName(request.getFullName().trim());
        user.setEmail(newEmail);
        user.setCompany(company);

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword().trim()));
        }

        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            user.setStatus(request.getStatus().trim().toUpperCase());
        }

        User updatedUser = userRepository.save(user);

        // Audit Log
        AuditLog log = new AuditLog();
        log.setUserId(currentUserId);
        log.setCompanyId(company.getId());
        log.setAction("UPDATE_FACILITY_ADMIN");
        log.setEntityType("USER");
        log.setEntityId(updatedUser.getId());
        log.setOldValue(oldValue);
        log.setNewValue("Updated Facility Admin: " + updatedUser.getFullName() + " (" + updatedUser.getEmail() + ")");
        auditLogRepository.save(log);

        return mapToResponse(updatedUser);
    }

    @Transactional
    public AdminResponse toggleAdminStatus(Long id, Long currentUserId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility Administrator not found with id: " + id));

        if (user.getRole() != Role.COMPANY_ADMIN) {
            throw new ResourceNotFoundException("User with id " + id + " is not a Facility Administrator");
        }

        String oldStatus = user.getStatus();
        String newStatus = "ACTIVE".equalsIgnoreCase(oldStatus) ? "INACTIVE" : "ACTIVE";
        user.setStatus(newStatus);

        User updatedUser = userRepository.save(user);

        // Audit Log
        AuditLog log = new AuditLog();
        log.setUserId(currentUserId);
        log.setCompanyId(user.getCompany() != null ? user.getCompany().getId() : null);
        log.setAction(newStatus.equals("ACTIVE") ? "ACTIVATE_FACILITY_ADMIN" : "SUSPEND_FACILITY_ADMIN");
        log.setEntityType("USER");
        log.setEntityId(updatedUser.getId());
        log.setOldValue("Status: " + oldStatus);
        log.setNewValue("Status: " + newStatus);
        auditLogRepository.save(log);

        return mapToResponse(updatedUser);
    }

    @Transactional
    public List<AdminResponse> bulkUpdateAdminStatus(List<Long> adminIds, String status, Long currentUserId) {
        if (adminIds == null || adminIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        String targetStatus = "ACTIVE".equalsIgnoreCase(status) ? "ACTIVE" : "INACTIVE";
        List<User> users = userRepository.findAllById(adminIds);
        List<User> updatedUsers = new java.util.ArrayList<>();

        for (User user : users) {
            if (user.getRole() == Role.COMPANY_ADMIN) {
                String oldStatus = user.getStatus();
                user.setStatus(targetStatus);
                User saved = userRepository.save(user);
                updatedUsers.add(saved);

                // Audit Log
                AuditLog log = new AuditLog();
                log.setUserId(currentUserId);
                log.setCompanyId(user.getCompany() != null ? user.getCompany().getId() : null);
                log.setAction(targetStatus.equals("ACTIVE") ? "ACTIVATE_FACILITY_ADMIN" : "SUSPEND_FACILITY_ADMIN");
                log.setEntityType("USER");
                log.setEntityId(saved.getId());
                log.setOldValue("Bulk Status: " + oldStatus);
                log.setNewValue("Bulk Status: " + targetStatus);
                auditLogRepository.save(log);
            }
        }

        return updatedUsers.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private AdminResponse mapToResponse(User user) {
        AdminResponse response = new AdminResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus());
        response.setCreatedAt(user.getCreatedAt());
        response.setLastLogin("Recent");

        if (user.getCompany() != null) {
            response.setCompanyId(user.getCompany().getId());
            response.setCompanyName(user.getCompany().getName());
            response.setCompanyCode(user.getCompany().getCompanyCode());
        }

        return response;
    }
}
