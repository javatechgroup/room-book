package com.javatechgroup.booking.service;

import com.javatechgroup.booking.common.PageResponse;
import com.javatechgroup.booking.domain.AuditLog;
import com.javatechgroup.booking.domain.Company;
import com.javatechgroup.booking.domain.User;
import com.javatechgroup.booking.dto.AuditLogResponse;
import com.javatechgroup.booking.repository.AuditLogRepository;
import com.javatechgroup.booking.repository.CompanyRepository;
import com.javatechgroup.booking.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    public AuditLogService(AuditLogRepository auditLogRepository,
                           UserRepository userRepository,
                           CompanyRepository companyRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAuditLogsPaginated(
            int page,
            int size,
            String search,
            String action,
            String entityType,
            Long companyId,
            String sortBy,
            String sortDir) {

        int pageIndex = page > 0 ? page - 1 : 0;
        int pageSize = size > 0 ? size : 10;

        String safeSortBy = "timestamp";
        if ("action".equalsIgnoreCase(sortBy)) safeSortBy = "action";
        else if ("entityType".equalsIgnoreCase(sortBy)) safeSortBy = "entityType";
        else if ("id".equalsIgnoreCase(sortBy)) safeSortBy = "id";

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(direction, safeSortBy));

        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String cleanAction = (action != null && !action.trim().isEmpty()) ? action.trim().toUpperCase() : "ALL";
        String cleanEntityType = (entityType != null && !entityType.trim().isEmpty()) ? entityType.trim().toUpperCase() : "ALL";

        Page<AuditLog> auditPage = auditLogRepository.searchAuditLogs(cleanAction, cleanEntityType, companyId, cleanSearch, pageable);

        // Pre-fetch user and company lookups for efficient mapping
        Map<Long, User> userCache = new ConcurrentHashMap<>();
        Map<Long, Company> companyCache = new ConcurrentHashMap<>();

        List<AuditLogResponse> content = auditPage.getContent().stream()
                .map(log -> mapToResponse(log, userCache, companyCache))
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                auditPage.getNumber() + 1,
                auditPage.getSize(),
                auditPage.getTotalElements(),
                auditPage.getTotalPages(),
                auditPage.isFirst(),
                auditPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public List<String> getDistinctActions() {
        return auditLogRepository.findDistinctActions();
    }

    @Transactional(readOnly = true)
    public List<String> getDistinctEntityTypes() {
        return auditLogRepository.findDistinctEntityTypes();
    }

    @Transactional
    public AuditLog recordAuditLog(Long userId, Long companyId, String action, String entityType, Long entityId, String oldValue, String newValue) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setCompanyId(companyId);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setTimestamp(LocalDateTime.now());
        return auditLogRepository.save(log);
    }

    private AuditLogResponse mapToResponse(AuditLog log, Map<Long, User> userCache, Map<Long, Company> companyCache) {
        AuditLogResponse response = new AuditLogResponse();
        response.setId(log.getId());
        response.setUserId(log.getUserId());
        response.setCompanyId(log.getCompanyId());
        response.setAction(log.getAction());
        response.setEntityType(log.getEntityType());
        response.setEntityId(log.getEntityId());
        response.setOldValue(log.getOldValue());
        response.setNewValue(log.getNewValue());
        response.setTimestamp(log.getTimestamp());

        if (log.getTimestamp() != null) {
            response.setFormattedTimestamp(log.getTimestamp().format(FORMATTER));
        } else {
            response.setFormattedTimestamp(LocalDateTime.now().format(FORMATTER));
        }

        // Determine Performed By display
        if (log.getUserId() != null) {
            User user = userCache.computeIfAbsent(log.getUserId(), id -> userRepository.findById(id).orElse(null));
            if (user != null) {
                response.setPerformedBy(user.getFullName() + " (" + user.getEmail() + ")");
            } else {
                response.setPerformedBy("User #" + log.getUserId());
            }
        } else {
            response.setPerformedBy("System Automated Process");
        }

        // Determine Company display
        if (log.getCompanyId() != null) {
            Company comp = companyCache.computeIfAbsent(log.getCompanyId(), id -> companyRepository.findById(id).orElse(null));
            if (comp != null) {
                response.setCompanyName(comp.getName() + " (" + comp.getCompanyCode() + ")");
            } else {
                response.setCompanyName("Company #" + log.getCompanyId());
            }
        } else {
            response.setCompanyName("System-wide Scope");
        }

        // Extract Entity Name and human-friendly Details
        String entityName = "Resource #" + (log.getEntityId() != null ? log.getEntityId() : log.getId());
        String details = log.getNewValue() != null ? log.getNewValue() : (log.getOldValue() != null ? log.getOldValue() : "Audit event recorded");

        if (log.getNewValue() != null && log.getNewValue().contains("Registered company: ")) {
            entityName = log.getNewValue().replace("Registered company: ", "");
        } else if (log.getNewValue() != null && log.getNewValue().contains("Created Facility Admin: ")) {
            entityName = log.getNewValue().replace("Created Facility Admin: ", "");
        } else if (log.getNewValue() != null && log.getNewValue().contains("Updated Facility Admin: ")) {
            entityName = log.getNewValue().replace("Updated Facility Admin: ", "");
        } else if ("COMPANY".equalsIgnoreCase(log.getEntityType()) && response.getCompanyName() != null && !"System-wide Scope".equals(response.getCompanyName())) {
            entityName = response.getCompanyName();
        }

        response.setEntityName(entityName);
        response.setDetails(details);

        return response;
    }
}
