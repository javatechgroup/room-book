package com.javatechgroup.booking.service;

import com.javatechgroup.booking.common.BookingConflictException;
import com.javatechgroup.booking.common.PageResponse;
import com.javatechgroup.booking.common.ResourceNotFoundException;
import com.javatechgroup.booking.domain.AuditLog;
import com.javatechgroup.booking.domain.Company;
import com.javatechgroup.booking.domain.Floor;
import com.javatechgroup.booking.domain.Room;
import com.javatechgroup.booking.dto.FloorRequest;
import com.javatechgroup.booking.dto.FloorResponse;
import com.javatechgroup.booking.repository.AuditLogRepository;
import com.javatechgroup.booking.repository.CompanyRepository;
import com.javatechgroup.booking.repository.FloorRepository;
import com.javatechgroup.booking.repository.RoomRepository;
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
public class FacilityFloorService {

    private final FloorRepository floorRepository;
    private final RoomRepository roomRepository;
    private final CompanyRepository companyRepository;
    private final AuditLogRepository auditLogRepository;

    public FacilityFloorService(FloorRepository floorRepository,
                                RoomRepository roomRepository,
                                CompanyRepository companyRepository,
                                AuditLogRepository auditLogRepository) {
        this.floorRepository = floorRepository;
        this.roomRepository = roomRepository;
        this.companyRepository = companyRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public FloorResponse createFloor(FloorRequest request, Long companyId, Long currentUserId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + companyId));

        String floorName = request.getName().trim();
        if (floorRepository.findByCompanyIdAndNameIgnoreCase(companyId, floorName).isPresent()) {
            throw new BookingConflictException("Floor with name '" + floorName + "' already exists in this company.");
        }

