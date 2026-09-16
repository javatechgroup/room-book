package com.magicbricks.booking.controller;

import com.magicbricks.booking.common.ApiResponse;
import com.magicbricks.booking.common.PageResponse;
import com.magicbricks.booking.dto.AuditLogResponse;
import com.magicbricks.booking.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit-logs")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> getAuditLogs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "ALL") String action,
            @RequestParam(defaultValue = "ALL") String entityType,
            @RequestParam(required = false) Long companyId,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        PageResponse<AuditLogResponse> response = auditLogService.getAuditLogsPaginated(
                page, size, search, action, entityType, companyId, sortBy, sortDir
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Audit logs fetched successfully"));
    }

    @GetMapping("/actions")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctActions() {
        List<String> actions = auditLogService.getDistinctActions();
        return ResponseEntity.ok(ApiResponse.success(actions, "Audit actions retrieved successfully"));
    }

    @GetMapping("/entity-types")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctEntityTypes() {
        List<String> entityTypes = auditLogService.getDistinctEntityTypes();
        return ResponseEntity.ok(ApiResponse.success(entityTypes, "Audit entity types retrieved successfully"));
    }
}
