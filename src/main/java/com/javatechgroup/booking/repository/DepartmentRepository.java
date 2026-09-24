package com.javatechgroup.booking.repository;

import com.javatechgroup.booking.domain.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByCompanyId(Long companyId);
    Optional<Department> findByCompanyIdAndNameIgnoreCase(Long companyId, String name);

    @Query(value = "SELECT d FROM Department d WHERE d.company.id = :companyId " +
                   "AND (:status = 'ALL' OR d.status = :status) " +
                   "AND (:search IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(d) FROM Department d WHERE d.company.id = :companyId " +
                   "AND (:status = 'ALL' OR d.status = :status) " +
                   "AND (:search IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Department> searchDepartments(
            @Param("companyId") Long companyId,
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable
    );

    long countByCompanyId(Long companyId);
}
