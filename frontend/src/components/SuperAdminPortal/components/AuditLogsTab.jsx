import React, { useState, useEffect } from 'react';
import {
  Clock,
  Search,
  Download,
  Filter,
  Eye,
  Shield,
  Building2,
  User,
  Mail,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  X,
  Activity,
  Layers,
} from 'lucide-react';
import Pagination from '../../common/Pagination/Pagination';
import { formatAuditTimestamp, formatDateTime } from '../../../utils/dateUtils';

function formatAuditTarget(entityName, entityType) {
  if (!entityName) return { title: 'Unknown Resource' };

  // Match pattern: "Name (email) for company CompanyName"
  const userFullMatch = entityName.match(/^([^(]+)\s*\(([^)]+)\)\s*for company\s*(.+)$/i);
  if (userFullMatch) {
    return {
      title: userFullMatch[1].trim(),
      email: userFullMatch[2].trim(),
      company: userFullMatch[3].trim(),
    };
  }

  // Match pattern: "Name (email)"
  const userSimpleMatch = entityName.match(/^([^(]+)\s*\(([^)]+)\)$/i);
  if (userSimpleMatch && entityType === 'USER') {
    return {
      title: userSimpleMatch[1].trim(),
      email: userSimpleMatch[2].trim(),
    };
  }

  // Match pattern: "Company Name (CODE)"
  const compMatch = entityName.match(/^([^(]+)\s*\(([^)]+)\)$/i);
  if (compMatch && entityType === 'COMPANY') {
    return {
      title: compMatch[1].trim(),
      code: compMatch[2].trim(),
    };
  }

  return { title: entityName };
}

