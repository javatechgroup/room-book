package com.magicbricks.booking.repository;

import com.magicbricks.booking.domain.Floor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FloorRepository extends JpaRepository<Floor, Long> {

    List<Floor> findByCompanyId(Long companyId);

    List<Floor> findByCompanyIdAndStatus(Long companyId, String status);

    Optional<Floor> findByCompanyIdAndNameIgnoreCase(Long companyId, String name);

    @Query(value = "SELECT f FROM Floor f WHERE f.company.id = :companyId " +
                   "AND (:status = 'ALL' OR f.status = :status) " +
                   "AND (:search IS NULL OR LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "     OR LOWER(f.description) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(f) FROM Floor f WHERE f.company.id = :companyId " +
                   "AND (:status = 'ALL' OR f.status = :status) " +
                   "AND (:search IS NULL OR LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "     OR LOWER(f.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Floor> searchFloors(
            @Param("companyId") Long companyId,
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable
    );

    long countByCompanyId(Long companyId);
    long countByCompanyIdAndStatus(Long companyId, String status);
}
