package com.javatechgroup.booking.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.javatechgroup.booking.common.BookingConflictException;
import com.javatechgroup.booking.common.PageResponse;
import com.javatechgroup.booking.common.ResourceNotFoundException;
import com.javatechgroup.booking.domain.AuditLog;
import com.javatechgroup.booking.domain.Company;
import com.javatechgroup.booking.domain.Department;
import com.javatechgroup.booking.domain.Role;
import com.javatechgroup.booking.domain.User;
import com.javatechgroup.booking.dto.EmployeeRequest;
import com.javatechgroup.booking.dto.EmployeeResponse;
import com.javatechgroup.booking.repository.AuditLogRepository;
import com.javatechgroup.booking.repository.CompanyRepository;
import com.javatechgroup.booking.repository.DepartmentRepository;
import com.javatechgroup.booking.repository.UserRepository;

@Service
public class FacilityEmployeeService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public FacilityEmployeeService(UserRepository userRepository,
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

    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request, Long companyId, Long currentUserId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + companyId));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .filter(d -> d.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BookingConflictException("An account with email " + email + " already exists.");
        }

        User user = new User();
        user.setCompany(company);
        user.setDepartment(department);
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setRole(request.getRole() != null ? request.getRole() : Role.EMPLOYEE);
        user.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "ACTIVE");

        String rawPassword = (request.getPassword() != null && !request.getPassword().isBlank())
                ? request.getPassword()
                : "password123";
        user.setPasswordHash(passwordEncoder.encode(rawPassword));

        User saved = userRepository.save(user);

        AuditLog audit = new AuditLog();
        audit.setUserId(currentUserId);
        audit.setCompanyId(companyId);
        audit.setAction("CREATE_EMPLOYEE");
        audit.setEntityType("USER");
        audit.setEntityId(saved.getId());
        audit.setNewValue("Created Employee: " + saved.getFullName() + " (" + saved.getEmail() + ") in " + department.getName());
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<EmployeeResponse> getEmployeesPaginated(
            Long companyId,
            int page,
            int size,
            String search,
            Long departmentId,
            String roleStr,
            String status,
            String sortBy,
            String sortDir) {

        int pageNum = Math.max(0, page - 1);
        int pageSize = Math.max(1, size);

        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortProperty = (sortBy == null || sortBy.isBlank()) ? "fullName" : sortBy;
        Pageable pageable = PageRequest.of(pageNum, pageSize, Sort.by(direction, sortProperty));

        String sanitizedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String statusFilter = (status == null || status.trim().isEmpty()) ? "ALL" : status.trim();

        Role roleFilter = null;
        if (roleStr != null && !roleStr.isBlank() && !"ALL".equalsIgnoreCase(roleStr)) {
            try {
                roleFilter = Role.valueOf(roleStr.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        Page<User> userPage = userRepository.searchEmployees(companyId, departmentId, roleFilter, statusFilter, sanitizedSearch, pageable);
        List<EmployeeResponse> content = userPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                page,
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.isFirst(),
                userPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id, Long companyId) {
        User user = userRepository.findById(id)
                .filter(u -> u.getCompany() != null && u.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));
        return mapToResponse(user);
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request, Long companyId, Long currentUserId) {
        User user = userRepository.findById(id)
                .filter(u -> u.getCompany() != null && u.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .filter(d -> d.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        String oldVal = "Employee: " + user.getFullName() + " (" + user.getEmail() + "), Dept: " + (user.getDepartment() != null ? user.getDepartment().getName() : "None") + ", Status: " + user.getStatus();

        String newEmail = request.getEmail().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(newEmail)) {
            if (userRepository.existsByEmail(newEmail)) {
                throw new BookingConflictException("An account with email " + newEmail + " already exists.");
            }
            user.setEmail(newEmail);
        }

        user.setFullName(request.getFullName().trim());
        user.setDepartment(department);
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus().toUpperCase());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User updated = userRepository.save(user);

        AuditLog audit = new AuditLog();
        audit.setUserId(currentUserId);
        audit.setCompanyId(companyId);
        audit.setAction("UPDATE_EMPLOYEE");
        audit.setEntityType("USER");
        audit.setEntityId(updated.getId());
        audit.setOldValue(oldVal);
        audit.setNewValue("Updated Employee: " + updated.getFullName() + " (" + updated.getEmail() + ") in " + department.getName());
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);

        return mapToResponse(updated);
    }

    @Transactional
    public EmployeeResponse toggleEmployeeStatus(Long id, Long companyId, Long currentUserId) {
        User user = userRepository.findById(id)
                .filter(u -> u.getCompany() != null && u.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));

        String oldStatus = user.getStatus();
        String newStatus = "ACTIVE".equalsIgnoreCase(oldStatus) ? "INACTIVE" : "ACTIVE";
        user.setStatus(newStatus);
        User updated = userRepository.save(user);

        AuditLog audit = new AuditLog();
        audit.setUserId(currentUserId);
        audit.setCompanyId(companyId);
        audit.setAction("TOGGLE_EMPLOYEE_STATUS");
        audit.setEntityType("USER");
        audit.setEntityId(updated.getId());
        audit.setOldValue("Status: " + oldStatus);
        audit.setNewValue("Status: " + newStatus);
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);

        return mapToResponse(updated);
    }

    @Transactional
    public List<EmployeeResponse> bulkUpdateStatus(List<Long> ids, String status, Long companyId, Long currentUserId) {
        List<User> users = userRepository.findAllById(ids).stream()
                .filter(u -> u.getCompany() != null && u.getCompany().getId().equals(companyId))
                .collect(Collectors.toList());

        for (User u : users) {
            u.setStatus(status.toUpperCase());
        }
        List<User> saved = userRepository.saveAll(users);

        AuditLog audit = new AuditLog();
        audit.setUserId(currentUserId);
        audit.setCompanyId(companyId);
        audit.setAction("BULK_UPDATE_EMPLOYEES");
        audit.setEntityType("USER");
        audit.setNewValue("Bulk updated " + saved.size() + " employees to status " + status);
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);

        return saved.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public EmployeeResponse mapToResponse(User user) {
        EmployeeResponse res = new EmployeeResponse();
        res.setId(user.getId());
        if (user.getCompany() != null) {
            res.setCompanyId(user.getCompany().getId());
            res.setCompanyName(user.getCompany().getName());
        }
        if (user.getDepartment() != null) {
            res.setDepartmentId(user.getDepartment().getId());
            res.setDepartmentName(user.getDepartment().getName());
        }
        res.setFullName(user.getFullName());
        res.setEmail(user.getEmail());
        res.setRole(user.getRole());
        res.setStatus(user.getStatus());
        res.setCreatedAt(user.getCreatedAt());
        res.setUpdatedAt(user.getUpdatedAt());
        return res;
    }
}
