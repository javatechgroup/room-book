package com.javatechgroup.booking.controller;

import com.javatechgroup.booking.common.ApiResponse;
import com.javatechgroup.booking.common.PageResponse;
import com.javatechgroup.booking.dto.FloorRequest;
import com.javatechgroup.booking.dto.FloorResponse;
import com.javatechgroup.booking.security.UserPrincipal;
import com.javatechgroup.booking.service.FacilityFloorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facility/floors")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE')")
public class FacilityFloorController {

    private final FacilityFloorService floorService;

    public FacilityFloorController(FacilityFloorService floorService) {
        this.floorService = floorService;
    }

    private Long resolveCompanyId(UserPrincipal currentUser, Long requestedCompanyId) {
        if (currentUser != null && currentUser.getCompanyId() != null) {
            return currentUser.getCompanyId();
        }
        return requestedCompanyId != null ? requestedCompanyId : 1L;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<FloorResponse>> createFloor(
            @Valid @RequestBody FloorRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long companyId = resolveCompanyId(currentUser, request.getCompanyId());
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        FloorResponse response = floorService.createFloor(request, companyId, userId);
        return new ResponseEntity<>(ApiResponse.success(response, "Floor created successfully"), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<FloorResponse>>> getFloors(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        PageResponse<FloorResponse> pageResponse = floorService.getFloorsPaginated(
                resolvedCompanyId, page, size, search, status, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(pageResponse, "Floors fetched successfully"));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<FloorResponse>>> getAllFloors(
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        List<FloorResponse> response = floorService.getAllFloors(resolvedCompanyId);
        return ResponseEntity.ok(ApiResponse.success(response, "All active floors fetched successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FloorResponse>> getFloorById(
            @PathVariable Long id,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        FloorResponse response = floorService.getFloorById(id, resolvedCompanyId);
        return ResponseEntity.ok(ApiResponse.success(response, "Floor fetched successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<FloorResponse>> updateFloor(
            @PathVariable Long id,
            @Valid @RequestBody FloorRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, request.getCompanyId());
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        FloorResponse response = floorService.updateFloor(id, request, resolvedCompanyId, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Floor updated successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<FloorResponse>> toggleStatus(
            @PathVariable Long id,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        FloorResponse response = floorService.toggleFloorStatus(id, resolvedCompanyId, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Floor status toggled successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFloor(
            @PathVariable Long id,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        floorService.deleteFloor(id, resolvedCompanyId, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Floor deleted successfully"));
    }
}
