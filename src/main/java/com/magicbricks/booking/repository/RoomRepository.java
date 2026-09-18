package com.magicbricks.booking.repository;

import com.magicbricks.booking.domain.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByCompanyId(Long companyId);
    List<Room> findByCompanyIdAndStatus(Long companyId, String status);
    List<Room> findByCompanyIdAndFloor(Long companyId, String floor);
    Optional<Room> findByCompanyIdAndName(Long companyId, String name);

    @Query(value = "SELECT r FROM Room r WHERE r.company.id = :companyId " +
                   "AND (:floor = 'ALL' OR r.floor = :floor) " +
                   "AND (:status = 'ALL' OR r.status = :status) " +
                   "AND (:search IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "     OR LOWER(r.location) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "     OR LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(r) FROM Room r WHERE r.company.id = :companyId " +
                   "AND (:floor = 'ALL' OR r.floor = :floor) " +
                   "AND (:status = 'ALL' OR r.status = :status) " +
                   "AND (:search IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "     OR LOWER(r.location) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "     OR LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Room> searchRooms(
            @Param("companyId") Long companyId,
            @Param("floor") String floor,
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT DISTINCT r.floor FROM Room r WHERE r.company.id = :companyId ORDER BY r.floor ASC")
    List<String> findDistinctFloorsByCompanyId(@Param("companyId") Long companyId);

    long countByCompanyId(Long companyId);
    long countByCompanyIdAndStatus(Long companyId, String status);
}
