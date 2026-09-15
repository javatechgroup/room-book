package com.magicbricks.booking.controller;

import com.magicbricks.booking.common.ApiResponse;
import com.magicbricks.booking.dto.CompanyRegistrationRequest;
import com.magicbricks.booking.dto.CompanyResponse;
import com.magicbricks.booking.security.UserPrincipal;
import com.magicbricks.booking.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getAllCompanies() {
        List<CompanyResponse> list = companyService.getAllCompanies();
        return ResponseEntity.ok(ApiResponse.success(list, "Companies fetched successfully"));
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
}
