package com.magicbricks.booking.controller;

import com.magicbricks.booking.common.ApiResponse;
import com.magicbricks.booking.common.PageResponse;
import com.magicbricks.booking.dto.DepartmentRequest;
import com.magicbricks.booking.dto.DepartmentResponse;
import com.magicbricks.booking.security.UserPrincipal;
import com.magicbricks.booking.service.FacilityDepartmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facility/departments")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE')")
public class FacilityDepartmentController {

    private final FacilityDepartmentService departmentService;

    public FacilityDepartmentController(FacilityDepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    private Long resolveCompanyId(UserPrincipal currentUser, Long requestedCompanyId) {
        if (currentUser != null && currentUser.getCompanyId() != null) {
            return currentUser.getCompanyId();
        }
        return requestedCompanyId != null ? requestedCompanyId : 1L;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponse>> createDepartment(
            @Valid @RequestBody DepartmentRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long companyId = resolveCompanyId(currentUser, request.getCompanyId());
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        DepartmentResponse response = departmentService.createDepartment(request, companyId, userId);
        return new ResponseEntity<>(ApiResponse.success(response, "Department created successfully"), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<DepartmentResponse>>> getDepartments(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        PageResponse<DepartmentResponse> pageResponse = departmentService.getDepartmentsPaginated(
                resolvedCompanyId, page, size, search, status, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(pageResponse, "Departments fetched successfully"));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getAllDepartments(
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        List<DepartmentResponse> response = departmentService.getAllDepartments(resolvedCompanyId);
        return ResponseEntity.ok(ApiResponse.success(response, "All departments fetched successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> getDepartmentById(
            @PathVariable Long id,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        DepartmentResponse response = departmentService.getDepartmentById(id, resolvedCompanyId);
        return ResponseEntity.ok(ApiResponse.success(response, "Department fetched successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponse>> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, request.getCompanyId());
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        DepartmentResponse response = departmentService.updateDepartment(id, request, resolvedCompanyId, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Department updated successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponse>> toggleStatus(
            @PathVariable Long id,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        DepartmentResponse response = departmentService.toggleDepartmentStatus(id, resolvedCompanyId, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Department status toggled successfully"));
    }
}
