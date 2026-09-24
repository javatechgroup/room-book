package com.javatechgroup.booking.controller;

import com.javatechgroup.booking.common.ApiResponse;
import com.javatechgroup.booking.dto.FacilitySummaryResponse;
import com.javatechgroup.booking.security.UserPrincipal;
import com.javatechgroup.booking.service.FacilityDirectoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/facility")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE')")
public class FacilityDirectoryController {

    private final FacilityDirectoryService directoryService;

    public FacilityDirectoryController(FacilityDirectoryService directoryService) {
        this.directoryService = directoryService;
    }

    private Long resolveCompanyId(UserPrincipal currentUser, Long requestedCompanyId) {
        if (currentUser != null && currentUser.getCompanyId() != null) {
            return currentUser.getCompanyId();
        }
        return requestedCompanyId != null ? requestedCompanyId : 1L;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<FacilitySummaryResponse>> getSummary(
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        FacilitySummaryResponse response = directoryService.getFacilitySummary(resolvedCompanyId);
        return ResponseEntity.ok(ApiResponse.success(response, "Facility summary metrics retrieved"));
    }

    @GetMapping("/directory")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDirectory(
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        Map<String, Object> response = directoryService.getCompanyDirectory(resolvedCompanyId);
        return ResponseEntity.ok(ApiResponse.success(response, "Company directory retrieved"));
    }

    @GetMapping("/employees/search")
    public ResponseEntity<ApiResponse<java.util.List<com.javatechgroup.booking.dto.EmployeeResponse>>> searchEmployees(
            @RequestParam(required = false) String query,
            @RequestParam(required = false, defaultValue = "15") int limit,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        java.util.List<com.javatechgroup.booking.dto.EmployeeResponse> response = directoryService.searchCompanyEmployees(resolvedCompanyId, query, limit);
        return ResponseEntity.ok(ApiResponse.success(response, "Employee directory search retrieved"));
    }
}
