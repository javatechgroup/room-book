package com.magicbricks.booking.repository;

import com.magicbricks.booking.domain.Role;
import com.magicbricks.booking.domain.User;
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
    List<User> findByCompanyIdAndDepartmentId(Long companyId, Long departmentId);
    List<User> findByRole(Role role);

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
}
