package com.javatechgroup.booking.controller;

import com.javatechgroup.booking.common.ApiResponse;
import com.javatechgroup.booking.common.PageResponse;
import com.javatechgroup.booking.dto.BulkStatusUpdateRequest;
import com.javatechgroup.booking.dto.CompanyRegistrationRequest;
import com.javatechgroup.booking.dto.CompanyResponse;
import com.javatechgroup.booking.security.UserPrincipal;
import com.javatechgroup.booking.service.CompanyService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/companies")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CompanyResponse>> registerCompany(
            @Valid @RequestBody CompanyRegistrationRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        CompanyResponse response = companyService.registerCompany(request, userId);
        return new ResponseEntity<>(ApiResponse.success(response, "Company registered successfully"), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CompanyResponse>>> getCompanies(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        PageResponse<CompanyResponse> pageResponse = companyService.getCompaniesPaginated(page, size, search, status, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(pageResponse, "Companies fetched successfully"));
    }

    @GetMapping("/suggest-code")
    public ResponseEntity<ApiResponse<java.util.List<String>>> suggestCompanyCode(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String baseCode) {
        java.util.List<String> suggestions = companyService.suggestAvailableCompanyCodes(name, baseCode);
        return ResponseEntity.ok(ApiResponse.success(suggestions, "Available company code suggestions retrieved"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyById(@PathVariable Long id) {
        CompanyResponse response = companyService.getCompanyById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Company retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody CompanyRegistrationRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        CompanyResponse response = companyService.updateCompany(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Company updated successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CompanyResponse>> toggleCompanyStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        CompanyResponse response = companyService.toggleCompanyStatus(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Company status updated successfully"));
    }

    @PatchMapping("/bulk/status")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> bulkUpdateCompanyStatus(
            @Valid @RequestBody BulkStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        List<CompanyResponse> response = companyService.bulkUpdateCompanyStatus(request.getIds(), request.getStatus(), userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Bulk company status updated successfully"));
    }
}
