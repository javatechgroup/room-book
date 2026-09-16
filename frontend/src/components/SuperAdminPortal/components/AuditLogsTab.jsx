import React, { useState, useMemo } from 'react';
import { Clock } from 'lucide-react';
import Pagination from '../../common/Pagination/Pagination';

export default function AuditLogsTab({ auditLogs = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return auditLogs.slice(start, start + pageSize);
  }, [auditLogs, currentPage, pageSize]);

  return (
    <div className="superadmin-panel">
      <div className="superadmin-toolbar">
        <h3 className="panel-subheading">System Configuration & Multi-Tenant Audit Trail</h3>
        <span className="audit-note">
          Immutable record of tenant provisioning and credential assignments ({auditLogs.length} total events)
        </span>
      </div>

      {/* Desktop Audit Logs Table */}
      <div className="desktop-table-wrap">
        <div className="table-responsive">
          <table className="superadmin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Entity Type</th>
                <th>Target Resource</th>
                <th>Performed By</th>
                <th>Audit Details</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="td-empty">
                    <Clock size={32} className="empty-icon" />
                    <p>No audit log events recorded yet.</p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="td-subtle">
                      <Clock size={12} className="inline-icon" />
                      {log.timestamp}
                    </td>
                    <td>
                      <span className="action-tag">{log.action}</span>
                    </td>
                    <td>
                      <span className="entity-tag">{log.entityType}</span>
                    </td>
                    <td className="td-strong">{log.entityName}</td>
                    <td>{log.performedBy}</td>
                    <td className="td-details">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List for Audit Logs (Visible on mobile/tablet < 768px) */}
      <div className="mobile-card-list">
        {paginatedLogs.length === 0 ? (
          <div className="mobile-card" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
            <Clock size={32} style={{ margin: '0 auto 10px', opacity: 0.7 }} />
            <p style={{ margin: 0, fontWeight: 500 }}>No audit log events recorded yet.</p>
          </div>
        ) : (
          paginatedLogs.map((log) => (
            <div key={log.id} className="mobile-card">
              <div className="mobile-card__header">
                <span className="action-tag">{log.action}</span>
                <span className="td-subtle">
                  <Clock size={12} className="inline-icon" />
                  {log.timestamp}
                </span>
              </div>

              <div className="mobile-card__title-row">
                <h4 className="mobile-card__title">{log.entityName}</h4>
                <span className="entity-tag">{log.entityType}</span>
              </div>

              <div className="mobile-card__details">
                <div className="mobile-card__info-row">
                  <span className="mobile-card__text">{log.details}</span>
                </div>
              </div>

              <div className="mobile-card__footer">
                <span className="td-subtle" style={{ fontSize: '0.78rem' }}>
                  Logged by: {log.performedBy}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={auditLogs.length}
        itemName="audit events"
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
