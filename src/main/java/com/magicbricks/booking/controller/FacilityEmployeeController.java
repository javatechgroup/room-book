package com.magicbricks.booking.controller;

import com.magicbricks.booking.common.ApiResponse;
import com.magicbricks.booking.common.PageResponse;
import com.magicbricks.booking.dto.BulkStatusUpdateRequest;
import com.magicbricks.booking.dto.EmployeeRequest;
import com.magicbricks.booking.dto.EmployeeResponse;
import com.magicbricks.booking.security.UserPrincipal;
import com.magicbricks.booking.service.FacilityEmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facility/employees")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN')")
public class FacilityEmployeeController {

    private final FacilityEmployeeService employeeService;

    public FacilityEmployeeController(FacilityEmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    private Long resolveCompanyId(UserPrincipal currentUser, Long requestedCompanyId) {
        if (currentUser != null && currentUser.getCompanyId() != null) {
            return currentUser.getCompanyId();
        }
        return requestedCompanyId != null ? requestedCompanyId : 1L;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @Valid @RequestBody EmployeeRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long companyId = resolveCompanyId(currentUser, request.getCompanyId());
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        EmployeeResponse response = employeeService.createEmployee(request, companyId, userId);
        return new ResponseEntity<>(ApiResponse.success(response, "Employee created successfully"), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<EmployeeResponse>>> getEmployees(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(defaultValue = "ALL") String role,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "fullName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        PageResponse<EmployeeResponse> pageResponse = employeeService.getEmployeesPaginated(
                resolvedCompanyId, page, size, search, departmentId, role, status, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(pageResponse, "Employees fetched successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeById(
            @PathVariable Long id,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        EmployeeResponse response = employeeService.getEmployeeById(id, resolvedCompanyId);
        return ResponseEntity.ok(ApiResponse.success(response, "Employee fetched successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, request.getCompanyId());
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        EmployeeResponse response = employeeService.updateEmployee(id, request, resolvedCompanyId, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Employee updated successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<EmployeeResponse>> toggleStatus(
            @PathVariable Long id,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        EmployeeResponse response = employeeService.toggleEmployeeStatus(id, resolvedCompanyId, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Employee status toggled successfully"));
    }

    @PatchMapping("/bulk/status")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> bulkUpdateStatus(
            @Valid @RequestBody BulkStatusUpdateRequest request,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        List<EmployeeResponse> response = employeeService.bulkUpdateStatus(request.getIds(), request.getStatus(), resolvedCompanyId, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Bulk employee status updated successfully"));
    }
}
