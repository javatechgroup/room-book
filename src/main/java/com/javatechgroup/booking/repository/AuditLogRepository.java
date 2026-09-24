package com.javatechgroup.booking.repository;

import com.javatechgroup.booking.domain.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query(value = "SELECT a FROM AuditLog a WHERE " +
            "(:action = 'ALL' OR a.action = :action) AND " +
            "(:entityType = 'ALL' OR a.entityType = :entityType) AND " +
            "(:companyId IS NULL OR a.companyId = :companyId) AND " +
            "(:search IS NULL OR LOWER(a.action) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "     OR LOWER(a.entityType) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "     OR LOWER(COALESCE(a.newValue, '')) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "     OR LOWER(COALESCE(a.oldValue, '')) LIKE LOWER(CONCAT('%', :search, '%')))",
            countQuery = "SELECT COUNT(a) FROM AuditLog a WHERE " +
            "(:action = 'ALL' OR a.action = :action) AND " +
            "(:entityType = 'ALL' OR a.entityType = :entityType) AND " +
            "(:companyId IS NULL OR a.companyId = :companyId) AND " +
            "(:search IS NULL OR LOWER(a.action) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "     OR LOWER(a.entityType) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "     OR LOWER(COALESCE(a.newValue, '')) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "     OR LOWER(COALESCE(a.oldValue, '')) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<AuditLog> searchAuditLogs(
            @Param("action") String action,
            @Param("entityType") String entityType,
            @Param("companyId") Long companyId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT DISTINCT a.action FROM AuditLog a ORDER BY a.action")
    List<String> findDistinctActions();

    @Query("SELECT DISTINCT a.entityType FROM AuditLog a ORDER BY a.entityType")
    List<String> findDistinctEntityTypes();
}

