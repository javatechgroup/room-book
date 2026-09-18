package com.magicbricks.booking.service;

import com.magicbricks.booking.common.BookingConflictException;
import com.magicbricks.booking.common.PageResponse;
import com.magicbricks.booking.common.ResourceNotFoundException;
import com.magicbricks.booking.domain.AuditLog;
import com.magicbricks.booking.domain.Company;
import com.magicbricks.booking.domain.Department;
import com.magicbricks.booking.dto.DepartmentRequest;
import com.magicbricks.booking.dto.DepartmentResponse;
import com.magicbricks.booking.repository.AuditLogRepository;
import com.magicbricks.booking.repository.CompanyRepository;
import com.magicbricks.booking.repository.DepartmentRepository;
import com.magicbricks.booking.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacilityDepartmentService {

    private final DepartmentRepository departmentRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public FacilityDepartmentService(DepartmentRepository departmentRepository,
                                     CompanyRepository companyRepository,
                                     UserRepository userRepository,
                                     AuditLogRepository auditLogRepository) {
        this.departmentRepository = departmentRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request, Long companyId, Long currentUserId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + companyId));

        String deptName = request.getName().trim();
        if (departmentRepository.findByCompanyIdAndNameIgnoreCase(companyId, deptName).isPresent()) {
            throw new BookingConflictException("Department with name '" + deptName + "' already exists in this company.");
        }

        Department department = new Department();
        department.setCompany(company);
        department.setName(deptName);
        department.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "ACTIVE");

        Department saved = departmentRepository.save(department);

        AuditLog audit = new AuditLog();
        audit.setUserId(currentUserId);
        audit.setCompanyId(companyId);
        audit.setAction("CREATE_DEPARTMENT");
        audit.setEntityType("DEPARTMENT");
        audit.setEntityId(saved.getId());
        audit.setNewValue("Created Department: " + saved.getName());
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<DepartmentResponse> getDepartmentsPaginated(
            Long companyId,
            int page,
            int size,
            String search,
            String status,
            String sortBy,
            String sortDir) {

        int pageNum = Math.max(0, page - 1);
        int pageSize = Math.max(1, size);

        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortProperty = (sortBy == null || sortBy.isBlank()) ? "name" : sortBy;
        Pageable pageable = PageRequest.of(pageNum, pageSize, Sort.by(direction, sortProperty));

        String sanitizedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String statusFilter = (status == null || status.trim().isEmpty()) ? "ALL" : status.trim();

        Page<Department> deptPage = departmentRepository.searchDepartments(companyId, statusFilter, sanitizedSearch, pageable);
        List<DepartmentResponse> content = deptPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                page,
                deptPage.getSize(),
                deptPage.getTotalElements(),
                deptPage.getTotalPages(),
                deptPage.isFirst(),
                deptPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments(Long companyId) {
        return departmentRepository.findByCompanyId(companyId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id, Long companyId) {
        Department dept = departmentRepository.findById(id)
                .filter(d -> d.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
        return mapToResponse(dept);
    }

    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request, Long companyId, Long currentUserId) {
        Department dept = departmentRepository.findById(id)
                .filter(d -> d.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        String oldVal = "Department: " + dept.getName() + " (Status: " + dept.getStatus() + ")";
        String newName = request.getName().trim();

        if (!dept.getName().equalsIgnoreCase(newName)) {
            departmentRepository.findByCompanyIdAndNameIgnoreCase(companyId, newName)
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            throw new BookingConflictException("Department with name '" + newName + "' already exists.");
                        }
                    });
        }

        dept.setName(newName);
        if (request.getStatus() != null) {
            dept.setStatus(request.getStatus().toUpperCase());
        }

        Department updated = departmentRepository.save(dept);

        AuditLog audit = new AuditLog();
        audit.setUserId(currentUserId);
        audit.setCompanyId(companyId);
        audit.setAction("UPDATE_DEPARTMENT");
        audit.setEntityType("DEPARTMENT");
        audit.setEntityId(updated.getId());
        audit.setOldValue(oldVal);
        audit.setNewValue("Updated Department: " + updated.getName() + " (Status: " + updated.getStatus() + ")");
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);

        return mapToResponse(updated);
    }

    @Transactional
    public DepartmentResponse toggleDepartmentStatus(Long id, Long companyId, Long currentUserId) {
        Department dept = departmentRepository.findById(id)
                .filter(d -> d.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        String oldStatus = dept.getStatus();
        String newStatus = "ACTIVE".equalsIgnoreCase(oldStatus) ? "INACTIVE" : "ACTIVE";
        dept.setStatus(newStatus);
        Department updated = departmentRepository.save(dept);

        AuditLog audit = new AuditLog();
        audit.setUserId(currentUserId);
        audit.setCompanyId(companyId);
        audit.setAction("TOGGLE_DEPARTMENT_STATUS");
        audit.setEntityType("DEPARTMENT");
        audit.setEntityId(updated.getId());
        audit.setOldValue("Status: " + oldStatus);
        audit.setNewValue("Status: " + newStatus);
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);

        return mapToResponse(updated);
    }

    public DepartmentResponse mapToResponse(Department dept) {
        DepartmentResponse res = new DepartmentResponse();
        res.setId(dept.getId());
        if (dept.getCompany() != null) {
            res.setCompanyId(dept.getCompany().getId());
            res.setCompanyName(dept.getCompany().getName());
        }
        res.setName(dept.getName());
        res.setStatus(dept.getStatus());
        res.setEmployeeCount(userRepository.countByDepartmentId(dept.getId()));
        res.setCreatedAt(dept.getCreatedAt());
        res.setUpdatedAt(dept.getUpdatedAt());
        return res;
    }
}
