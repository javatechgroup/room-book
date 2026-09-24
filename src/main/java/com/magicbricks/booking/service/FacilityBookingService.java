package com.magicbricks.booking.service;

import com.magicbricks.booking.common.BookingConflictException;
import com.magicbricks.booking.common.PageResponse;
import com.magicbricks.booking.common.ResourceNotFoundException;
import com.magicbricks.booking.common.UnauthorizedAccessException;
import com.magicbricks.booking.domain.*;
import com.magicbricks.booking.dto.BookingRequest;
import com.magicbricks.booking.dto.BookingResponse;
import com.magicbricks.booking.dto.ParticipantDto;
import com.magicbricks.booking.notification.event.BookingCancelledEvent;
import com.magicbricks.booking.notification.event.BookingCreatedEvent;
import com.magicbricks.booking.notification.event.BookingUpdatedEvent;
import com.magicbricks.booking.repository.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FacilityBookingService {

	private final BookingRepository bookingRepository;
	private final RoomRepository roomRepository;
	private final UserRepository userRepository;
	private final CompanyRepository companyRepository;
	private final AuditLogRepository auditLogRepository;
	private final ApplicationEventPublisher eventPublisher;

	public FacilityBookingService(BookingRepository bookingRepository, RoomRepository roomRepository,
			UserRepository userRepository, CompanyRepository companyRepository, AuditLogRepository auditLogRepository,
			ApplicationEventPublisher eventPublisher) {
		this.bookingRepository = bookingRepository;
		this.roomRepository = roomRepository;
		this.userRepository = userRepository;
		this.companyRepository = companyRepository;
		this.auditLogRepository = auditLogRepository;
		this.eventPublisher = eventPublisher;
	}

	@Transactional
	public BookingResponse createBooking(BookingRequest request, Long companyId, Long currentUserId) {
		Company company = companyRepository.findById(companyId)
				.orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + companyId));

		Room room = roomRepository.findById(request.getRoomId())
				.filter(r -> r.getCompany().getId().equals(companyId))
				.orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + request.getRoomId()));

		if ("MAINTENANCE".equalsIgnoreCase(room.getStatus())) {
			throw new BookingConflictException(
					"Room '" + room.getName() + "' is currently under maintenance and unavailable for booking.");
		}

		if (request.getStartTime().isAfter(request.getEndTime())
				|| request.getStartTime().isEqual(request.getEndTime())) {
			throw new BookingConflictException("End time must be strictly after start time.");
		}

		LocalDateTime now = LocalDateTime.now();
		if (request.getStartTime().isBefore(now)) {
			throw new BookingConflictException("Cannot book a room in the past. Please select a future date and time.");
		}

		// Conflict check
		List<Booking> conflicts = bookingRepository.findConflictingBookings(room.getId(), request.getStartTime(),
				request.getEndTime());
		if (!conflicts.isEmpty()) {
			Booking conflict = conflicts.get(0);
			throw new BookingConflictException(
					"Time slot overlaps with an existing confirmed reservation ('" + conflict.getTitle() + "' by "
							+ conflict.getBooker().getFullName() + "). Please choose another slot.");
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
		if (request.getDepartment() != null && !request.getDepartment().trim().isEmpty()) {
			booking.setDepartment(request.getDepartment().trim());
		} else if (booker.getDepartment() != null) {
			booking.setDepartment(booker.getDepartment().getName());
		}

		// Sync participants to booking
		syncParticipants(booking, request, companyId);

		int effectiveAttendees = request.getAttendeesCount() != null ? request.getAttendeesCount() : 2;
		if (booking.getParticipants() != null && !booking.getParticipants().isEmpty()) {
			effectiveAttendees = Math.max(effectiveAttendees, booking.getParticipants().size() + 1);
		}
		booking.setAttendeesCount(effectiveAttendees);

		Booking saved = bookingRepository.save(booking);

		AuditLog audit = new AuditLog();
		audit.setUserId(currentUserId);
		audit.setCompanyId(companyId);
		audit.setAction("CREATE_BOOKING");
		audit.setEntityType("BOOKING");
		audit.setEntityId(saved.getId());
		audit.setNewValue("Booked Room: " + room.getName() + " on " + room.getFloor() + " from " + saved.getStartTime()
				+ " to " + saved.getEndTime() + " ('" + saved.getTitle() + "') with "
				+ (saved.getParticipants() != null ? saved.getParticipants().size() : 0) + " participants");
		audit.setTimestamp(LocalDateTime.now());
		auditLogRepository.save(audit);

		eventPublisher.publishEvent(new BookingCreatedEvent(saved));

		return mapToResponse(saved);
	}

	@Transactional
	public BookingResponse cancelBooking(Long bookingId, Long companyId, Long currentUserId,
			boolean isSuperAdminOrFacilityAdmin) {
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

		eventPublisher.publishEvent(new BookingCancelledEvent(updated));

		return mapToResponse(updated);
	}

	@Transactional
	public BookingResponse updateBooking(Long bookingId, BookingRequest request, Long companyId, Long currentUserId,
			boolean isSuperAdminOrFacilityAdmin) {
		Booking booking = bookingRepository.findById(bookingId)
				.filter(b -> b.getCompany().getId().equals(companyId))
				.orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

		if (!isSuperAdminOrFacilityAdmin && !booking.getBooker().getId().equals(currentUserId)) {
			throw new UnauthorizedAccessException("You are only authorized to update bookings made by yourself.");
		}

		Room room = roomRepository.findById(request.getRoomId())
				.filter(r -> r.getCompany().getId().equals(companyId))
				.orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + request.getRoomId()));

		if ("MAINTENANCE".equalsIgnoreCase(room.getStatus())) {
			throw new BookingConflictException(
					"Room '" + room.getName() + "' is currently under maintenance and unavailable for booking.");
		}

		if (request.getStartTime().isAfter(request.getEndTime())
				|| request.getStartTime().isEqual(request.getEndTime())) {
			throw new BookingConflictException("End time must be strictly after start time.");
		}

		LocalDateTime now = LocalDateTime.now();
		if (booking.getStartTime().isBefore(now)) {
			throw new BookingConflictException(
					"This meeting has already begun and cannot be edited. You can release or cancel the room early if needed.");
		}

		if (request.getEndTime().isBefore(now)) {
			throw new BookingConflictException("Cannot reschedule to an end time that has already passed.");
		}

		if (request.getStartTime().isBefore(now)) {
			throw new BookingConflictException(
					"Cannot reschedule start time to a past date and time. Please select a future slot.");
		}

		// Conflict check excluding the booking itself
		List<Booking> conflicts = bookingRepository.findConflictingBookingsExcludingSelf(room.getId(), bookingId,
				request.getStartTime(), request.getEndTime());
		if (!conflicts.isEmpty()) {
			Booking conflict = conflicts.get(0);
			throw new BookingConflictException(
					"Time slot overlaps with an existing confirmed reservation ('" + conflict.getTitle() + "' by "
							+ conflict.getBooker().getFullName() + "). Please choose another slot.");
		}

		booking.setRoom(room);
		booking.setTitle(request.getTitle().trim());
		booking.setDescription(request.getDescription());
		booking.setStartTime(request.getStartTime());
		booking.setEndTime(request.getEndTime());
		booking.setStatus("CONFIRMED");
		if (request.getDepartment() != null && !request.getDepartment().trim().isEmpty()) {
			booking.setDepartment(request.getDepartment().trim());
		}

		// Update participants if provided in request
		if (request.getParticipants() != null || request.getParticipantEmails() != null) {
			syncParticipants(booking, request, companyId);
		}

		int effectiveAttendees = request.getAttendeesCount() != null ? request.getAttendeesCount() : booking.getAttendeesCount();
		if (booking.getParticipants() != null && !booking.getParticipants().isEmpty()) {
			effectiveAttendees = Math.max(effectiveAttendees, booking.getParticipants().size() + 1);
		}
		booking.setAttendeesCount(effectiveAttendees);

		Booking updated = bookingRepository.save(booking);

		AuditLog audit = new AuditLog();
		audit.setUserId(currentUserId);
		audit.setCompanyId(companyId);
		audit.setAction("UPDATE_BOOKING");
		audit.setEntityType("BOOKING");
		audit.setEntityId(updated.getId());
		audit.setNewValue("Updated Booking #" + updated.getId() + " for Room: " + room.getName() + " on "
				+ room.getFloor() + " from " + updated.getStartTime() + " to " + updated.getEndTime() + " ('"
				+ updated.getTitle() + "') with "
				+ (updated.getParticipants() != null ? updated.getParticipants().size() : 0) + " participants");
		audit.setTimestamp(LocalDateTime.now());
		auditLogRepository.save(audit);

		eventPublisher.publishEvent(new BookingUpdatedEvent(updated));

		return mapToResponse(updated);
	}

	private void syncParticipants(Booking booking, BookingRequest request, Long companyId) {
		if (booking.getParticipants() == null) {
			booking.setParticipants(new ArrayList<>());
		} else {
			booking.getParticipants().clear();
		}

		Set<String> processedEmails = new HashSet<>();

		// 1. Process structured participants if present
		if (request.getParticipants() != null) {
			for (ParticipantDto dto : request.getParticipants()) {
				if (dto == null || dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
					continue;
				}
				String email = dto.getEmail().trim().toLowerCase();
				if (processedEmails.contains(email)) continue;
				processedEmails.add(email);

				Optional<User> matchedUserOpt = userRepository.findByEmail(email)
						.filter(u -> u.getCompany() != null && u.getCompany().getId().equals(companyId));

				BookingParticipant participant = new BookingParticipant();
				participant.setBooking(booking);
				participant.setEmail(email);

				if (matchedUserOpt.isPresent()) {
					User matchedUser = matchedUserOpt.get();
					participant.setUser(matchedUser);
					participant.setName(matchedUser.getFullName());
					participant.setIsExternal(false);
				} else {
					participant.setUser(null);
					participant.setName(dto.getName() != null && !dto.getName().trim().isEmpty() ? dto.getName().trim() : email);
					participant.setIsExternal(true);
				}
				booking.getParticipants().add(participant);
			}
		}

		// 2. Process participantEmails list if present
		if (request.getParticipantEmails() != null) {
			for (String rawEmail : request.getParticipantEmails()) {
				if (rawEmail == null || rawEmail.trim().isEmpty()) continue;
				String email = rawEmail.trim().toLowerCase();
				if (processedEmails.contains(email)) continue;
				processedEmails.add(email);

				Optional<User> matchedUserOpt = userRepository.findByEmail(email)
						.filter(u -> u.getCompany() != null && u.getCompany().getId().equals(companyId));

				BookingParticipant participant = new BookingParticipant();
				participant.setBooking(booking);
				participant.setEmail(email);

				if (matchedUserOpt.isPresent()) {
					User matchedUser = matchedUserOpt.get();
					participant.setUser(matchedUser);
					participant.setName(matchedUser.getFullName());
					participant.setIsExternal(false);
				} else {
					participant.setUser(null);
					participant.setName(email);
					participant.setIsExternal(true);
				}
				booking.getParticipants().add(participant);
			}
		}
	}

	@Transactional(readOnly = true)
	public PageResponse<BookingResponse> getBookingsPaginated(Long companyId, int page, int size, String search,
			Long roomId, String floor, String status, Long bookerId, LocalDate dateFilter, String sortBy,
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

		Page<Booking> bookingPage = bookingRepository.searchBookings(companyId, roomId, floorFilter, statusFilter,
				bookerId, startFrom, startTo, sanitizedSearch, LocalDateTime.now(), pageable);

		List<BookingResponse> content = bookingPage.getContent().stream().map(this::mapToResponse)
				.collect(Collectors.toList());

		return new PageResponse<>(content, page, bookingPage.getSize(), bookingPage.getTotalElements(),
				bookingPage.getTotalPages(), bookingPage.isFirst(), bookingPage.isLast());
	}

	@Transactional(readOnly = true)
	public List<BookingResponse> getMyBookings(Long companyId, Long currentUserId) {
		return bookingRepository.findByBookerId(currentUserId).stream()
				.filter(b -> b.getCompany().getId().equals(companyId))
				.sorted((a, b) -> b.getStartTime().compareTo(a.getStartTime())).map(this::mapToResponse)
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public List<BookingResponse> getLiveOccupancyForDay(Long companyId, LocalDate date) {
		LocalDate targetDate = date != null ? date : LocalDate.now();
		LocalDateTime dayStart = targetDate.atStartOfDay();
		LocalDateTime dayEnd = targetDate.atTime(LocalTime.MAX);

		return bookingRepository.findBookingsForDay(companyId, dayStart, dayEnd).stream()
				.filter(b -> !"CANCELLED".equalsIgnoreCase(b.getStatus())).map(this::mapToResponse)
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
		res.setAttendeesCount(booking.getAttendeesCount() != null ? booking.getAttendeesCount() : 2);
		if (booking.getDepartment() != null && !booking.getDepartment().trim().isEmpty()) {
			res.setDepartmentName(booking.getDepartment());
		} else if (booking.getBooker() != null && booking.getBooker().getDepartment() != null) {
			res.setDepartmentName(booking.getBooker().getDepartment().getName());
		}
		if (booking.getParticipants() != null) {
			List<ParticipantDto> participantDtos = booking.getParticipants().stream()
					.map(p -> new ParticipantDto(
							p.getId(),
							p.getUser() != null ? p.getUser().getId() : null,
							p.getEmail(),
							p.getName(),
							p.getIsExternal()
					))
					.collect(Collectors.toList());
			res.setParticipants(participantDtos);
		}
		res.setCreatedAt(booking.getCreatedAt());
		res.setUpdatedAt(booking.getUpdatedAt());
		return res;
	}
}
