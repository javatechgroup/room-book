package com.magicbricks.booking.controller;

import com.magicbricks.booking.common.ApiResponse;
import com.magicbricks.booking.common.PageResponse;
import com.magicbricks.booking.domain.Role;
import com.magicbricks.booking.dto.BookingRequest;
import com.magicbricks.booking.dto.BookingResponse;
import com.magicbricks.booking.security.UserPrincipal;
import com.magicbricks.booking.service.FacilityBookingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/facility/bookings")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE')")
public class FacilityBookingController {

    private final FacilityBookingService bookingService;

    public FacilityBookingController(FacilityBookingService bookingService) {
        this.bookingService = bookingService;
    }

    private Long resolveCompanyId(UserPrincipal currentUser, Long requestedCompanyId) {
        if (currentUser != null && currentUser.getCompanyId() != null) {
            return currentUser.getCompanyId();
        }
        return requestedCompanyId != null ? requestedCompanyId : 1L;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long companyId = resolveCompanyId(currentUser, request.getCompanyId());
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        BookingResponse response = bookingService.createBooking(request, companyId, userId);
        return new ResponseEntity<>(ApiResponse.success(response, "Room reserved successfully"), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        boolean isAdmin = currentUser != null && (currentUser.getRole() == Role.SUPER_ADMIN || currentUser.getRole() == Role.COMPANY_ADMIN);
        BookingResponse response = bookingService.cancelBooking(id, resolvedCompanyId, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "Reservation cancelled and room slot released"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, request.getCompanyId());
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        boolean isAdmin = currentUser != null && (currentUser.getRole() == Role.SUPER_ADMIN || currentUser.getRole() == Role.COMPANY_ADMIN);
        BookingResponse response = bookingService.updateBooking(id, request, resolvedCompanyId, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "Reservation updated successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getBookings(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long roomId,
            @RequestParam(defaultValue = "ALL") String floor,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(required = false) Long bookerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "startTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        PageResponse<BookingResponse> pageResponse = bookingService.getBookingsPaginated(
                resolvedCompanyId, page, size, search, roomId, floor, status, bookerId, date, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(pageResponse, "Bookings fetched successfully"));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        List<BookingResponse> response = bookingService.getMyBookings(resolvedCompanyId, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "My reservations fetched successfully"));
    }

    @GetMapping("/occupancy")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getOccupancyForDay(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long companyId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long resolvedCompanyId = resolveCompanyId(currentUser, companyId);
        List<BookingResponse> response = bookingService.getLiveOccupancyForDay(resolvedCompanyId, date);
        return ResponseEntity.ok(ApiResponse.success(response, "Live room occupancy fetched successfully"));
    }
}
