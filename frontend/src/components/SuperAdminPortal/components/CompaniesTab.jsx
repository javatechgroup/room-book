import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Search,
  Download,
  Eye,
  Edit2,
  XCircle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import BulkOperationsToolbar from './BulkOperationsToolbar';
import Pagination from '../../common/Pagination/Pagination';
import SearchInput from '../../common/SearchInput/SearchInput';
import { formatEstDate } from '../../../utils/dateUtils';

export default function CompaniesTab({
  companies = [],
  activeCompaniesCount = 0,
  paginatedCompanies = [],
  totalFilteredCount = 0,
  search = '',
  onSearchChange,
  onSearchSubmit,
  statusFilter = 'ALL',
  onStatusFilterChange,
  sort = { field: 'name', direction: 'asc' },
  onSort,
  selectedIds = [],
  onToggleSelect,
  onSelectAllPage,
  isAllPageSelected = false,
  admins = [],
  onInspect,
  onEdit,
  onToggleStatus,
  onViewAdmins,
  onBulkActivate,
  onBulkDeactivate,
  onBulkExport,
  onBulkClear,
  onExportCSV,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <div className="superadmin-panel">
      {/* Toolbar: Search Form with Submit Button, Status Segments, and CSV Export */}
      <div className="superadmin-toolbar">
        <SearchInput
          value={search}
          onChange={(val) => {
            if (onSearchSubmit) onSearchSubmit(val);
            else if (onSearchChange) onSearchChange(val);
          }}
          placeholder="Search by company name, code, contact or city..."
        />

        {/* Status Segment Pills with Live Counts */}
        <div className="status-segment-group">
          <button
            type="button"
            className={`status-segment-btn ${statusFilter === 'ALL' ? 'status-segment-btn--active' : ''}`}
            onClick={() => onStatusFilterChange && onStatusFilterChange('ALL')}
          >
            All <span>{companies.length}</span>
          </button>
          <button
            type="button"
            className={`status-segment-btn ${statusFilter === 'ACTIVE' ? 'status-segment-btn--active' : ''}`}
            onClick={() => onStatusFilterChange && onStatusFilterChange('ACTIVE')}
          >
            Active <span>{activeCompaniesCount}</span>
          </button>
          <button
            type="button"
            className={`status-segment-btn ${statusFilter === 'INACTIVE' ? 'status-segment-btn--active' : ''}`}
            onClick={() => onStatusFilterChange && onStatusFilterChange('INACTIVE')}
          >
            Suspended <span>{companies.length - activeCompaniesCount}</span>
          </button>
        </div>

        <button
          type="button"
          className="btn btn--outline btn--sm export-btn"
          onClick={onExportCSV}
          title="Export company list to CSV spreadsheet"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Floating Bulk Operations Toolbar */}
      <BulkOperationsToolbar
        selectedCount={selectedIds.length}
        entityName="companies"
        onActivate={onBulkActivate}
        onSuspend={onBulkDeactivate}
        onExport={onBulkExport}
        onClear={onBulkClear}
      />

      {/* Desktop Data Table */}
      <div className="desktop-table-wrap">
        <div className="table-responsive">
          <table className="superadmin-table companies-table">
            <thead>
              <tr>
                <th className="th-checkbox">
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={onSelectAllPage}
                    aria-label="Select all on this page"
                  />
                </th>
                <th className="th-sortable" onClick={() => onSort && onSort('companyCode')}>
                  <div className="th-content">
                    <span>Code</span>
                    {sort.field === 'companyCode' ? (
                      sort.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                    ) : (
                      <ArrowUpDown size={13} className="sort-idle" />
                    )}
                  </div>
                </th>
                <th className="th-sortable" onClick={() => onSort && onSort('name')}>
                  <div className="th-content">
                    <span>Tenant Company</span>
                    {sort.field === 'name' ? (
                      sort.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                    ) : (
                      <ArrowUpDown size={13} className="sort-idle" />
                    )}
                  </div>
                </th>
                <th>Contact Info</th>
                <th>Location / Campus</th>
                <th>Facility Admins</th>
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
              {paginatedCompanies.length === 0 ? (
                <tr>
                  <td colSpan="8" className="td-empty">
                    <Building2 size={32} className="empty-icon" />
                    <p>No companies match your current search or filter.</p>
                    {(search || statusFilter !== 'ALL') && (
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => {
                          if (onSearchSubmit) onSearchSubmit('');
                          else if (onSearchChange) onSearchChange('');
                          if (onStatusFilterChange) onStatusFilterChange('ALL');
                        }}
                      >
                        Reset All Filters & Search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedCompanies.map((c) => {
                  const compAdmins = admins.filter((a) => a.companyId === c.id);
                  const isSelected = selectedIds.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={`${isSelected ? 'tr--selected' : ''}`}
                      onClick={() => onInspect && onInspect(c)}
                    >
                      <td className="td-checkbox" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect && onToggleSelect(c.id)}
                        />
                      </td>
                      <td>
                        <span className="code-pill">{c.companyCode}</span>
                      </td>
                      <td className="td-strong">
                        <div className="company-title-cell">
                          <span className="company-name">{c.name}</span>
                          <span className="company-created">{formatEstDate(c.createdAt)}</span>
                        </div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="contact-cell">
                          <span className="contact-item">
                            <Mail size={13} />
                            <a
                              href={`mailto:${c.contactInformation}`}
                              title={`Send email to ${c.contactInformation}`}
                            >
                              {c.contactInformation || 'Not configured'}
                            </a>
                          </span>
                          {c.phone && (
                            <span className="contact-item contact-item--phone">
                              <Phone size={12} />
                              <span>{c.phone}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="address-snippet" title={c.address}>
                          <MapPin size={12} />
                          {c.address || 'Not specified'}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="admin-count-pill"
                          onClick={() => onViewAdmins && onViewAdmins(c.id)}
                          title={`View ${compAdmins.length} admins assigned to ${c.name}`}
                        >
                          <Users size={12} />
                          <span>{compAdmins.length} Admin{compAdmins.length === 1 ? '' : 's'}</span>
                          <ChevronRight size={12} />
                        </button>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            c.status === 'ACTIVE' ? 'status-pill--active' : 'status-pill--inactive'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                        <div className="td-actions__group">
                          <button
                            type="button"
                            className="action-btn action-btn--inspect"
                            onClick={() => onInspect && onInspect(c)}
                            title="Inspect Details"
                            aria-label={`Inspect ${c.name}`}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            className="action-btn action-btn--edit"
                            onClick={() => onEdit && onEdit(c)}
                            title="Edit Company Details"
                            aria-label={`Edit ${c.name}`}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className={`action-btn ${
                              c.status === 'ACTIVE' ? 'action-btn--deactivate' : 'action-btn--activate'
                            }`}
                            onClick={() => onToggleStatus && onToggleStatus(c.id)}
                            title={c.status === 'ACTIVE' ? 'Suspend Company' : 'Activate Company'}
                            aria-label={c.status === 'ACTIVE' ? `Suspend ${c.name}` : `Activate ${c.name}`}
                          >
                            {c.status === 'ACTIVE' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List (Visible on mobile/tablet < 768px) */}
      <div className="mobile-card-list">
        {paginatedCompanies.length === 0 ? (
          <div className="mobile-empty-state">
            <Building2 size={32} className="empty-icon" />
            <p>No companies match your current search or filter.</p>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => {
                if (onSearchChange) onSearchChange('');
                if (onStatusFilterChange) onStatusFilterChange('ALL');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          paginatedCompanies.map((c) => {
            const compAdmins = admins.filter((a) => a.companyId === c.id);
            const isSelected = selectedIds.includes(c.id);
            return (
              <div
                key={c.id}
                className={`mobile-card ${isSelected ? 'mobile-card--selected' : ''}`}
                onClick={() => onInspect && onInspect(c)}
              >
                <div className="mobile-card__header">
                  <div className="mobile-card__header-left" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect && onToggleSelect(c.id)}
                      className="mobile-card-checkbox"
                      aria-label={`Select ${c.name}`}
                    />
                    <span className="code-pill">{c.companyCode}</span>
                  </div>
                  <span
                    className={`status-pill ${
                      c.status === 'ACTIVE' ? 'status-pill--active' : 'status-pill--inactive'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="mobile-card__title-row">
                  <h4 className="mobile-card__title">{c.name}</h4>
                  <span className="mobile-card__subtitle">{formatEstDate(c.createdAt)}</span>
                </div>

                <div className="mobile-card__details">
                  <div className="mobile-card__info-row" onClick={(e) => e.stopPropagation()}>
                    <Mail size={14} className="mobile-card__icon" />
                    <a href={`mailto:${c.contactInformation}`} className="mobile-card__link">
                      {c.contactInformation || 'No email registered'}
                    </a>
                  </div>
                  {c.phone && (
                    <div className="mobile-card__info-row" onClick={(e) => e.stopPropagation()}>
                      <Phone size={14} className="mobile-card__icon" />
                      <a href={`tel:${c.phone}`} className="mobile-card__link">
                        {c.phone}
                      </a>
                    </div>
                  )}
                  {c.address && (
                    <div className="mobile-card__info-row">
                      <MapPin size={14} className="mobile-card__icon" />
                      <span className="mobile-card__text">{c.address}</span>
                    </div>
                  )}
                </div>

                <div className="mobile-card__footer">
                  <button
                    type="button"
                    className="admin-count-pill"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onViewAdmins) onViewAdmins(c.id);
                    }}
                  >
                    <Users size={12} />
                    <span>{compAdmins.length} Admin{compAdmins.length === 1 ? '' : 's'}</span>
                    <ChevronRight size={12} />
                  </button>

                  <div className="mobile-card__actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="action-btn action-btn--inspect"
                      onClick={() => onInspect && onInspect(c)}
                      title="Inspect Details"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      className="action-btn action-btn--edit"
                      onClick={() => onEdit && onEdit(c)}
                      title="Edit Company Details"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className={`action-btn ${
                        c.status === 'ACTIVE' ? 'action-btn--deactivate' : 'action-btn--activate'
                      }`}
                      onClick={() => onToggleStatus && onToggleStatus(c.id)}
                      title={c.status === 'ACTIVE' ? 'Suspend Company' : 'Activate Company'}
                    >
                      {c.status === 'ACTIVE' ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                    </button>
                  </div>
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
        totalItems={totalFilteredCount}
        itemName="companies"
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
