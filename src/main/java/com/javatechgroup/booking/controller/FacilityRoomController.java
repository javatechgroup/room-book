package com.javatechgroup.booking.controller;

import com.javatechgroup.booking.common.ApiResponse;
import com.javatechgroup.booking.common.PageResponse;
import com.javatechgroup.booking.dto.BulkStatusUpdateRequest;
import com.javatechgroup.booking.dto.RoomRequest;
import com.javatechgroup.booking.dto.RoomResponse;
import com.javatechgroup.booking.security.UserPrincipal;
import com.javatechgroup.booking.service.FacilityRoomService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facility/rooms")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE')")
public class FacilityRoomController {

    private final FacilityRoomService roomService;

    public FacilityRoomController(FacilityRoomService roomService) {
        this.roomService = roomService;
    }

    private Long resolveCompanyId(UserPrincipal currentUser, Long requestedCompanyId) {
        if (currentUser != null && currentUser.getCompanyId() != null) {
            return currentUser.getCompanyId();
        }
        return requestedCompanyId != null ? requestedCompanyId : 1L;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<RoomResponse>> createRoom(
            @Valid @RequestBody RoomRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long companyId = resolveCompanyId(currentUser, request.getCompanyId());
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        RoomResponse response = roomService.createRoom(request, companyId, userId);
        return new ResponseEntity<>(ApiResponse.success(response, "Room created successfully"), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<RoomResponse>>> getRooms(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "ALL") String floor,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        PageResponse<RoomResponse> pageResponse = roomService.getRoomsPaginated(
                resolvedCompanyId, page, size, search, floor, status, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(pageResponse, "Rooms fetched successfully"));
    }

    @GetMapping("/floors")
    public ResponseEntity<ApiResponse<List<String>>> getFloors(
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        List<String> floors = roomService.getDistinctFloors(resolvedCompanyId);
        return ResponseEntity.ok(ApiResponse.success(floors, "Distinct floors fetched successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomResponse>> getRoomById(
            @PathVariable Long id,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        RoomResponse response = roomService.getRoomById(id, resolvedCompanyId);
        return ResponseEntity.ok(ApiResponse.success(response, "Room fetched successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<RoomResponse>> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody RoomRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, request.getCompanyId());
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        RoomResponse response = roomService.updateRoom(id, request, resolvedCompanyId, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Room updated successfully"));
    }

    @PatchMapping("/{id}/maintenance")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<RoomResponse>> toggleMaintenance(
            @PathVariable Long id,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        RoomResponse response = roomService.toggleMaintenance(id, resolvedCompanyId, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Room maintenance status toggled successfully"));
    }

    @PatchMapping("/bulk/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> bulkUpdateStatus(
            @Valid @RequestBody BulkStatusUpdateRequest request,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        List<RoomResponse> response = roomService.bulkUpdateStatus(request.getIds(), request.getStatus(), resolvedCompanyId, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Bulk room status updated successfully"));
    }
}
