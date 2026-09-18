package com.magicbricks.booking.service;

import com.magicbricks.booking.domain.Booking;
import com.magicbricks.booking.domain.Department;
import com.magicbricks.booking.domain.Room;
import com.magicbricks.booking.domain.User;
import com.magicbricks.booking.dto.EmployeeResponse;
import com.magicbricks.booking.dto.FacilitySummaryResponse;
import com.magicbricks.booking.repository.BookingRepository;
import com.magicbricks.booking.repository.DepartmentRepository;
import com.magicbricks.booking.repository.RoomRepository;
import com.magicbricks.booking.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FacilityDirectoryService {

    private final RoomRepository roomRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final FacilityEmployeeService facilityEmployeeService;

    public FacilityDirectoryService(RoomRepository roomRepository,
                                    DepartmentRepository departmentRepository,
                                    UserRepository userRepository,
                                    BookingRepository bookingRepository,
                                    FacilityEmployeeService facilityEmployeeService) {
        this.roomRepository = roomRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.facilityEmployeeService = facilityEmployeeService;
    }

    @Transactional(readOnly = true)
    public FacilitySummaryResponse getFacilitySummary(Long companyId) {
        FacilitySummaryResponse summary = new FacilitySummaryResponse();

        long totalRooms = roomRepository.countByCompanyId(companyId);
        long availableRooms = roomRepository.countByCompanyIdAndStatus(companyId, "AVAILABLE");
        long maintenanceRooms = roomRepository.countByCompanyIdAndStatus(companyId, "MAINTENANCE");

        LocalDateTime now = LocalDateTime.now();
        List<Booking> activeNow = bookingRepository.findCurrentlyActiveBookings(companyId, now);
        long occupiedRooms = activeNow.size();

        long totalDepts = departmentRepository.countByCompanyId(companyId);
        long totalEmps = userRepository.countByCompanyId(companyId);

        LocalDate today = LocalDate.now();
        List<Booking> todayBookings = bookingRepository.findBookingsForDay(companyId, today.atStartOfDay(), today.atTime(LocalTime.MAX));
        long todayCount = todayBookings.size();
        long upcomingCount = todayBookings.stream()
                .filter(b -> b.getStartTime().isAfter(now) && !"CANCELLED".equalsIgnoreCase(b.getStatus()))
                .count();

        // Floor distribution (rooms count per floor)
        List<Room> allRooms = roomRepository.findByCompanyId(companyId);
        Map<String, Long> floorMap = new TreeMap<>();
        for (Room r : allRooms) {
            String floor = r.getFloor() != null ? r.getFloor() : "Unassigned";
            floorMap.put(floor, floorMap.getOrDefault(floor, 0L) + 1);
        }

        // Department headcount (Single Aggregated Query instead of N+1 loop)
        Map<String, Long> deptHeadcount = new LinkedHashMap<>();
        List<Object[]> headcountResults = userRepository.getDepartmentHeadcountsByCompanyId(companyId);
        for (Object[] row : headcountResults) {
            if (row != null && row.length >= 2 && row[0] != null) {
                String deptName = (String) row[0];
                Long count = ((Number) row[1]).longValue();
                deptHeadcount.put(deptName, count);
            }
        }

        summary.setTotalRooms(totalRooms);
        summary.setAvailableRooms(Math.max(0, availableRooms - occupiedRooms));
        summary.setMaintenanceRooms(maintenanceRooms);
        summary.setOccupiedRoomsNow(occupiedRooms);
        summary.setTotalDepartments(totalDepts);
        summary.setTotalEmployees(totalEmps);
        summary.setTodayBookingsCount(todayCount);
        summary.setUpcomingBookingsCount(upcomingCount);
        summary.setFloorDistribution(floorMap);
        summary.setDepartmentHeadcount(deptHeadcount);

        return summary;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCompanyDirectory(Long companyId) {
        List<Department> departments = departmentRepository.findByCompanyId(companyId);
        List<User> employees = userRepository.findByCompanyId(companyId);
        List<Room> rooms = roomRepository.findByCompanyId(companyId);

        List<EmployeeResponse> employeeResponses = employees.stream()
                .map(facilityEmployeeService::mapToResponse)
                .collect(Collectors.toList());

        Map<String, List<EmployeeResponse>> groupedByDepartment = employeeResponses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getDepartmentName() != null ? e.getDepartmentName() : "General",
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        Map<String, Object> response = new HashMap<>();
        response.put("totalEmployees", employees.size());
        response.put("totalDepartments", departments.size());
        response.put("totalRooms", rooms.size());
        response.put("employees", employeeResponses);
        response.put("departmentGroups", groupedByDepartment);

        return response;
    }
}
