package com.javatechgroup.booking.repository;

import com.javatechgroup.booking.domain.Role;
import com.javatechgroup.booking.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<User> findByCompanyId(Long companyId);
    long countByCompanyId(Long companyId);
    long countByDepartmentId(Long departmentId);

    @Query("SELECT d.name, COUNT(u.id) FROM Department d LEFT JOIN User u ON u.department.id = d.id " +
           "WHERE d.company.id = :companyId GROUP BY d.id, d.name ORDER BY d.name ASC")
    List<Object[]> getDepartmentHeadcountsByCompanyId(@Param("companyId") Long companyId);

    @Query(value = "SELECT u FROM User u LEFT JOIN FETCH u.company c " +
                   "WHERE u.role = :role " +
                   "AND (:companyId IS NULL OR c.id = :companyId) " +
                   "AND (:status = 'ALL' OR u.status = :status) " +
                   "AND (:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "     OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "     OR (c.name IS NOT NULL AND LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))))",
           countQuery = "SELECT COUNT(u) FROM User u LEFT JOIN u.company c " +
                   "WHERE u.role = :role " +
                   "AND (:companyId IS NULL OR c.id = :companyId) " +
                   "AND (:status = 'ALL' OR u.status = :status) " +
                   "AND (:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "     OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "     OR (c.name IS NOT NULL AND LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))))")
    Page<User> searchFacilityAdmins(
            @Param("role") Role role,
            @Param("companyId") Long companyId,
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable
    );

    @Query(value = "SELECT u FROM User u LEFT JOIN FETCH u.company c LEFT JOIN FETCH u.department d " +
                   "WHERE c.id = :companyId " +
                   "AND (:departmentId IS NULL OR d.id = :departmentId) " +
                   "AND (:role IS NULL OR u.role = :role) " +
                   "AND (:status = 'ALL' OR u.status = :status) " +
                   "AND (:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "     OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "     OR (d.name IS NOT NULL AND LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%'))))",
           countQuery = "SELECT COUNT(u) FROM User u LEFT JOIN u.company c LEFT JOIN u.department d " +
                   "WHERE c.id = :companyId " +
                   "AND (:departmentId IS NULL OR d.id = :departmentId) " +
                   "AND (:role IS NULL OR u.role = :role) " +
                   "AND (:status = 'ALL' OR u.status = :status) " +
                   "AND (:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "     OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
                   "     OR (d.name IS NOT NULL AND LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%'))))")
    Page<User> searchEmployees(
            @Param("companyId") Long companyId,
            @Param("departmentId") Long departmentId,
            @Param("role") Role role,
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable
    );
}
