package com.javatechgroup.booking.controller;

import com.javatechgroup.booking.common.ApiResponse;
import com.javatechgroup.booking.dto.BookingPolicyRequest;
import com.javatechgroup.booking.dto.BookingPolicyResponse;
import com.javatechgroup.booking.security.UserPrincipal;
import com.javatechgroup.booking.service.FacilityPolicyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/facility/policy")
public class FacilityPolicyController {

    private final FacilityPolicyService policyService;

    public FacilityPolicyController(FacilityPolicyService policyService) {
        this.policyService = policyService;
    }

    private Long resolveCompanyId(UserPrincipal currentUser, Long requestedCompanyId) {
        if (currentUser != null && currentUser.getCompanyId() != null) {
            return currentUser.getCompanyId();
        }
        return requestedCompanyId != null ? requestedCompanyId : 1L;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<BookingPolicyResponse>> getPolicy(
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        BookingPolicyResponse response = policyService.getPolicy(resolvedCompanyId);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking policy fetched successfully"));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<BookingPolicyResponse>> updatePolicy(
            @Valid @RequestBody BookingPolicyRequest request,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, request.getCompanyId() != null ? request.getCompanyId() : companyId);
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        BookingPolicyResponse response = policyService.updatePolicy(resolvedCompanyId, request, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking policy updated successfully"));
    }
}
