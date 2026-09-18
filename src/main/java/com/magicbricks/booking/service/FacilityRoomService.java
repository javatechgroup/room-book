package com.magicbricks.booking.service;

import com.magicbricks.booking.common.PageResponse;
import com.magicbricks.booking.common.ResourceNotFoundException;
import com.magicbricks.booking.domain.AuditLog;
import com.magicbricks.booking.domain.Company;
import com.magicbricks.booking.domain.Room;
import com.magicbricks.booking.dto.RoomRequest;
import com.magicbricks.booking.dto.RoomResponse;
import com.magicbricks.booking.repository.AuditLogRepository;
import com.magicbricks.booking.repository.CompanyRepository;
import com.magicbricks.booking.repository.RoomRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacilityRoomService {

    private final RoomRepository roomRepository;
    private final CompanyRepository companyRepository;
    private final AuditLogRepository auditLogRepository;

    public FacilityRoomService(RoomRepository roomRepository,
                               CompanyRepository companyRepository,
                               AuditLogRepository auditLogRepository) {
        this.roomRepository = roomRepository;
        this.companyRepository = companyRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public RoomResponse createRoom(RoomRequest request, Long companyId, Long currentUserId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + companyId));

        Room room = new Room();
        room.setCompany(company);
        room.setName(request.getName().trim());
        room.setFloor(request.getFloor().trim());
        room.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        room.setCapacity(request.getCapacity());
        room.setDescription(request.getDescription());
        room.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "AVAILABLE");

        Room saved = roomRepository.save(room);

        // Audit Log
        AuditLog audit = new AuditLog();
        audit.setUserId(currentUserId);
        audit.setCompanyId(companyId);
        audit.setAction("CREATE_ROOM");
        audit.setEntityType("ROOM");
        audit.setEntityId(saved.getId());
        audit.setNewValue("Created Room: " + saved.getName() + " on " + saved.getFloor() + " (Capacity: " + saved.getCapacity() + ")");
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<RoomResponse> getRoomsPaginated(
            Long companyId,
            int page,
            int size,
            String search,
            String floor,
            String status,
            String sortBy,
            String sortDir) {

        int pageNum = Math.max(0, page - 1);
        int pageSize = Math.max(1, size);

        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortProperty = (sortBy == null || sortBy.isBlank()) ? "name" : sortBy;
        Pageable pageable = PageRequest.of(pageNum, pageSize, Sort.by(direction, sortProperty));

        String sanitizedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String floorFilter = (floor == null || floor.trim().isEmpty()) ? "ALL" : floor.trim();
        String statusFilter = (status == null || status.trim().isEmpty()) ? "ALL" : status.trim();

        Page<Room> roomPage = roomRepository.searchRooms(companyId, floorFilter, statusFilter, sanitizedSearch, pageable);
        List<RoomResponse> content = roomPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                page,
                roomPage.getSize(),
                roomPage.getTotalElements(),
                roomPage.getTotalPages(),
                roomPage.isFirst(),
                roomPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long id, Long companyId) {
        Room room = roomRepository.findById(id)
                .filter(r -> r.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));
        return mapToResponse(room);
    }

    @Transactional
    public RoomResponse updateRoom(Long id, RoomRequest request, Long companyId, Long currentUserId) {
        Room room = roomRepository.findById(id)
                .filter(r -> r.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));

        String oldDesc = "Room: " + room.getName() + " on " + room.getFloor() + " (Capacity: " + room.getCapacity() + ", Status: " + room.getStatus() + ")";

        room.setName(request.getName().trim());
        room.setFloor(request.getFloor().trim());
        room.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        room.setCapacity(request.getCapacity());
        room.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            room.setStatus(request.getStatus().toUpperCase());
        }

        Room updated = roomRepository.save(room);

        // Audit Log
        AuditLog audit = new AuditLog();
        audit.setUserId(currentUserId);
        audit.setCompanyId(companyId);
        audit.setAction("UPDATE_ROOM");
        audit.setEntityType("ROOM");
        audit.setEntityId(updated.getId());
        audit.setOldValue(oldDesc);
        audit.setNewValue("Updated Room: " + updated.getName() + " on " + updated.getFloor() + " (Capacity: " + updated.getCapacity() + ", Status: " + updated.getStatus() + ")");
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);

        return mapToResponse(updated);
    }

    @Transactional
    public RoomResponse toggleMaintenance(Long id, Long companyId, Long currentUserId) {
        Room room = roomRepository.findById(id)
                .filter(r -> r.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));

        String oldStatus = room.getStatus();
        String newStatus = "MAINTENANCE".equalsIgnoreCase(oldStatus) ? "AVAILABLE" : "MAINTENANCE";
        room.setStatus(newStatus);
        Room updated = roomRepository.save(room);

        AuditLog audit = new AuditLog();
        audit.setUserId(currentUserId);
        audit.setCompanyId(companyId);
        audit.setAction("TOGGLE_ROOM_MAINTENANCE");
        audit.setEntityType("ROOM");
        audit.setEntityId(updated.getId());
        audit.setOldValue("Status: " + oldStatus);
        audit.setNewValue("Status: " + newStatus);
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);

        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<String> getDistinctFloors(Long companyId) {
        return roomRepository.findDistinctFloorsByCompanyId(companyId);
    }

    @Transactional
    public List<RoomResponse> bulkUpdateStatus(List<Long> ids, String status, Long companyId, Long currentUserId) {
        List<Room> rooms = roomRepository.findAllById(ids).stream()
                .filter(r -> r.getCompany().getId().equals(companyId))
                .collect(Collectors.toList());

        for (Room r : rooms) {
            r.setStatus(status.toUpperCase());
        }
        List<Room> saved = roomRepository.saveAll(rooms);

        AuditLog audit = new AuditLog();
        audit.setUserId(currentUserId);
        audit.setCompanyId(companyId);
        audit.setAction("BULK_UPDATE_ROOMS");
        audit.setEntityType("ROOM");
        audit.setNewValue("Bulk updated " + saved.size() + " rooms to status " + status);
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);

        return saved.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public RoomResponse mapToResponse(Room room) {
        RoomResponse res = new RoomResponse();
        res.setId(room.getId());
        if (room.getCompany() != null) {
            res.setCompanyId(room.getCompany().getId());
            res.setCompanyName(room.getCompany().getName());
        }
        res.setName(room.getName());
        res.setFloor(room.getFloor());
        res.setLocation(room.getLocation());
        res.setCapacity(room.getCapacity());
        res.setDescription(room.getDescription());
        res.setStatus(room.getStatus());
        res.setCreatedAt(room.getCreatedAt());
        res.setUpdatedAt(room.getUpdatedAt());
        return res;
    }
}
