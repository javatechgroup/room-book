package com.magicbricks.booking.service;

import com.magicbricks.booking.common.BookingConflictException;
import com.magicbricks.booking.common.PageResponse;
import com.magicbricks.booking.common.ResourceNotFoundException;
import com.magicbricks.booking.common.UnauthorizedAccessException;
import com.magicbricks.booking.domain.*;
import com.magicbricks.booking.dto.BookingRequest;
import com.magicbricks.booking.dto.BookingResponse;
import com.magicbricks.booking.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacilityBookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final AuditLogRepository auditLogRepository;

    public FacilityBookingService(BookingRepository bookingRepository,
                                  RoomRepository roomRepository,
                                  UserRepository userRepository,
                                  CompanyRepository companyRepository,
                                  AuditLogRepository auditLogRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request, Long companyId, Long currentUserId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + companyId));

        Room room = roomRepository.findById(request.getRoomId())
                .filter(r -> r.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + request.getRoomId()));

        if ("MAINTENANCE".equalsIgnoreCase(room.getStatus())) {
            throw new BookingConflictException("Room '" + room.getName() + "' is currently under maintenance and unavailable for booking.");
        }

        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().isEqual(request.getEndTime())) {
            throw new BookingConflictException("End time must be strictly after start time.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (request.getStartTime().isBefore(now)) {
            throw new BookingConflictException("Cannot book a room in the past. Please select a future date and time.");
        }

        // Conflict check
        List<Booking> conflicts = bookingRepository.findConflictingBookings(room.getId(), request.getStartTime(), request.getEndTime());
        if (!conflicts.isEmpty()) {
            Booking conflict = conflicts.get(0);
            throw new BookingConflictException("Time slot overlaps with an existing confirmed reservation ('"
                    + conflict.getTitle() + "' by " + conflict.getBooker().getFullName() + "). Please choose another slot.");
        }

        User booker = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Booker user not found with ID: " + currentUserId));

        Booking booking = new Booking();
        booking.setCompany(company);
        booking.setRoom(room);
        booking.setBooker(booker);
        booking.setTitle(request.getTitle().trim());
        booking.setDescription(request.getDescription());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setStatus("CONFIRMED");

        Booking saved = bookingRepository.save(booking);

        AuditLog audit = new AuditLog();
        audit.setUserId(currentUserId);
        audit.setCompanyId(companyId);
        audit.setAction("CREATE_BOOKING");
        audit.setEntityType("BOOKING");
        audit.setEntityId(saved.getId());
        audit.setNewValue("Booked Room: " + room.getName() + " on " + room.getFloor() + " from " + saved.getStartTime() + " to " + saved.getEndTime() + " ('" + saved.getTitle() + "')");
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);

        return mapToResponse(saved);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long companyId, Long currentUserId, boolean isSuperAdminOrFacilityAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .filter(b -> b.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        // Facility Admin can cancel any company booking or specifically their own booking
        if (!isSuperAdminOrFacilityAdmin && !booking.getBooker().getId().equals(currentUserId)) {
            throw new UnauthorizedAccessException("You are only authorized to cancel bookings made by yourself.");
        }

        booking.setStatus("CANCELLED");
        Booking updated = bookingRepository.save(booking);

        AuditLog audit = new AuditLog();
        audit.setUserId(currentUserId);
        audit.setCompanyId(companyId);
        audit.setAction("CANCEL_BOOKING");
        audit.setEntityType("BOOKING");
        audit.setEntityId(updated.getId());
        audit.setNewValue("Cancelled Booking #" + updated.getId() + " for Room: " + updated.getRoom().getName());
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);

        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getBookingsPaginated(
            Long companyId,
            int page,
            int size,
            String search,
            Long roomId,
            String floor,
            String status,
            Long bookerId,
            LocalDate dateFilter,
            String sortBy,
            String sortDir) {

        int pageNum = Math.max(0, page - 1);
        int pageSize = Math.max(1, size);

        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortProperty = (sortBy == null || sortBy.isBlank()) ? "startTime" : sortBy;
        Pageable pageable = PageRequest.of(pageNum, pageSize, Sort.by(direction, sortProperty));

        String sanitizedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String floorFilter = (floor == null || floor.trim().isEmpty()) ? "ALL" : floor.trim();
        String statusFilter = (status == null || status.trim().isEmpty()) ? "ALL" : status.trim();

        LocalDateTime startFrom = null;
        LocalDateTime startTo = null;
        if (dateFilter != null) {
            startFrom = dateFilter.atStartOfDay();
            startTo = dateFilter.atTime(LocalTime.MAX);
        }

        Page<Booking> bookingPage = bookingRepository.searchBookings(
                companyId, roomId, floorFilter, statusFilter, bookerId, startFrom, startTo, sanitizedSearch, LocalDateTime.now(), pageable);

        List<BookingResponse> content = bookingPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                page,
                bookingPage.getSize(),
                bookingPage.getTotalElements(),
                bookingPage.getTotalPages(),
                bookingPage.isFirst(),
                bookingPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Long companyId, Long currentUserId) {
        return bookingRepository.findByBookerId(currentUserId).stream()
                .filter(b -> b.getCompany().getId().equals(companyId))
                .sorted((a, b) -> b.getStartTime().compareTo(a.getStartTime()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getLiveOccupancyForDay(Long companyId, LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        LocalDateTime dayStart = targetDate.atStartOfDay();
        LocalDateTime dayEnd = targetDate.atTime(LocalTime.MAX);

        return bookingRepository.findBookingsForDay(companyId, dayStart, dayEnd).stream()
                .filter(b -> !"CANCELLED".equalsIgnoreCase(b.getStatus()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse mapToResponse(Booking booking) {
        BookingResponse res = new BookingResponse();
        res.setId(booking.getId());
        if (booking.getCompany() != null) {
            res.setCompanyId(booking.getCompany().getId());
            res.setCompanyName(booking.getCompany().getName());
        }
        if (booking.getRoom() != null) {
            res.setRoomId(booking.getRoom().getId());
            res.setRoomName(booking.getRoom().getName());
            res.setFloor(booking.getRoom().getFloor());
            res.setLocation(booking.getRoom().getLocation());
        }
        if (booking.getBooker() != null) {
            res.setBookerId(booking.getBooker().getId());
            res.setBookerName(booking.getBooker().getFullName());
            res.setBookerEmail(booking.getBooker().getEmail());
            if (booking.getBooker().getDepartment() != null) {
                res.setDepartmentName(booking.getBooker().getDepartment().getName());
            }
        }
        res.setTitle(booking.getTitle());
        res.setDescription(booking.getDescription());
        res.setStartTime(booking.getStartTime());
        res.setEndTime(booking.getEndTime());
        res.setStatus(booking.getStatus());
        res.setCreatedAt(booking.getCreatedAt());
        res.setUpdatedAt(booking.getUpdatedAt());
        return res;
    }
}
