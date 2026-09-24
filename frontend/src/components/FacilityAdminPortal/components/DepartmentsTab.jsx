import React, { useState, useEffect } from 'react';
import {
  Search,
  Building2,
  Users,
  Edit2,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronRight,
  Eye,
} from 'lucide-react';
import Pagination from '../../common/Pagination/Pagination';
import SearchInput from '../../common/SearchInput/SearchInput';
import { formatDate } from '../../../utils/dateUtils';

export default function DepartmentsTab({
  departments = [],
  search = '',
  onSearchChange,
  statusFilter = 'ALL',
  onStatusFilterChange,
  sortBy = 'name',
  sortDir = 'asc',
  onSort,
  onOpenCreateDepartment,
  onOpenEditDepartment,
  onToggleStatus,
  onViewDepartmentEmployees,
  onInspectDepartment,
  page = 1,
  pageSize = 10,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const activeCount = departments.filter((d) => d.status === 'ACTIVE').length;
  const inactiveCount = departments.filter((d) => d.status === 'INACTIVE').length;

  return (
    <div className="superadmin-tab-content">
      {/* SuperAdmin Toolbar */}
      <div className="superadmin-toolbar">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search departments by name..."
        />

        <div className="superadmin-filter-group">
          {/* Status Segmented Buttons */}
          <div className="status-segment-group">
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'ALL' ? 'status-segment-btn--active' : ''}`}
              onClick={() => onStatusFilterChange('ALL')}
            >
              All <span>{totalCount > 0 ? totalCount : departments.length}</span>
            </button>
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'ACTIVE' ? 'status-segment-btn--active' : ''}`}
              onClick={() => onStatusFilterChange('ACTIVE')}
            >
              Active <span>{activeCount}</span>
            </button>
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'INACTIVE' ? 'status-segment-btn--active' : ''}`}
              onClick={() => onStatusFilterChange('INACTIVE')}
            >
              Inactive <span>{inactiveCount}</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={onOpenCreateDepartment}
          >
            <Plus size={15} />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="desktop-table-wrap">
        <div className="table-responsive departments-table-responsive">
          <table className="superadmin-table departments-table">
            <thead>
              <tr>
                <th className="th-sortable" onClick={() => onSort && onSort('name')}>
                  <div className="th-content">
                    <span>Department Unit</span>
                    {sortBy === 'name' ? (
                      sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                    ) : (
                      <ArrowUpDown size={13} className="sort-idle" />
                    )}
                  </div>
                </th>
                <th>Assigned Staff</th>
                <th className="th-sortable" onClick={() => onSort && onSort('status')}>
                  <div className="th-content">
                    <span>Status</span>
                    {sortBy === 'status' ? (
                      sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                    ) : (
                      <ArrowUpDown size={13} className="sort-idle" />
                    )}
                  </div>
                </th>
                <th>Created Date</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="td-empty">
                    <Building2 size={32} className="empty-icon" />
                    <p>
                      {search || statusFilter !== 'ALL'
                        ? 'No departments match your active filters.'
                        : 'No departments configured yet.'}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                      {(search || statusFilter !== 'ALL') && (
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          onClick={() => {
                            if (onSearchChange) onSearchChange('');
                            onStatusFilterChange && onStatusFilterChange('ALL');
                          }}
                        >
                          Reset Filters
                        </button>
                      )}
                      <button type="button" className="btn btn--outline btn--sm" onClick={onOpenCreateDepartment}>
                        <Plus size={14} /> Add Department
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                departments.map((dept) => {
                  const isActive = dept.status === 'ACTIVE';

                  return (
                    <tr
                      key={dept.id}
                      onClick={() => onInspectDepartment && onInspectDepartment(dept)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="td-strong">
                        <div className="entity-cell">
                          <div className="entity-cell__icon entity-cell__icon--purple">
                            <Building2 size={16} />
                          </div>
                          <div className="entity-cell__content">
                            <div className="entity-cell__name">{dept.name}</div>
                            <div className="entity-cell__sub">ID: #{dept.id}</div>
                          </div>
                        </div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="admin-count-pill"
                          onClick={() => onViewDepartmentEmployees && onViewDepartmentEmployees(dept.id)}
                          title={`View ${dept.employeeCount || 0} employees in ${dept.name}`}
                        >
                          <Users size={12} />
                          <span>{dept.employeeCount || 0} Staff</span>
                          <ChevronRight size={12} />
                        </button>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className={`status-badge-btn ${isActive ? 'status-badge-btn--active' : 'status-badge-btn--inactive'}`}
                          onClick={() => onToggleStatus(dept.id)}
                          title="Click to toggle status"
                        >
                          <span className="status-badge__dot" />
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td>
                        <span className="table-date">{formatDate(dept.createdAt)}</span>
                      </td>
                      <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                        <div className="td-actions__group">
                          <button
                            type="button"
                            className="action-btn action-btn--inspect"
                            onClick={() => onInspectDepartment && onInspectDepartment(dept)}
                            title="Inspect Department Profile"
                            aria-label={`Inspect ${dept.name}`}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            className="action-btn action-btn--edit"
                            onClick={() => onOpenEditDepartment(dept)}
                            title="Edit Department Details"
                            aria-label={`Edit ${dept.name}`}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className={`action-btn ${isActive ? 'action-btn--deactivate' : 'action-btn--activate'}`}
                            onClick={() => onToggleStatus(dept.id)}
                            title={isActive ? 'Deactivate Department' : 'Activate Department'}
                            aria-label={isActive ? `Deactivate ${dept.name}` : `Activate ${dept.name}`}
                          >
                            {isActive ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
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
        {departments.length === 0 ? (
          <div className="mobile-empty-state">
            <Building2 size={32} className="empty-icon" />
            <p>No departments match your filter.</p>
            <button type="button" className="btn btn--outline btn--sm" onClick={onOpenCreateDepartment}>
              Add Department
            </button>
          </div>
        ) : (
          departments.map((dept) => {
            const isActive = dept.status === 'ACTIVE';
            return (
              <div
                key={dept.id}
                className="mobile-card"
                onClick={() => onInspectDepartment && onInspectDepartment(dept)}
                style={{ cursor: 'pointer' }}
              >
                <div className="mobile-card__header">
                  <div className="mobile-card__header-left">
                    <div className="mobile-card__title-row">
                      <h4 className="mobile-card__title">{dept.name}</h4>
                      <span className="mobile-card__subtitle">Department ID: #{dept.id}</span>
                    </div>
                  </div>
                  <span className={`status-pill ${isActive ? 'status-pill--active' : 'status-pill--inactive'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mobile-card__details">
                  <div className="mobile-card__info-row" onClick={(e) => e.stopPropagation()}>
                    <Users size={14} className="mobile-card__icon" />
                    <button
                      type="button"
                      className="admin-count-pill"
                      onClick={() => onViewDepartmentEmployees && onViewDepartmentEmployees(dept.id)}
                    >
                      <span>{dept.employeeCount || 0} Staff Members</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="mobile-card__info-row">
                    <span className="mobile-card__text">Created on {formatDate(dept.createdAt)}</span>
                  </div>
                </div>

                <div className="mobile-card__footer" onClick={(e) => e.stopPropagation()}>
                  <div className="mobile-card__footer-left">
                    <button
                      type="button"
                      className="admin-count-pill"
                      onClick={() => onViewDepartmentEmployees && onViewDepartmentEmployees(dept.id)}
                    >
                      <Users size={12} />
                      <span>{dept.employeeCount || 0} Staff</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="mobile-card__actions">
                    <button
                      type="button"
                      className="action-btn action-btn--inspect"
                      onClick={() => onInspectDepartment && onInspectDepartment(dept)}
                      title="Inspect Department"
                      aria-label={`Inspect ${dept.name}`}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      className="action-btn action-btn--edit"
                      onClick={() => onOpenEditDepartment(dept)}
                      title="Edit Department"
                      aria-label={`Edit ${dept.name}`}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className={`action-btn ${isActive ? 'action-btn--deactivate' : 'action-btn--activate'}`}
                      onClick={() => onToggleStatus(dept.id)}
                      title={isActive ? 'Deactivate Department' : 'Activate Department'}
                      aria-label={isActive ? `Deactivate ${dept.name}` : `Activate ${dept.name}`}
                    >
                      {isActive ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Universal Pagination */}
      <Pagination
        currentPage={page}
        pageSize={pageSize}
        totalItems={totalCount || departments.length}
        itemName="departments"
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
