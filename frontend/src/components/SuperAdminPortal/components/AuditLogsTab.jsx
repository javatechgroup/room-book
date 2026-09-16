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
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  X,
  Activity,
  Layers,
} from 'lucide-react';
import Pagination from '../../common/Pagination/Pagination';

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
            <Building2 size={13} style={{ marginRight: 4 }} /> Companies
          </button>
          <button
            type="button"
            className={`status-segment-btn ${entityTypeFilter === 'USER' ? 'status-segment-btn--active' : ''}`}
            onClick={() => onEntityTypeFilterChange && onEntityTypeFilterChange('USER')}
          >
            <User size={13} style={{ marginRight: 4 }} /> Admins / Users
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
          <table className="superadmin-table">
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
                    style={{ cursor: 'pointer' }}
                    title="Click to inspect audit event details"
                  >
                    <td className="td-subtle">
                      <Clock size={12} className="inline-icon" />
                      {log.formattedTimestamp || log.timestamp}
                    </td>
                    <td>
                      <span className={getActionBadgeClass(log.action)}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className="entity-tag">
                        {getEntityIcon(log.entityType)}
                        {log.entityType}
                      </span>
                    </td>
                    <td className="td-strong">{log.entityName || `Resource #${log.entityId || log.id}`}</td>
                    <td className="td-subtle">{log.performedBy}</td>
                    <td className="td-details">{log.details}</td>
                    <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="action-btn action-btn--inspect"
                        onClick={() => setSelectedLog(log)}
                        title="View Full Audit Snapshot"
                      >
                        <Eye size={14} />
                      </button>
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
          <div className="mobile-card" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
            <Clock size={32} style={{ margin: '0 auto 10px', opacity: 0.7 }} />
            <p style={{ margin: 0, fontWeight: 500 }}>No audit log events match your filter.</p>
          </div>
        ) : (
          auditLogs.map((log) => (
            <div key={log.id} className="mobile-card" onClick={() => setSelectedLog(log)}>
              <div className="mobile-card__header">
                <span className={getActionBadgeClass(log.action)}>{log.action}</span>
                <span className="td-subtle">
                  <Clock size={12} className="inline-icon" />
                  {log.formattedTimestamp || log.timestamp}
                </span>
              </div>

              <div className="mobile-card__title-row">
                <h4 className="mobile-card__title">{log.entityName || `Resource #${log.entityId || log.id}`}</h4>
                <span className="entity-tag">
                  {getEntityIcon(log.entityType)} {log.entityType}
                </span>
              </div>

              <div className="mobile-card__details">
                <div className="mobile-card__info-row">
                  <span className="mobile-card__text">{log.details}</span>
                </div>
              </div>

              <div className="mobile-card__footer">
                <span className="td-subtle" style={{ fontSize: '0.78rem' }}>
                  By: {log.performedBy}
                </span>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLog(log);
                  }}
                >
                  <Eye size={12} /> Inspect
                </button>
              </div>
            </div>
          ))
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
            className="confirm-modal"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="confirm-modal__body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="confirm-modal__icon-badge confirm-modal__icon-badge--primary">
                    <Activity size={22} />
                  </div>
                  <div>
                    <span className="confirm-modal__subtitle">System Audit Snapshot</span>
                    <h3 className="confirm-modal__title" style={{ fontSize: '1.2rem' }}>
                      Audit Event #{selectedLog.id}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  className="drawer-close"
                  onClick={() => setSelectedLog(null)}
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div className="drawer-metric-card">
                  <span className="drawer-metric-card__label">Action</span>
                  <span className={getActionBadgeClass(selectedLog.action)} style={{ display: 'inline-block', marginTop: 4 }}>
                    {selectedLog.action}
                  </span>
                </div>
                <div className="drawer-metric-card">
                  <span className="drawer-metric-card__label">Entity Scope</span>
                  <span className="entity-tag" style={{ display: 'inline-block', marginTop: 4 }}>
                    {getEntityIcon(selectedLog.entityType)} {selectedLog.entityType}
                  </span>
                </div>
                <div className="drawer-metric-card">
                  <span className="drawer-metric-card__label">Timestamp</span>
                  <span className="drawer-metric-card__value" style={{ fontSize: '0.9rem' }}>
                    {selectedLog.formattedTimestamp || selectedLog.timestamp}
                  </span>
                </div>
                <div className="drawer-metric-card">
                  <span className="drawer-metric-card__label">Performed By</span>
                  <span className="drawer-metric-card__value" style={{ fontSize: '0.85rem' }}>
                    {selectedLog.performedBy}
                  </span>
                </div>
              </div>

              {selectedLog.companyName && (
                <div className="confirm-modal__target-card" style={{ marginBottom: '14px' }}>
                  <div>
                    <div className="confirm-modal__target-name">{selectedLog.companyName}</div>
                    <div className="confirm-modal__target-sub">Associated Tenant Scope</div>
                  </div>
                </div>
              )}

              {/* Detail / Change Comparison Box */}
              <div style={{ background: 'var(--surface-subtle, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-heading)', marginBottom: '8px' }}>
                  Recorded Changes & Log Narrative:
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                  {selectedLog.details}
                </div>

                {selectedLog.oldValue && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--border-color)' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>
                      Previous State:
                    </span>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {selectedLog.oldValue}
                    </div>
                  </div>
                )}
                {selectedLog.newValue && (
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                      New State:
                    </span>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {selectedLog.newValue}
                    </div>
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