export default function AuditLogsTab({
  auditLogs = [],
  totalAuditLogsCount = 0,
  search = '',
  onSearchSubmit,
  actionFilter = 'ALL',
  onActionFilterChange,
  entityTypeFilter = 'ALL',
  onEntityTypeFilterChange,
  availableActions = [],
  sort = { field: 'timestamp', direction: 'desc' },
  onSort,
  onExportCSV,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) {
  const [localSearch, setLocalSearch] = useState(search);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(localSearch);
    }
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    if (onSearchSubmit) {
      onSearchSubmit('');
    }
  };

  const getActionBadgeClass = (action) => {
    if (!action) return 'action-tag';
    const act = action.toUpperCase();
    if (act.includes('REGISTER') || act.includes('CREATE') || act.includes('ACTIVATE')) {
      return 'action-tag action-tag--create';
    }
    if (act.includes('SUSPEND') || act.includes('DEACTIVATE') || act.includes('DELETE')) {
      return 'action-tag action-tag--danger';
    }
    if (act.includes('UPDATE') || act.includes('EDIT')) {
      return 'action-tag action-tag--update';
    }
    return 'action-tag';
  };

  const getEntityIcon = (type) => {
    switch ((type || '').toUpperCase()) {
      case 'COMPANY':
        return <Building2 size={12} className="inline-icon" />;
      case 'USER':
        return <User size={12} className="inline-icon" />;
      default:
        return <Shield size={12} className="inline-icon" />;
    }
  };

  return (
    <div className="superadmin-panel">
      {/* Toolbar: Search, Action Filter, Entity Segment, and CSV Export */}
      <div className="superadmin-toolbar">
        <form onSubmit={handleSearchSubmit} className="superadmin-search-form">
          <div className="superadmin-search-box">
            <Search size={16} className="search-box-icon" />
            <input
              type="text"
              placeholder="Search audit trail by user, action, resource, or details..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="superadmin-search-input"
            />
            {localSearch && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
          <button type="submit" className="btn btn--primary btn--sm search-submit-btn">
            <Search size={14} />
            <span>Search</span>
          </button>
        </form>

        {/* Action Type Dropdown Filter */}
        <div className={`superadmin-dropdown-wrap ${actionFilter !== 'ALL' ? 'superadmin-dropdown-wrap--active' : ''}`}>
          <Filter size={15} className="filter-select-icon" />
          <select
            value={actionFilter}
            onChange={(e) => onActionFilterChange && onActionFilterChange(e.target.value)}
            className="superadmin-filter-select"
            aria-label="Filter audit logs by action"
          >
            <option value="ALL">All Actions</option>
            {availableActions.map((act) => (
              <option key={act} value={act}>
                {act.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          {actionFilter !== 'ALL' && (
            <button
              type="button"
              className="filter-select-clear"
              onClick={() => onActionFilterChange && onActionFilterChange('ALL')}
              title="Reset Action Filter"
              aria-label="Reset Action Filter"
            >
              &times;
            </button>
          )}
        </div>

        {/* Entity Type Segment Pills */}
        <div className="status-segment-group">
          <button
            type="button"
            className={`status-segment-btn ${entityTypeFilter === 'ALL' ? 'status-segment-btn--active' : ''}`}
            onClick={() => onEntityTypeFilterChange && onEntityTypeFilterChange('ALL')}
          >
            All Entities
          </button>
          <button
            type="button"
            className={`status-segment-btn ${entityTypeFilter === 'COMPANY' ? 'status-segment-btn--active' : ''}`}
            onClick={() => onEntityTypeFilterChange && onEntityTypeFilterChange('COMPANY')}
          >
            <Building2 size={13} className="segment-btn-icon" /> Companies
          </button>
          <button
            type="button"
            className={`status-segment-btn ${entityTypeFilter === 'USER' ? 'status-segment-btn--active' : ''}`}
            onClick={() => onEntityTypeFilterChange && onEntityTypeFilterChange('USER')}
          >
            <User size={13} className="segment-btn-icon" /> Admins / Users
          </button>
        </div>

        {/* CSV Export Button */}
        {onExportCSV && (
          <button
            type="button"
            className="btn btn--outline btn--sm export-btn"
            onClick={onExportCSV}
            title="Export audit trail events to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Desktop Audit Logs Table */}
      <div className="desktop-table-wrap">
        <div className="table-responsive">
          <table className="superadmin-table audit-logs-table">
            <thead>
              <tr>
                <th className="th-sortable" onClick={() => onSort && onSort('timestamp')}>
                  <div className="th-content">
                    <span>Timestamp</span>
                    {sort.field === 'timestamp' ? (
                      sort.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                    ) : (
                      <ArrowUpDown size={13} className="sort-idle" />
                    )}
                  </div>
                </th>
                <th className="th-sortable" onClick={() => onSort && onSort('action')}>
                  <div className="th-content">
                    <span>Action</span>
                    {sort.field === 'action' ? (
                      sort.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                    ) : (
                      <ArrowUpDown size={13} className="sort-idle" />
                    )}
                  </div>
                </th>
                <th className="th-sortable" onClick={() => onSort && onSort('entityType')}>
                  <div className="th-content">
                    <span>Entity Scope</span>
                    {sort.field === 'entityType' ? (
                      sort.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                    ) : (
                      <ArrowUpDown size={13} className="sort-idle" />
                    )}
                  </div>
                </th>
                <th>Target Resource</th>
                <th>Performed By</th>
                <th>Audit Details</th>
                <th className="th-actions">Inspect</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="td-empty">
                    <Clock size={32} className="empty-icon" />
                    <p>No audit log events match your current filter or search criteria.</p>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      onClick={() => {
                        if (onSearchSubmit) onSearchSubmit('');
                        if (onActionFilterChange) onActionFilterChange('ALL');
                        if (onEntityTypeFilterChange) onEntityTypeFilterChange('ALL');
                      }}
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    title="Click to inspect full audit event snapshot"
                  >
                    <td className="td-subtle">
                      <Clock size={12} className="inline-icon" />
                      {formatAuditTimestamp(log.timestamp || log.formattedTimestamp)}
                    </td>
                    <td>
                      <span className={getActionBadgeClass(log.action)}>
                        {log.action ? log.action.replace(/_/g, ' ') : ''}
                      </span>
                    </td>
                    <td>
                      <span className="entity-tag">
                        {getEntityIcon(log.entityType)}
                        {log.entityType}
                      </span>
                    </td>
                    <td
                      className="td-strong td-nowrap"
                      title={log.entityName || `Resource #${log.entityId || log.id}`}
                    >
                      {log.entityName || `Resource #${log.entityId || log.id}`}
                    </td>
                    <td className="td-subtle td-nowrap" title={log.performedBy}>
                      {log.performedBy}
                    </td>
                    <td className="td-details" title={log.details || 'No narrative'}>
                      {log.details || '—'}
                    </td>
                    <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                      <div className="td-actions__group">
                        <button
                          type="button"
                          className="action-btn action-btn--inspect"
                          onClick={() => setSelectedLog(log)}
                          title="View Full Audit Snapshot"
                          aria-label="View Full Audit Snapshot"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List for Audit Logs */}
      <div className="mobile-card-list">
        {auditLogs.length === 0 ? (
          <div className="mobile-card mobile-card--empty">
            <Clock size={32} className="mobile-card__empty-icon" />
            <p className="mobile-card__empty-text">No audit log events match your filter.</p>
          </div>
        ) : (
          auditLogs.map((log) => {
            const target = formatAuditTarget(log.entityName, log.entityType);
            const trimmedDetails = log.details ? log.details.trim() : '';
            const isDetailsRedundant =
              !trimmedDetails ||
              (log.entityName && trimmedDetails.toLowerCase() === log.entityName.trim().toLowerCase()) ||
              trimmedDetails.toLowerCase().startsWith('created facility admin:') ||
              trimmedDetails.toLowerCase().startsWith('updated facility admin:') ||
              (log.action?.includes('ACTIVATE') && /^(status:\s*)?(active|inactive)$/i.test(trimmedDetails)) ||
              (log.action?.includes('DEACTIVATE') && /^(status:\s*)?(active|inactive)$/i.test(trimmedDetails));

            return (
              <div key={log.id} className="mobile-card audit-mobile-card" onClick={() => setSelectedLog(log)}>
                {/* Header: Badges & Timestamp */}
                <div className="audit-mobile-card__header">
                  <div className="audit-mobile-card__badges">
                    <span className={getActionBadgeClass(log.action)}>
                      {log.action ? log.action.replace(/_/g, ' ') : ''}
                    </span>
                    <span className="entity-tag">
                      {getEntityIcon(log.entityType)} {log.entityType}
                    </span>
                  </div>
                  <span className="audit-mobile-card__time">
                    <Clock size={11} className="inline-icon" />
                    {formatAuditTimestamp(log.timestamp || log.formattedTimestamp)}
                  </span>
                </div>

                {/* Target Resource Section */}
                <div className="audit-mobile-target">
                  <div className="audit-mobile-target__header">
                    <h4 className="audit-mobile-target__name">{target.title}</h4>
                    {target.code && <span className="code-pill">{target.code}</span>}
                  </div>

                  {(target.email || target.company) && (
                    <div className="audit-mobile-target__meta">
                      {target.email && (
                        <span className="audit-mobile-meta-item">
                          <Mail size={12} />
                          <span>{target.email}</span>
                        </span>
                      )}
                      {target.company && (
                        <span className="audit-mobile-meta-item company-badge">
                          <Building2 size={12} />
                          <span>{target.company}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Narrative / State Changes (only when informative and non-redundant) */}
                {trimmedDetails && !isDetailsRedundant && (
                  <div className="audit-mobile-narrative">
                    <span>{trimmedDetails}</span>
                  </div>
                )}

                {/* Footer: Performed By + Proper Inspect Button */}
                <div className="mobile-card__footer">
                  <span className="td-subtle mobile-card__author" title={log.performedBy}>
                    By: {log.performedBy ? log.performedBy.split('(')[0].trim() : 'System'}
                  </span>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm audit-inspect-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLog(log);
                    }}
                    title="Inspect Full Audit Record"
                  >
                    <Eye size={13} />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalAuditLogsCount > 0 ? totalAuditLogsCount : auditLogs.length}
        itemName="audit events"
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      {/* Audit Detail Inspector Modal */}
      {selectedLog && (
        <div className="confirm-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div
            className="confirm-modal confirm-modal--audit-inspector"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="confirm-modal__body">
              <div className="audit-inspector-header">
                <div className="audit-inspector-title-group">
                  <div className="confirm-modal__icon-badge confirm-modal__icon-badge--primary">
                    <Activity size={22} />
                  </div>
                  <div>
                    <span className="confirm-modal__subtitle">System Audit Snapshot</span>
                    <h3 className="confirm-modal__title audit-inspector-title">
                      Audit Event #{selectedLog.id}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  className="audit-inspector-close-btn"
                  onClick={() => setSelectedLog(null)}
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="audit-inspector-grid">
                <div className="drawer-metric-card">
                  <span className="drawer-metric-card__label">Action</span>
                  <span className={`${getActionBadgeClass(selectedLog.action)} audit-metric-badge`}>
                    {selectedLog.action ? selectedLog.action.replace(/_/g, ' ') : ''}
                  </span>
                </div>
                <div className="drawer-metric-card">
                  <span className="drawer-metric-card__label">Entity Scope</span>
                  <span className="entity-tag audit-metric-badge">
                    {getEntityIcon(selectedLog.entityType)} {selectedLog.entityType}
                  </span>
                </div>
                <div className="drawer-metric-card">
                  <span className="drawer-metric-card__label">Timestamp</span>
                  <span className="drawer-metric-card__value audit-metric-timestamp">
                    {formatDateTime(selectedLog.timestamp || selectedLog.formattedTimestamp, { showSeconds: true })}
                  </span>
                </div>
                <div className="drawer-metric-card">
                  <span className="drawer-metric-card__label">Performed By</span>
                  <span className="drawer-metric-card__value audit-metric-author">
                    {selectedLog.performedBy}
                  </span>
                </div>
              </div>

              {selectedLog.companyName && (
                <div className="confirm-modal__target-card audit-scope-card">
                  <div>
                    <div className="confirm-modal__target-name">{selectedLog.companyName}</div>
                    <div className="confirm-modal__target-sub">Associated Tenant Scope</div>
                  </div>
                </div>
              )}

              {/* Detail / Change Comparison Box */}
              <div className="audit-narrative-box">
                <div className="audit-narrative-heading">
                  Recorded Changes & Log Narrative:
                </div>

                {/* Show general details narrative only when not redundant with newValue/oldValue */}
                {selectedLog.details &&
                  selectedLog.details !== selectedLog.newValue &&
                  selectedLog.details !== selectedLog.oldValue && (
                    <div className="audit-narrative-body">
                      {selectedLog.details}
                    </div>
                  )}

                {selectedLog.oldValue && (
                  <div className="audit-state-diff">
                    <span className="audit-diff-label audit-diff-label--prev">
                      Previous State:
                    </span>
                    <div className="audit-diff-value">
                      {selectedLog.oldValue}
                    </div>
                  </div>
                )}
                {selectedLog.newValue && (
                  <div className="audit-state-diff--new">
                    <span className="audit-diff-label audit-diff-label--new">
                      New State:
                    </span>
                    <div className="audit-diff-value">
                      {selectedLog.newValue}
                    </div>
                  </div>
                )}

                {/* Fallback for logs without oldValue/newValue */}
                {!selectedLog.oldValue && !selectedLog.newValue && selectedLog.details && (
                  <div className="audit-narrative-body">
                    {selectedLog.details}
                  </div>
                )}
              </div>
            </div>

            <div className="confirm-modal__footer">
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => setSelectedLog(null)}
              >
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