        Floor floor = new Floor();
        floor.setCompany(company);
        floor.setName(floorName);
        floor.setFloorNumber(request.getFloorNumber());
        floor.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        floor.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "ACTIVE");

        Floor saved = floorRepository.save(floor);

        AuditLog audit = new AuditLog();
        audit.setUserId(currentUserId);
        audit.setCompanyId(companyId);
        audit.setAction("CREATE_FLOOR");
        audit.setEntityType("FLOOR");
        audit.setEntityId(saved.getId());
        audit.setNewValue("Created Floor: " + saved.getName() + " (Level: " + saved.getFloorNumber() + ")");
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<FloorResponse> getFloorsPaginated(
            Long companyId,
            int page,
            int size,
            String search,
            String status,
            String sortBy,
            String sortDir) {

        int pageNum = Math.max(0, page - 1);
        int pageSize = Math.max(1, size);

        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String sortProperty = (sortBy == null || sortBy.isBlank()) ? "name" : sortBy;
        Pageable pageable = PageRequest.of(pageNum, pageSize, Sort.by(direction, sortProperty));

        String sanitizedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String statusFilter = (status == null || status.trim().isEmpty()) ? "ALL" : status.trim();

        Page<Floor> floorPage = floorRepository.searchFloors(companyId, statusFilter, sanitizedSearch, pageable);
        List<FloorResponse> content = floorPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                page,
                floorPage.getSize(),
                floorPage.getTotalElements(),
                floorPage.getTotalPages(),
                floorPage.isFirst(),
                floorPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public List<FloorResponse> getAllFloors(Long companyId) {
        return floorRepository.findByCompanyIdAndStatus(companyId, "ACTIVE").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FloorResponse getFloorById(Long id, Long companyId) {
        Floor floor = floorRepository.findById(id)
                .filter(f -> f.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found with ID: " + id));
        return mapToResponse(floor);
    }

    @Transactional
    public FloorResponse updateFloor(Long id, FloorRequest request, Long companyId, Long currentUserId) {
        Floor floor = floorRepository.findById(id)
                .filter(f -> f.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found with ID: " + id));

        String oldName = floor.getName();
        String newName = request.getName().trim();

        if (!oldName.equalsIgnoreCase(newName)) {
            if (floorRepository.findByCompanyIdAndNameIgnoreCase(companyId, newName).isPresent()) {
                throw new BookingConflictException("Another floor with name '" + newName + "' already exists.");
            }
            // Update rooms associated with the old floor name to keep references synchronized
            List<Room> roomsOnFloor = roomRepository.findByCompanyIdAndFloor(companyId, oldName);
            for (Room r : roomsOnFloor) {
                r.setFloor(newName);
            }
            roomRepository.saveAll(roomsOnFloor);
        }

        floor.setName(newName);
        floor.setFloorNumber(request.getFloorNumber());
        floor.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        if (request.getStatus() != null) {
            floor.setStatus(request.getStatus().toUpperCase());
        }

        Floor updated = floorRepository.save(floor);

        AuditLog audit = new AuditLog();
        audit.setUserId(currentUserId);
        audit.setCompanyId(companyId);
        audit.setAction("UPDATE_FLOOR");
        audit.setEntityType("FLOOR");
        audit.setEntityId(updated.getId());
        audit.setOldValue("Floor: " + oldName);
        audit.setNewValue("Updated to: " + updated.getName() + " (Level: " + updated.getFloorNumber() + ")");
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);

        return mapToResponse(updated);
    }

    @Transactional
    public FloorResponse toggleFloorStatus(Long id, Long companyId, Long currentUserId) {
        Floor floor = floorRepository.findById(id)
                .filter(f -> f.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found with ID: " + id));

        String newStatus = "ACTIVE".equalsIgnoreCase(floor.getStatus()) ? "INACTIVE" : "ACTIVE";
        floor.setStatus(newStatus);
        Floor updated = floorRepository.save(floor);

        AuditLog audit = new AuditLog();
        audit.setUserId(currentUserId);
        audit.setCompanyId(companyId);
        audit.setAction("TOGGLE_FLOOR_STATUS");
        audit.setEntityType("FLOOR");
        audit.setEntityId(updated.getId());
        audit.setNewValue("Status changed to: " + newStatus);
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);

        return mapToResponse(updated);
    }

    @Transactional
    public void deleteFloor(Long id, Long companyId, Long currentUserId) {
        Floor floor = floorRepository.findById(id)
                .filter(f -> f.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Floor not found with ID: " + id));

        long assignedRooms = roomRepository.countByCompanyIdAndFloor(companyId, floor.getName());
        if (assignedRooms > 0) {
            throw new BookingConflictException("Cannot delete floor '" + floor.getName() + "' because " + assignedRooms + " room(s) are assigned to it.");
        }

        floorRepository.delete(floor);

        AuditLog audit = new AuditLog();
        audit.setUserId(currentUserId);
        audit.setCompanyId(companyId);
        audit.setAction("DELETE_FLOOR");
        audit.setEntityType("FLOOR");
        audit.setEntityId(id);
        audit.setOldValue("Deleted floor: " + floor.getName());
        audit.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(audit);
    }

    private FloorResponse mapToResponse(Floor floor) {
        FloorResponse resp = new FloorResponse();
        resp.setId(floor.getId());
        if (floor.getCompany() != null) {
            resp.setCompanyId(floor.getCompany().getId());
            resp.setCompanyName(floor.getCompany().getName());
        }
        resp.setName(floor.getName());
        resp.setFloorNumber(floor.getFloorNumber());
        resp.setDescription(floor.getDescription());
        resp.setStatus(floor.getStatus());

        long roomCount = 0;
        if (floor.getCompany() != null && floor.getName() != null) {
            roomCount = roomRepository.countByCompanyIdAndFloor(floor.getCompany().getId(), floor.getName());
        }
        resp.setRoomCount(roomCount);
        resp.setCreatedAt(floor.getCreatedAt());
        resp.setUpdatedAt(floor.getUpdatedAt());
        return resp;
    }
}
