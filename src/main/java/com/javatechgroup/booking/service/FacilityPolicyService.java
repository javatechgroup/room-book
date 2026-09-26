package com.javatechgroup.booking.service;

import com.javatechgroup.booking.common.ResourceNotFoundException;
import com.javatechgroup.booking.domain.AuditLog;
import com.javatechgroup.booking.domain.BookingPolicy;
import com.javatechgroup.booking.domain.Company;
import com.javatechgroup.booking.dto.BookingPolicyRequest;
import com.javatechgroup.booking.dto.BookingPolicyResponse;
import com.javatechgroup.booking.repository.AuditLogRepository;
import com.javatechgroup.booking.repository.BookingPolicyRepository;
import com.javatechgroup.booking.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class FacilityPolicyService {

    private final BookingPolicyRepository policyRepository;
    private final CompanyRepository companyRepository;
    private final AuditLogRepository auditLogRepository;

    public FacilityPolicyService(BookingPolicyRepository policyRepository,
                                 CompanyRepository companyRepository,
                                 AuditLogRepository auditLogRepository) {
        this.policyRepository = policyRepository;
        this.companyRepository = companyRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public BookingPolicy getOrCreateDefaultPolicy(Long companyId) {
        return policyRepository.findByCompanyId(companyId).orElseGet(() -> {
            Company company = companyRepository.findById(companyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + companyId));
            BookingPolicy defaultPolicy = new BookingPolicy();
            defaultPolicy.setCompany(company);
            defaultPolicy.setMaxAdvanceBookingDays(30);
            defaultPolicy.setMinBookingDurationMinutes(30);
            defaultPolicy.setMaxBookingDurationHours(4);
            defaultPolicy.setCancellationCutoffMinutes(30);
            return policyRepository.save(defaultPolicy);
        });
    }

    @Transactional(readOnly = true)
    public BookingPolicyResponse getPolicy(Long companyId) {
        BookingPolicy policy = policyRepository.findByCompanyId(companyId).orElse(null);
        if (policy == null) {
            Company company = companyRepository.findById(companyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + companyId));
            BookingPolicy virtualDefault = new BookingPolicy();
            virtualDefault.setCompany(company);
            virtualDefault.setMaxAdvanceBookingDays(30);
            virtualDefault.setMinBookingDurationMinutes(30);
            virtualDefault.setMaxBookingDurationHours(4);
            virtualDefault.setCancellationCutoffMinutes(30);
            return mapToResponse(virtualDefault);
        }
        return mapToResponse(policy);
    }

    @Transactional
    public BookingPolicyResponse updatePolicy(Long companyId, BookingPolicyRequest request, Long currentUserId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + companyId));

        BookingPolicy policy = policyRepository.findByCompanyId(companyId).orElseGet(() -> {
            BookingPolicy p = new BookingPolicy();
            p.setCompany(company);
            return p;
        });

        String oldValue = String.format("Advance: %dd, MinDuration: %dm, MaxDuration: %dh, Cutoff: %dm",
                policy.getMaxAdvanceBookingDays() != null ? policy.getMaxAdvanceBookingDays() : 30,
                policy.getMinBookingDurationMinutes() != null ? policy.getMinBookingDurationMinutes() : 30,
                policy.getMaxBookingDurationHours() != null ? policy.getMaxBookingDurationHours() : 4,
                policy.getCancellationCutoffMinutes() != null ? policy.getCancellationCutoffMinutes() : 30);

        policy.setMaxAdvanceBookingDays(request.getMaxAdvanceBookingDays());
        policy.setMinBookingDurationMinutes(request.getMinBookingDurationMinutes());
        policy.setMaxBookingDurationHours(request.getMaxBookingDurationHours());
        policy.setCancellationCutoffMinutes(request.getCancellationCutoffMinutes());

        BookingPolicy saved = policyRepository.save(policy);

        String newValue = String.format("Advance: %dd, MinDuration: %dm, MaxDuration: %dh, Cutoff: %dm",
                saved.getMaxAdvanceBookingDays(),
                saved.getMinBookingDurationMinutes(),
                saved.getMaxBookingDurationHours(),
                saved.getCancellationCutoffMinutes());

        AuditLog log = new AuditLog();
        log.setUserId(currentUserId);
        log.setCompanyId(companyId);
        log.setAction("UPDATE_BOOKING_POLICY");
        log.setEntityType("BOOKING_POLICY");
        log.setEntityId(saved.getId());
        log.setOldValue(oldValue);
        log.setNewValue("Updated booking policy: " + newValue);
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);

        return mapToResponse(saved);
    }

    private BookingPolicyResponse mapToResponse(BookingPolicy policy) {
        BookingPolicyResponse response = new BookingPolicyResponse();
        response.setId(policy.getId());
        response.setCompanyId(policy.getCompany() != null ? policy.getCompany().getId() : null);
        response.setCompanyName(policy.getCompany() != null ? policy.getCompany().getName() : "");
        response.setMaxAdvanceBookingDays(policy.getMaxAdvanceBookingDays() != null ? policy.getMaxAdvanceBookingDays() : 30);
        response.setMinBookingDurationMinutes(policy.getMinBookingDurationMinutes() != null ? policy.getMinBookingDurationMinutes() : 30);
        response.setMaxBookingDurationHours(policy.getMaxBookingDurationHours() != null ? policy.getMaxBookingDurationHours() : 4);
        response.setCancellationCutoffMinutes(policy.getCancellationCutoffMinutes() != null ? policy.getCancellationCutoffMinutes() : 30);
        response.setCreatedAt(policy.getCreatedAt());
        response.setUpdatedAt(policy.getUpdatedAt());
        return response;
    }
}
