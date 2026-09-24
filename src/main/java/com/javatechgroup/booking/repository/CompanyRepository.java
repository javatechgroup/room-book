package com.javatechgroup.booking.repository;

import com.javatechgroup.booking.domain.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByCompanyCode(String companyCode);

    Boolean existsByCompanyCode(String companyCode);

    Page<Company> findByStatus(String status, Pageable pageable);

    @Query(
        value = "SELECT c FROM Company c WHERE " +
                "(:search IS NULL OR :search = '' OR " +
                " LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                " LOWER(c.companyCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                " LOWER(c.contactInformation) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                "AND (:status IS NULL OR :status = 'ALL' OR c.status = :status)",
        countQuery = "SELECT count(c.id) FROM Company c WHERE " +
                     "(:search IS NULL OR :search = '' OR " +
                     " LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     " LOWER(c.companyCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     " LOWER(c.contactInformation) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                     "AND (:status IS NULL OR :status = 'ALL' OR c.status = :status)"
    )
    Page<Company> searchCompanies(@Param("search") String search, @Param("status") String status, Pageable pageable);
}
