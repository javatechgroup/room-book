package com.javatechgroup.booking.dto;

import java.util.Map;

public class FacilitySummaryResponse {

    private long totalRooms;
    private long availableRooms;
    private long maintenanceRooms;
    private long occupiedRoomsNow;
    private long totalFloors;
    private long totalDepartments;
    private long totalEmployees;
    private long todayBookingsCount;
    private long upcomingBookingsCount;
    private Map<String, Long> floorDistribution;
    private Map<String, Long> departmentHeadcount;

    public FacilitySummaryResponse() {}

    public long getTotalFloors() { return totalFloors; }
    public void setTotalFloors(long totalFloors) { this.totalFloors = totalFloors; }

    public long getTotalRooms() { return totalRooms; }
    public void setTotalRooms(long totalRooms) { this.totalRooms = totalRooms; }

    public long getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(long availableRooms) { this.availableRooms = availableRooms; }

    public long getMaintenanceRooms() { return maintenanceRooms; }
    public void setMaintenanceRooms(long maintenanceRooms) { this.maintenanceRooms = maintenanceRooms; }

    public long getOccupiedRoomsNow() { return occupiedRoomsNow; }
    public void setOccupiedRoomsNow(long occupiedRoomsNow) { this.occupiedRoomsNow = occupiedRoomsNow; }

    public long getTotalDepartments() { return totalDepartments; }
    public void setTotalDepartments(long totalDepartments) { this.totalDepartments = totalDepartments; }

    public long getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(long totalEmployees) { this.totalEmployees = totalEmployees; }

    public long getTodayBookingsCount() { return todayBookingsCount; }
    public void setTodayBookingsCount(long todayBookingsCount) { this.todayBookingsCount = todayBookingsCount; }

    public long getUpcomingBookingsCount() { return upcomingBookingsCount; }
    public void setUpcomingBookingsCount(long upcomingBookingsCount) { this.upcomingBookingsCount = upcomingBookingsCount; }

    public Map<String, Long> getFloorDistribution() { return floorDistribution; }
    public void setFloorDistribution(Map<String, Long> floorDistribution) { this.floorDistribution = floorDistribution; }

    public Map<String, Long> getDepartmentHeadcount() { return departmentHeadcount; }
    public void setDepartmentHeadcount(Map<String, Long> departmentHeadcount) { this.departmentHeadcount = departmentHeadcount; }
}
