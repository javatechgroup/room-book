package com.magicbricks.booking.service;

import com.magicbricks.booking.common.BookingConflictException;
import com.magicbricks.booking.common.ResourceNotFoundException;
import com.magicbricks.booking.domain.*;
import com.magicbricks.booking.dto.CompanyRegistrationRequest;
import com.magicbricks.booking.dto.CompanyResponse;
import com.magicbricks.booking.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final BookingPolicyRepository bookingPolicyRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public CompanyService(CompanyRepository companyRepository,
                          DepartmentRepository departmentRepository,
                          BookingPolicyRepository bookingPolicyRepository,
                          RoomRepository roomRepository,
                          UserRepository userRepository,
                          AuditLogRepository auditLogRepository) {
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
        this.bookingPolicyRepository = bookingPolicyRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public CompanyResponse registerCompany(CompanyRegistrationRequest request, Long currentUserId) {
        String companyCode = request.getCompanyCode().trim().toUpperCase();

        if (companyRepository.existsByCompanyCode(companyCode)) {
            throw new BookingConflictException("Company with code '" + companyCode + "' already exists");
        }

        // 1. Create and save Company
        Company company = new Company();
        company.setName(request.getName().trim());
        company.setCompanyCode(companyCode);
        company.setContactInformation(request.getContactInformation().trim());
        company.setAddress(request.getAddress());
        company.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

        Company savedCompany = companyRepository.save(company);

        // 2. Initialize default booking policy
        BookingPolicy defaultPolicy = new BookingPolicy();
        defaultPolicy.setCompany(savedCompany);
        defaultPolicy.setMaxAdvanceBookingDays(30);
        defaultPolicy.setMinBookingDurationMinutes(30);
        defaultPolicy.setMaxBookingDurationHours(4);
        defaultPolicy.setCancellationCutoffMinutes(30);
        bookingPolicyRepository.save(defaultPolicy);

        // 3. Initialize default 'Admin' department attached to company
        Department adminDept = new Department();
        adminDept.setName("Admin");
        adminDept.setCompany(savedCompany);
        adminDept.setStatus("ACTIVE");
        departmentRepository.save(adminDept);

        // 4. Record Audit Log
        AuditLog log = new AuditLog();
        log.setUserId(currentUserId);
        log.setCompanyId(savedCompany.getId());
        log.setAction("REGISTER_COMPANY");
        log.setEntityType("COMPANY");
        log.setEntityId(savedCompany.getId());
        log.setNewValue("Registered company: " + savedCompany.getName() + " (" + savedCompany.getCompanyCode() + ")");
        auditLogRepository.save(log);

        return mapToResponse(savedCompany);
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyResponse getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        return mapToResponse(company);
    }

    @Transactional
    public CompanyResponse updateCompany(Long id, CompanyRegistrationRequest request, Long currentUserId) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        String newCode = request.getCompanyCode().trim().toUpperCase();
        if (!company.getCompanyCode().equalsIgnoreCase(newCode) && companyRepository.existsByCompanyCode(newCode)) {
            throw new BookingConflictException("Company with code '" + newCode + "' already exists");
        }

        String oldValue = "Name: " + company.getName() + ", Code: " + company.getCompanyCode() + ", Status: " + company.getStatus();

        company.setName(request.getName().trim());
        company.setCompanyCode(newCode);
        company.setContactInformation(request.getContactInformation().trim());
        company.setAddress(request.getAddress());
        if (request.getStatus() != null) {
            company.setStatus(request.getStatus());
        }

        Company updatedCompany = companyRepository.save(company);

        // Audit Log
        AuditLog log = new AuditLog();
        log.setUserId(currentUserId);
        log.setCompanyId(updatedCompany.getId());
        log.setAction("UPDATE_COMPANY");
        log.setEntityType("COMPANY");
        log.setEntityId(updatedCompany.getId());
        log.setOldValue(oldValue);
        log.setNewValue("Updated company: " + updatedCompany.getName() + " (" + updatedCompany.getCompanyCode() + ")");
        auditLogRepository.save(log);

        return mapToResponse(updatedCompany);
    }

    @Transactional
    public CompanyResponse toggleCompanyStatus(Long id, Long currentUserId) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        String oldStatus = company.getStatus();
        String newStatus = "ACTIVE".equalsIgnoreCase(oldStatus) ? "INACTIVE" : "ACTIVE";
        company.setStatus(newStatus);

        Company updated = companyRepository.save(company);

        // Audit Log
        AuditLog log = new AuditLog();
        log.setUserId(currentUserId);
        log.setCompanyId(updated.getId());
        log.setAction(newStatus.equals("ACTIVE") ? "ACTIVATE_COMPANY" : "SUSPEND_COMPANY");
        log.setEntityType("COMPANY");
        log.setEntityId(updated.getId());
        log.setOldValue("Status: " + oldStatus);
        log.setNewValue("Status: " + newStatus);
        auditLogRepository.save(log);

        return mapToResponse(updated);
    }

    private CompanyResponse mapToResponse(Company company) {
        CompanyResponse response = new CompanyResponse();
        response.setId(company.getId());
        response.setName(company.getName());
        response.setCompanyCode(company.getCompanyCode());
        response.setContactInformation(company.getContactInformation());
        response.setAddress(company.getAddress());
        response.setStatus(company.getStatus());
        response.setCreatedAt(company.getCreatedAt());
        response.setUpdatedAt(company.getUpdatedAt());

        // Compute relational counts
        int departmentsCount = departmentRepository.findByCompanyId(company.getId()).size();
        int roomsCount = roomRepository.findByCompanyId(company.getId()).size();
        int adminsCount = (int) userRepository.findByCompanyId(company.getId()).stream()
                .filter(u -> u.getRole() == Role.COMPANY_ADMIN)
                .count();

        response.setDepartmentsCount(departmentsCount);
        response.setRoomsCount(roomsCount);
        response.setAdminsCount(adminsCount);

        return response;
    }
}
