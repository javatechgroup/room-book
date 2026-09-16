package com.magicbricks.booking.controller;

import com.magicbricks.booking.common.ApiResponse;
import com.magicbricks.booking.common.PageResponse;
import com.magicbricks.booking.dto.AdminRegistrationRequest;
import com.magicbricks.booking.dto.AdminResponse;
import com.magicbricks.booking.dto.AdminUpdateRequest;
import com.magicbricks.booking.dto.BulkStatusUpdateRequest;
import com.magicbricks.booking.security.UserPrincipal;
import com.magicbricks.booking.service.AdminService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/facility-admins")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminResponse>> createFacilityAdmin(
            @Valid @RequestBody AdminRegistrationRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        AdminResponse response = adminService.createFacilityAdmin(request, userId);
        return new ResponseEntity<>(ApiResponse.success(response, "Facility Administrator created successfully"), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminResponse>>> getFacilityAdmins(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "ALL") String companyFilter,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "fullName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        PageResponse<AdminResponse> pageResponse = adminService.getFacilityAdminsPaginated(page, size, search, companyFilter, status, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(pageResponse, "Facility Administrators fetched successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminResponse>> getAdminById(@PathVariable Long id) {
        AdminResponse response = adminService.getAdminById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Facility Administrator retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminResponse>> updateFacilityAdmin(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        AdminResponse response = adminService.updateFacilityAdmin(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Facility Administrator updated successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminResponse>> toggleAdminStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        AdminResponse response = adminService.toggleAdminStatus(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Facility Administrator status updated successfully"));
    }

    @PatchMapping("/bulk/status")
    public ResponseEntity<ApiResponse<List<AdminResponse>>> bulkUpdateAdminStatus(
            @Valid @RequestBody BulkStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        List<AdminResponse> response = adminService.bulkUpdateAdminStatus(request.getIds(), request.getStatus(), userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Bulk Facility Administrator status updated successfully"));
    }
}
