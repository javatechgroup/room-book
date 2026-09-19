import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Building2,
  Users,
  User,
  Mail,
  Shield,
  Layers,
  DoorOpen,
  Download,
  ChevronDown,
} from 'lucide-react';
import Pagination from '../../common/Pagination/Pagination';
import SearchInput from '../../common/SearchInput/SearchInput';
import { formatDate } from '../../../utils/dateUtils';

export default function CompanyDirectoryTab({
  directoryData = {},
  rooms = [],
  departments = [],
  employees = [],
  onExportCSV,
}) {
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setPage(1);
  }, [search, selectedDepartment]);

  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      emp.fullName.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      (emp.departmentName && emp.departmentName.toLowerCase().includes(q));

    const matchDept =
      selectedDepartment === 'ALL' ||
      String(emp.departmentId) === String(selectedDepartment) ||
      emp.departmentName === selectedDepartment;

    return matchSearch && matchDept;
  });

  const paginatedEmployees = filteredEmployees.slice((page - 1) * pageSize, page * pageSize);

  // Calculate floor distribution
  const floorStats = {};
  rooms.forEach((r) => {
    const fl = r.floor || 'Other';
    if (!floorStats[fl]) {
      floorStats[fl] = { roomsCount: 0, totalCapacity: 0 };
    }
    floorStats[fl].roomsCount += 1;
    floorStats[fl].totalCapacity += (r.capacity || 0);
  });

  return (
    <div className="superadmin-tab-content">
      {/* Overview Cards */}
      <div className="directory-overview-grid">
        <div className="directory-overview-card">
          <div className="overview-icon overview-icon--indigo">
            <Users size={22} />
          </div>
          <div>
            <h3>{employees.length}</h3>
            <span>Total Staff Members</span>
          </div>
        </div>

        <div className="directory-overview-card">
          <div className="overview-icon overview-icon--purple">
            <Building2 size={22} />
          </div>
          <div>
            <h3>{departments.length}</h3>
            <span>Functional Departments</span>
          </div>
        </div>

        <div className="directory-overview-card">
          <div className="overview-icon overview-icon--blue">
            <DoorOpen size={22} />
          </div>
          <div>
            <h3>{rooms.length}</h3>
            <span>Managed Meeting Spaces</span>
          </div>
        </div>

        <div className="directory-overview-card">
          <div className="overview-icon overview-icon--emerald">
            <Layers size={22} />
          </div>
          <div>
            <h3>{Object.keys(floorStats).length}</h3>
            <span>Active Office Floors</span>
          </div>
        </div>
      </div>

      {/* Campus Floor Distribution Matrix */}
      <div className="directory-section">
        <div className="directory-section__header">
          <div>
            <h3>Campus Floor Space Distribution</h3>
            <p>Meeting space capacity and room distribution by building level</p>
          </div>
        </div>

        <div className="floor-distribution-grid">
          {Object.entries(floorStats).map(([floorName, stats]) => (
            <div key={floorName} className="floor-stat-card">
              <div className="floor-stat-card__icon">
                <Layers size={18} />
              </div>
              <div className="floor-stat-card__info">
                <h4>{floorName}</h4>
                <div className="floor-stat-pills">
                  <span className="stat-pill"><DoorOpen size={12} /> {stats.roomsCount} Rooms</span>
                  <span className="stat-pill"><Users size={12} /> {stats.totalCapacity} Seats</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Breakdown Cards */}
      <div className="directory-section">
        <div className="directory-section__header">
          <div>
            <h3>Department Structure</h3>
            <p>Staff members assigned to organizational units</p>
          </div>
        </div>

        <div className="department-breakdown-grid">
          {departments.map((dept) => {
            const deptEmps = employees.filter((e) => e.departmentId === dept.id || e.departmentName === dept.name);
            return (
              <div key={dept.id} className="dept-breakdown-card">
                <div className="dept-breakdown-card__header">
                  <div className="dept-icon">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <h4>{dept.name}</h4>
                    <span>{deptEmps.length} {deptEmps.length === 1 ? 'Member' : 'Members'}</span>
                  </div>
                </div>

                <div className="dept-members-avatars">
                  {deptEmps.map((emp) => (
                    <div key={emp.id} className="member-avatar-chip" title={`${emp.fullName} (${emp.email})`}>
                      <span className="member-initial">{emp.fullName.charAt(0)}</span>
                      <span className="member-name">{emp.fullName}</span>
                    </div>
                  ))}
                  {deptEmps.length === 0 && (
                    <span className="no-members">No staff assigned</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Searchable Staff Directory Table */}
      <div className="directory-section">
        <div className="superadmin-toolbar" style={{ marginTop: '0.5rem' }}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search company directory by name, email, or department..."
          />

          <div className="superadmin-filter-group">
            <div className={`superadmin-dropdown-wrap ${selectedDepartment !== 'ALL' ? 'superadmin-dropdown-wrap--active' : ''}`}>
              <Building2 size={15} className="filter-select-icon" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="superadmin-filter-select"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="filter-select-arrow" />
            </div>

            <button
              type="button"
              className="btn btn--outline btn--sm export-btn"
              onClick={onExportCSV}
              title="Export staff directory to CSV"
            >
              <Download size={14} />
              <span>Export Directory</span>
            </button>
          </div>
        </div>

        <div className="desktop-table-wrap">
          <div className="table-responsive">
            <table className="superadmin-table directory-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Corporate Email</th>
                  <th>Department</th>
                  <th>Access Privilege</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="td-empty">
                      <Users size={32} className="empty-icon" />
                      <p>No employees match your search query.</p>
                      {(search || selectedDepartment !== 'ALL') && (
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          style={{ marginTop: '0.75rem' }}
                          onClick={() => {
                            setSearch('');
                            setSelectedDepartment('ALL');
                          }}
                        >
                          Clear Search & Filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td className="td-strong">
                        <div className="entity-cell">
                          <div className="entity-cell__icon entity-cell__icon--indigo">
                            <User size={16} />
                          </div>
                          <div className="entity-cell__content">
                            <div className="entity-cell__name">{emp.fullName}</div>
                            <div className="entity-cell__sub">ID: #{emp.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="table-email">
                          <Mail size={13} /> {emp.email}
                        </span>
                      </td>
                      <td>
                        <span className="department-badge">
                          <Building2 size={13} /> {emp.departmentName || 'General'}
                        </span>
                      </td>
                      <td>
                        <span className={`role-badge ${emp.role === 'COMPANY_ADMIN' ? 'role-badge--admin' : 'role-badge--employee'}`}>
                          {emp.role === 'COMPANY_ADMIN' ? 'Facility Admin' : 'Employee'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${emp.status === 'ACTIVE' ? 'status-pill--active' : 'status-pill--inactive'}`}>
                          {emp.status === 'ACTIVE' ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card List for Directory */}
        <div className="mobile-card-list">
          {filteredEmployees.length === 0 ? (
            <div className="mobile-empty-state">
              <Users size={32} className="empty-icon" />
              <p>No employees match your query.</p>
              {(search || selectedDepartment !== 'ALL') && (
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  style={{ marginTop: '0.75rem' }}
                  onClick={() => {
                    setSearch('');
                    setSelectedDepartment('ALL');
                  }}
                >
                  Clear Search & Filters
                </button>
              )}
            </div>
          ) : (
            paginatedEmployees.map((emp) => (
              <div key={emp.id} className="mobile-card">
                <div className="mobile-card__header">
                  <div className="mobile-card__header-left">
                    <div className="mobile-card__title-row">
                      <h4 className="mobile-card__title">{emp.fullName}</h4>
                      <span className="mobile-card__subtitle">{emp.email}</span>
                    </div>
                  </div>
                  <span className={`status-pill ${emp.status === 'ACTIVE' ? 'status-pill--active' : 'status-pill--inactive'}`}>
                    {emp.status === 'ACTIVE' ? 'Active' : 'Suspended'}
                  </span>
                </div>

                <div className="mobile-card__details">
                  <div className="mobile-card__info-row">
                    <Building2 size={14} className="mobile-card__icon" />
                    <span>Department: <strong>{emp.departmentName || 'General'}</strong></span>
                  </div>
                  <div className="mobile-card__info-row">
                    <Shield size={14} className="mobile-card__icon" />
                    <span className={`role-badge ${emp.role === 'COMPANY_ADMIN' ? 'role-badge--admin' : 'role-badge--employee'}`}>
                      {emp.role === 'COMPANY_ADMIN' ? 'Facility Admin' : 'Employee'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Universal Pagination */}
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={filteredEmployees.length}
          itemName="staff members"
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
