import React, { useState, useEffect } from 'react';
import {
  Search,
  Building2,
  Users,
  User,
  Shield,
  Edit2,
  Download,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronDown,
} from 'lucide-react';
import Pagination from '../../common/Pagination/Pagination';
import SearchInput from '../../common/SearchInput/SearchInput';
import { formatDate } from '../../../utils/dateUtils';

export default function EmployeesTab({
  employees = [],
  departments = [],
  search = '',
  onSearchChange,
  departmentFilter = 'ALL',
  onDepartmentFilterChange,
  statusFilter = 'ALL',
  onStatusFilterChange,
  roleFilter = 'ALL',
  onRoleFilterChange,
  sortBy = 'fullName',
  sortDir = 'asc',
  onSort,
  selectedEmployeeIds = [],
  onSelectAll,
  onToggleSelect,
  onOpenCreateEmployee,
  onOpenEditEmployee,
  onToggleStatus,
  onInspectEmployee,
  onBulkActivate,
  onBulkDeactivate,
  onExportCSV,
  page = 1,
  pageSize = 10,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const isAllSelected = employees.length > 0 && employees.every((e) => selectedEmployeeIds.includes(e.id));
  const activeDept = departments.find((d) => String(d.id) === String(departmentFilter));

  const activeCount = employees.filter((e) => e.status === 'ACTIVE').length;
  const inactiveCount = employees.filter((e) => e.status === 'INACTIVE').length;

  return (
    <div className="superadmin-tab-content">
      {/* SuperAdmin Toolbar */}
      <div className="superadmin-toolbar">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search staff by name, email, or department..."
        />

        <div className="superadmin-filter-group">
          {/* Department Dropdown */}
          <div className={`superadmin-dropdown-wrap ${departmentFilter !== 'ALL' ? 'superadmin-dropdown-wrap--active' : ''}`}>
            <Building2 size={15} className="filter-select-icon" />
            <select
              value={departmentFilter}
              onChange={(e) => onDepartmentFilterChange(e.target.value)}
              className="superadmin-filter-select"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="filter-select-arrow" />
          </div>

          {/* Status Segmented Buttons */}
          <div className="status-segment-group">
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'ALL' ? 'status-segment-btn--active' : ''}`}
              onClick={() => onStatusFilterChange('ALL')}
            >
              All <span>{totalCount > 0 ? totalCount : employees.length}</span>
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
              Suspended <span>{inactiveCount}</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={onOpenCreateEmployee}
          >
            <Plus size={15} />
            <span>Add Employee</span>
          </button>

          <button
            type="button"
            className="btn btn--outline btn--sm export-btn"
            onClick={onExportCSV}
            title="Export employees to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Active Department Filter Alert Banner */}
      {departmentFilter !== 'ALL' && activeDept && (
        <div className="active-dept-banner" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '0.75rem 1.25rem',
          background: 'var(--bg-surface-alt, #eff6ff)',
          border: '1px solid var(--primary-200, #bfdbfe)',
          borderRadius: '10px',
          marginBottom: '1.25rem',
          fontSize: '0.88rem',
          color: 'var(--primary-700, #1d4ed8)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={18} />
            <span>
              Showing staff filtered by department: <strong>{activeDept.name}</strong> ({totalCount || employees.length} {totalCount === 1 ? 'member' : 'members'})
            </span>
          </div>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            style={{
              padding: '4px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: '#ffffff',
              color: '#2563eb',
              borderColor: '#93c5fd',
              cursor: 'pointer'
            }}
            onClick={() => onDepartmentFilterChange('ALL')}
          >
            Show All Departments
          </button>
        </div>
      )}

      {/* Bulk Operations Toolbar */}
      {selectedEmployeeIds.length > 0 && (
        <div className="bulk-toolbar">
          <div className="bulk-toolbar__info">
            <span className="bulk-badge">{selectedEmployeeIds.length}</span>
            <span>{selectedEmployeeIds.length === 1 ? 'staff member selected' : 'staff members selected'}</span>
          </div>
          <div className="bulk-toolbar__actions">
            <button
              type="button"
              className="bulk-btn bulk-btn--activate"
              onClick={onBulkActivate}
            >
              <CheckCircle2 size={14} /> Activate Selected
            </button>
            <button
              type="button"
              className="bulk-btn bulk-btn--deactivate"
              onClick={onBulkDeactivate}
            >
              <XCircle size={14} /> Suspend Selected
            </button>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="desktop-table-wrap">
        <div className="table-responsive">
          <table className="superadmin-table employees-table">
            <thead>
              <tr>
                <th className="th-checkbox">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onSelectAll}
                    aria-label="Select all employees"
                  />
                </th>
                <th className="th-sortable" onClick={() => onSort && onSort('fullName')}>
                  <div className="th-content">
                    <span>Staff Member</span>
                    {sortBy === 'fullName' ? (
                      sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                    ) : (
                      <ArrowUpDown size={13} className="sort-idle" />
                    )}
                  </div>
                </th>
                <th>Department</th>
                <th>Role Scope</th>
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
                <th>Onboarded</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="td-empty">
                    <Users size={32} className="empty-icon" />
                    <p style={{ margin: '0.5rem 0', fontWeight: 500 }}>
                      {departmentFilter !== 'ALL' && activeDept
                        ? `No staff members found in the "${activeDept.name}" department.`
                        : 'No employees match your current search or filter criteria.'}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      {search && (
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          onClick={() => onSearchChange && onSearchChange('')}
                        >
                          Clear Search
                        </button>
                      )}
                      {departmentFilter !== 'ALL' && (
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          onClick={() => onDepartmentFilterChange('ALL')}
                        >
                          Show All Departments
                        </button>
                      )}
                      <button type="button" className="btn btn--outline btn--sm" onClick={onOpenCreateEmployee}>
                        <Plus size={14} /> Add Employee
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const isSelected = selectedEmployeeIds.includes(emp.id);
                  const isActive = emp.status === 'ACTIVE';
                  const isFacilityAdmin = emp.role === 'COMPANY_ADMIN';

                  return (
                    <tr
                      key={emp.id}
                      className={isSelected ? 'tr--selected' : ''}
                      onClick={() => onInspectEmployee(emp)}
                    >
                      <td className="td-checkbox" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(emp.id)}
                          aria-label={`Select employee ${emp.fullName}`}
                        />
                      </td>
                      <td className="td-strong">
                        <div className="entity-cell">
                          <div className="entity-cell__icon entity-cell__icon--indigo">
                            <User size={16} />
                          </div>
                          <div className="entity-cell__content">
                            <div className="entity-cell__name">{emp.fullName}</div>
                            <div className="entity-cell__sub">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="department-badge">
                          <Building2 size={13} /> {emp.departmentName || 'Admin'}
                        </span>
                      </td>
                      <td>
                        <span className={`role-badge ${isFacilityAdmin ? 'role-badge--admin' : 'role-badge--employee'}`}>
                          {isFacilityAdmin ? 'Facility Admin' : 'Employee'}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className={`status-badge-btn ${isActive ? 'status-badge-btn--active' : 'status-badge-btn--inactive'}`}
                          onClick={() => onToggleStatus(emp.id)}
                          title="Click to toggle status"
                        >
                          <span className="status-badge__dot" />
                          <span>{isActive ? 'Active' : 'Suspended'}</span>
                        </button>
                      </td>
                      <td>
                        <span className="table-date">{formatDate(emp.createdAt)}</span>
                      </td>
                      <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                        <div className="td-actions__group">
                          <button
                            type="button"
                            className="action-btn action-btn--inspect"
                            onClick={() => onInspectEmployee(emp)}
                            title="Inspect Profile"
                            aria-label={`Inspect ${emp.fullName}`}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            className="action-btn action-btn--edit"
                            onClick={() => onOpenEditEmployee(emp)}
                            title="Edit Employee Details"
                            aria-label={`Edit ${emp.fullName}`}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className={`action-btn ${isActive ? 'action-btn--deactivate' : 'action-btn--activate'}`}
                            onClick={() => onToggleStatus(emp.id)}
                            title={isActive ? 'Suspend Access' : 'Activate Access'}
                            aria-label={isActive ? `Suspend ${emp.fullName}` : `Activate ${emp.fullName}`}
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
        {employees.length === 0 ? (
          <div className="mobile-empty-state">
            <Users size={32} className="empty-icon" />
            <p>
              {departmentFilter !== 'ALL' && activeDept
                ? `No staff found in ${activeDept.name}.`
                : 'No staff members match your filter.'}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {departmentFilter !== 'ALL' && (
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => onDepartmentFilterChange('ALL')}
                >
                  Show All Staff
                </button>
              )}
              <button type="button" className="btn btn--outline btn--sm" onClick={onOpenCreateEmployee}>
                Onboard Employee
              </button>
            </div>
          </div>
        ) : (
          employees.map((emp) => {
            const isSelected = selectedEmployeeIds.includes(emp.id);
            const isActive = emp.status === 'ACTIVE';
            const isFacilityAdmin = emp.role === 'COMPANY_ADMIN';

            return (
              <div
                key={emp.id}
                className={`mobile-card ${isSelected ? 'mobile-card--selected' : ''}`}
                onClick={() => onInspectEmployee(emp)}
              >
                <div className="mobile-card__header">
                  <div className="mobile-card__header-left">
                    <input
                      type="checkbox"
                      className="mobile-card-checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleSelect(emp.id);
                      }}
                      aria-label={`Select ${emp.fullName}`}
                    />
                    <div className="mobile-card__title-row">
                      <h4 className="mobile-card__title">{emp.fullName}</h4>
                      <span className="mobile-card__subtitle">{emp.email}</span>
                    </div>
                  </div>
                  <span className={`status-pill ${isActive ? 'status-pill--active' : 'status-pill--inactive'}`}>
                    {isActive ? 'Active' : 'Suspended'}
                  </span>
                </div>

                <div className="mobile-card__details">
                  <div className="mobile-card__info-row">
                    <Building2 size={14} className="mobile-card__icon" />
                    <span>Department: <strong>{emp.departmentName || 'Admin'}</strong></span>
                  </div>
                  <div className="mobile-card__info-row">
                    <Shield size={14} className="mobile-card__icon" />
                    <span className={`role-badge ${isFacilityAdmin ? 'role-badge--admin' : 'role-badge--employee'}`}>
                      {isFacilityAdmin ? 'Facility Admin' : 'Employee'}
                    </span>
                  </div>
                </div>

                <div className="mobile-card__footer" onClick={(e) => e.stopPropagation()}>
                  <div className="mobile-card__footer-left">
                    <span className="department-badge">
                      <Building2 size={12} /> {emp.departmentName || 'Admin'}
                    </span>
                  </div>
                  <div className="mobile-card__actions">
                    <button
                      type="button"
                      className="action-btn action-btn--inspect"
                      onClick={() => onInspectEmployee(emp)}
                      title="Inspect Staff Profile"
                      aria-label={`Inspect ${emp.fullName}`}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      className="action-btn action-btn--edit"
                      onClick={() => onOpenEditEmployee(emp)}
                      title="Edit Staff Member"
                      aria-label={`Edit ${emp.fullName}`}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className={`action-btn ${isActive ? 'action-btn--deactivate' : 'action-btn--activate'}`}
                      onClick={() => onToggleStatus(emp.id)}
                      title={isActive ? 'Suspend Employee' : 'Activate Employee'}
                      aria-label={isActive ? `Suspend ${emp.fullName}` : `Activate ${emp.fullName}`}
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
        totalItems={totalCount || employees.length}
        itemName="staff members"
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
