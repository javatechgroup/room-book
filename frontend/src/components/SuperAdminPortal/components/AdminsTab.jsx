import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Building2,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Mail,
  Clock,
  Edit2,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import SuperAdminPagination from './SuperAdminPagination';

export default function AdminsTab({
  admins = [],
  activeAdminsCount = 0,
  companies = [],
  paginatedAdmins = [],
  totalFilteredCount = 0,
  search = '',
  onSearchChange,
  onSearchSubmit,
  companyFilter = 'ALL',
  onCompanyFilterChange,
  statusFilter = 'ALL',
  onStatusFilterChange,
  sort = { field: 'fullName', direction: 'asc' },
  onSort,
  onEdit,
  onToggleStatus,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(localSearch);
    } else if (onSearchChange) {
      onSearchChange(localSearch);
    }
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    if (onSearchSubmit) {
      onSearchSubmit('');
    } else if (onSearchChange) {
      onSearchChange('');
    }
  };

  return (
    <div className="superadmin-panel">
      {/* Toolbar: Search Form with Submit Button, Company Filter, and Status Filter */}
      <div className="superadmin-toolbar">
        <form onSubmit={handleSearchSubmit} className="superadmin-search-form">
          <div className="superadmin-search-box">
            <Search size={16} className="search-box-icon" />
            <input
              type="text"
              placeholder="Search by administrator name, email, or company..."
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

        {/* Company Filter Dropdown */}
        <div className={`superadmin-dropdown-wrap ${companyFilter !== 'ALL' ? 'superadmin-dropdown-wrap--active' : ''}`}>
          <Building2 size={15} className="filter-select-icon" />
          <select
            value={companyFilter}
            onChange={(e) => onCompanyFilterChange && onCompanyFilterChange(e.target.value)}
            className="superadmin-filter-select"
            aria-label="Filter administrators by tenant company"
          >
            <option value="ALL">All Tenant Companies ({companies.length})</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.companyCode})
              </option>
            ))}
          </select>
          {companyFilter !== 'ALL' ? (
            <button
              type="button"
              className="filter-select-clear"
              onClick={() => onCompanyFilterChange && onCompanyFilterChange('ALL')}
              title="Reset to All Tenant Companies"
              aria-label="Reset to All Tenant Companies"
            >
              &times;
            </button>
          ) : (
            <ChevronDown size={15} className="filter-select-arrow" />
          )}
        </div>

        {/* Status Segment Pills */}
        <div className="status-segment-group">
          <button
            type="button"
            className={`status-segment-btn ${statusFilter === 'ALL' ? 'status-segment-btn--active' : ''}`}
            onClick={() => onStatusFilterChange && onStatusFilterChange('ALL')}
          >
            All <span>{admins.length}</span>
          </button>
          <button
            type="button"
            className={`status-segment-btn ${statusFilter === 'ACTIVE' ? 'status-segment-btn--active' : ''}`}
            onClick={() => onStatusFilterChange && onStatusFilterChange('ACTIVE')}
          >
            Active <span>{activeAdminsCount}</span>
          </button>
          <button
            type="button"
            className={`status-segment-btn ${statusFilter === 'INACTIVE' ? 'status-segment-btn--active' : ''}`}
            onClick={() => onStatusFilterChange && onStatusFilterChange('INACTIVE')}
          >
            Suspended <span>{admins.length - activeAdminsCount}</span>
          </button>
        </div>
      </div>

      {/* Desktop Admins Table */}
      <div className="desktop-table-wrap">
        <div className="table-responsive">
          <table className="superadmin-table">
            <thead>
              <tr>
                <th className="th-sortable" onClick={() => onSort && onSort('fullName')}>
                  <div className="th-content">
                    <span>Administrator Name</span>
                    {sort.field === 'fullName' ? (
                      sort.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                    ) : (
                      <ArrowUpDown size={13} className="sort-idle" />
                    )}
                  </div>
                </th>
                <th>Corporate Email</th>
                <th className="th-sortable" onClick={() => onSort && onSort('companyName')}>
                  <div className="th-content">
                    <span>Assigned Company</span>
                    {sort.field === 'companyName' ? (
                      sort.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                    ) : (
                      <ArrowUpDown size={13} className="sort-idle" />
                    )}
                  </div>
                </th>
                <th>Role Scope</th>
                <th>Last Active</th>
                <th className="th-sortable" onClick={() => onSort && onSort('status')}>
                  <div className="th-content">
                    <span>Status</span>
                    {sort.field === 'status' ? (
                      sort.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                    ) : (
                      <ArrowUpDown size={13} className="sort-idle" />
                    )}
                  </div>
                </th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAdmins.length === 0 ? (
                <tr>
                  <td colSpan="7" className="td-empty">
                    <Users size={32} className="empty-icon" />
                    <p>No Facility Administrators match your search criteria.</p>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      onClick={() => {
                        if (onSearchChange) onSearchChange('');
                        if (onCompanyFilterChange) onCompanyFilterChange('ALL');
                        if (onStatusFilterChange) onStatusFilterChange('ALL');
                      }}
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedAdmins.map((a) => (
                  <tr key={a.id}>
                    <td className="td-strong">
                      <div className="admin-user-cell">
                        <div className="admin-avatar">
                          {a.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="admin-name">{a.fullName}</span>
                          <span className="admin-id">User #{a.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="contact-chip">
                        <Mail size={12} />
                        <a href={`mailto:${a.email}`}>{a.email}</a>
                      </span>
                    </td>
                    <td>
                      <span className="company-badge">
                        <Building2 size={12} />
                        {a.companyName}
                      </span>
                    </td>
                    <td>
                      <span className="role-tag">COMPANY_ADMIN</span>
                    </td>
                    <td className="td-subtle">{a.lastLogin || 'Recent'}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          a.status === 'ACTIVE' ? 'status-pill--active' : 'status-pill--inactive'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="td-actions">
                      <button
                        type="button"
                        className="action-btn action-btn--edit"
                        onClick={() => onEdit && onEdit(a)}
                        title="Edit Administrator"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className={`action-btn ${
                          a.status === 'ACTIVE' ? 'action-btn--deactivate' : 'action-btn--activate'
                        }`}
                        onClick={() => onToggleStatus && onToggleStatus(a.id)}
                        title={a.status === 'ACTIVE' ? 'Suspend Admin' : 'Activate Admin'}
                      >
                        {a.status === 'ACTIVE' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List for Admins (Visible on mobile/tablet < 768px) */}
      <div className="mobile-card-list">
        {paginatedAdmins.length === 0 ? (
          <div className="mobile-empty-state">
            <Users size={32} className="empty-icon" />
            <p>No Facility Administrators match your search criteria.</p>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => {
                if (onSearchChange) onSearchChange('');
                if (onCompanyFilterChange) onCompanyFilterChange('ALL');
                if (onStatusFilterChange) onStatusFilterChange('ALL');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          paginatedAdmins.map((a) => (
            <div key={a.id} className="mobile-card">
              <div className="mobile-card__header">
                <div className="admin-user-cell">
                  <div className="admin-avatar">
                    {a.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="admin-name">{a.fullName}</span>
                    <span className="admin-id">User #{a.id}</span>
                  </div>
                </div>
                <span
                  className={`status-pill ${
                    a.status === 'ACTIVE' ? 'status-pill--active' : 'status-pill--inactive'
                  }`}
                >
                  {a.status}
                </span>
              </div>

              <div className="mobile-card__details">
                <div className="mobile-card__info-row">
                  <Mail size={14} className="mobile-card__icon" />
                  <a href={`mailto:${a.email}`} className="mobile-card__link">
                    {a.email}
                  </a>
                </div>
                <div className="mobile-card__info-row">
                  <Building2 size={14} className="mobile-card__icon" />
                  <span className="company-badge">{a.companyName}</span>
                </div>
                <div className="mobile-card__info-row">
                  <Clock size={14} className="mobile-card__icon" />
                  <span className="mobile-card__text">Last active: {a.lastLogin || 'Recent'}</span>
                </div>
              </div>

              <div className="mobile-card__footer">
                <span className="role-tag">COMPANY_ADMIN</span>
                <div className="mobile-card__actions">
                  <button
                    type="button"
                    className="action-btn action-btn--edit"
                    onClick={() => onEdit && onEdit(a)}
                    title="Edit Administrator"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    className={`action-btn ${
                      a.status === 'ACTIVE' ? 'action-btn--deactivate' : 'action-btn--activate'
                    }`}
                    onClick={() => onToggleStatus && onToggleStatus(a.id)}
                    title={a.status === 'ACTIVE' ? 'Suspend Admin' : 'Activate Admin'}
                  >
                    {a.status === 'ACTIVE' ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <SuperAdminPagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalFilteredCount}
        itemName="administrators"
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
