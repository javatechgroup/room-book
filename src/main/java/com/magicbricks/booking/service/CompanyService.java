package com.magicbricks.booking.service;

import com.magicbricks.booking.common.BookingConflictException;
import com.magicbricks.booking.common.PageResponse;
import com.magicbricks.booking.common.ResourceNotFoundException;
import com.magicbricks.booking.domain.*;
import com.magicbricks.booking.dto.CompanyRegistrationRequest;
import com.magicbricks.booking.dto.CompanyResponse;
import com.magicbricks.booking.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
            List<String> suggestions = suggestAvailableCompanyCodes(request.getName(), companyCode);
            String suggestionsStr = String.join(", ", suggestions);
            java.util.Map<String, String> details = new java.util.HashMap<>();
            details.put("suggestedCodes", suggestionsStr);
            throw new BookingConflictException(
                    "Company with code '" + companyCode + "' already exists. Available suggestions: " + suggestionsStr,
                    details
            );
        }

        // 1. Create and save Company
        Company company = new Company();
        company.setName(request.getName().trim());
        company.setCompanyCode(companyCode);
        company.setContactInformation(request.getContactInformation().trim());
        company.setPhone(request.getPhone());
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
    public PageResponse<CompanyResponse> getCompaniesPaginated(int page, int size, String search, String status, String sortBy, String sortDir) {
        int pageIndex = page > 0 ? page - 1 : 0; // 1-indexed to 0-indexed conversion
        int pageSize = size > 0 ? size : 10;

        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortProperty = "name";
        if ("companyCode".equalsIgnoreCase(sortBy)) sortProperty = "companyCode";
        else if ("status".equalsIgnoreCase(sortBy)) sortProperty = "status";
        else if ("id".equalsIgnoreCase(sortBy)) sortProperty = "id";
        else if ("createdAt".equalsIgnoreCase(sortBy)) sortProperty = "createdAt";

        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(direction, sortProperty));

        Page<Company> companyPage;
        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasStatus = status != null && !"ALL".equalsIgnoreCase(status.trim());

        if (!hasSearch && !hasStatus) {
            // 1. Direct indexed table scan with sorting
            companyPage = companyRepository.findAll(pageable);
        } else if (!hasSearch && hasStatus) {
            // 2. Direct indexed lookup on status (uses idx_companies_status_name)
            companyPage = companyRepository.findByStatus(status.trim().toUpperCase(), pageable);
        } else {
            // 3. Filtered keyword search
            companyPage = companyRepository.searchCompanies(
                    search.trim(),
                    hasStatus ? status.trim().toUpperCase() : "ALL",
                    pageable
            );
        }

        List<CompanyResponse> content = companyPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                pageIndex + 1,
                companyPage.getSize(),
                companyPage.getTotalElements(),
                companyPage.getTotalPages(),
                companyPage.isFirst(),
                companyPage.isLast()
        );
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
        company.setPhone(request.getPhone());
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

    @Transactional
    public List<CompanyResponse> bulkUpdateCompanyStatus(List<Long> companyIds, String status, Long currentUserId) {
        if (companyIds == null || companyIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        String targetStatus = "ACTIVE".equalsIgnoreCase(status) ? "ACTIVE" : "INACTIVE";
        List<Company> companies = companyRepository.findAllById(companyIds);
        List<Company> updatedCompanies = new java.util.ArrayList<>();

        for (Company company : companies) {
            String oldStatus = company.getStatus();
            company.setStatus(targetStatus);
            Company saved = companyRepository.save(company);
            updatedCompanies.add(saved);

            // Audit Log
            AuditLog log = new AuditLog();
            log.setUserId(currentUserId);
            log.setCompanyId(saved.getId());
            log.setAction(targetStatus.equals("ACTIVE") ? "ACTIVATE_COMPANY" : "SUSPEND_COMPANY");
            log.setEntityType("COMPANY");
            log.setEntityId(saved.getId());
            log.setOldValue("Bulk Status: " + oldStatus);
            log.setNewValue("Bulk Status: " + targetStatus);
            auditLogRepository.save(log);
        }

        return updatedCompanies.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> suggestAvailableCompanyCodes(String companyName, String baseCode) {
        java.util.Set<String> candidates = new java.util.LinkedHashSet<>();

        String cleanBase = (baseCode != null && !baseCode.trim().isEmpty())
                ? baseCode.trim().toUpperCase().replaceAll("[^A-Z0-9]", "")
                : "";

        if (cleanBase.isEmpty() && companyName != null && !companyName.trim().isEmpty()) {
            String[] words = companyName.trim().split("\\s+");
            if (words.length == 1) {
                cleanBase = words[0].toUpperCase().replaceAll("[^A-Z0-9]", "");
            } else {
                StringBuilder acronym = new StringBuilder();
                for (String w : words) {
                    if (!w.isEmpty()) {
                        acronym.append(Character.toUpperCase(w.charAt(0)));
                    }
                }
                cleanBase = acronym.toString();
            }
        }

        if (cleanBase.isEmpty()) {
            cleanBase = "CORP";
        }

        if (cleanBase.length() > 6) {
            cleanBase = cleanBase.substring(0, 6);
        }

        // Generate smart corporate prefix/suffix combinations
        candidates.add(cleanBase + "-HQ");
        candidates.add(cleanBase + "-CORP");
        candidates.add(cleanBase + "2");
        candidates.add(cleanBase + "-TECH");
        candidates.add(cleanBase + "-GL");
        candidates.add(cleanBase + "99");
        candidates.add(cleanBase + "-01");

        return candidates.stream()
                .filter(code -> code.length() <= 10)
                .filter(code -> !companyRepository.existsByCompanyCode(code))
                .limit(4)
                .collect(Collectors.toList());
    }

    private CompanyResponse mapToResponse(Company company) {
        CompanyResponse response = new CompanyResponse();
        response.setId(company.getId());
        response.setName(company.getName());
        response.setCompanyCode(company.getCompanyCode());
        response.setContactInformation(company.getContactInformation());
        response.setPhone(company.getPhone());
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
