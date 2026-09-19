import React, { useState, useEffect } from 'react';
import {
  Search,
  Layers,
  DoorOpen,
  Edit2,
  CheckCircle2,
  XCircle,
  Plus,
  Hash,
  AlignLeft,
  Eye,
} from 'lucide-react';
import Pagination from '../../common/Pagination/Pagination';
import { formatDate } from '../../../utils/dateUtils';

export default function FloorsTab({
  floors = [],
  search = '',
  onSearchChange,
  statusFilter = 'ALL',
  onStatusFilterChange,
  onOpenCreateFloor,
  onOpenEditFloor,
  onToggleStatus,
  onDeleteFloor,
  onInspectFloor,
  page = 1,
  pageSize = 10,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
}) {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search && onSearchChange) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, search, onSearchChange]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const activeCount = floors.filter((f) => f.status === 'ACTIVE').length;
  const inactiveCount = floors.filter((f) => f.status === 'INACTIVE').length;

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (onSearchChange) onSearchChange(localSearch);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    if (onSearchChange) onSearchChange('');
  };

  return (
    <div className="superadmin-tab-content">
      {/* SuperAdmin Toolbar */}
      <div className="superadmin-toolbar">
        <form onSubmit={handleSearchSubmit} className="superadmin-search-form">
          <div className="superadmin-search-box">
            <Search size={16} className="search-box-icon" />
            <input
              type="text"
              placeholder="Search floors by name or description..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="superadmin-search-input"
            />
            {localSearch ? (
              <button
                type="button"
                className="search-clear-btn"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                &times;
              </button>
            ) : (
              <kbd className="search-kbd-hint" title="Press / to focus search">/</kbd>
            )}
          </div>
          <button type="submit" className="btn btn--primary btn--sm search-submit-btn">
            <Search size={14} />
            <span>Search</span>
          </button>
        </form>

        <div className="superadmin-filter-group">
          {/* Status Segmented Buttons */}
          <div className="status-segment-group">
            <button
              type="button"
              className={`status-segment-btn ${statusFilter === 'ALL' ? 'status-segment-btn--active' : ''}`}
              onClick={() => onStatusFilterChange('ALL')}
            >
              All <span>{totalCount > 0 ? totalCount : floors.length}</span>
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

          {/* Create Floor Button */}
          {onOpenCreateFloor && (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={onOpenCreateFloor}
            >
              <Plus size={15} />
              <span>Add Floor</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="desktop-table-wrap">
        <div className="table-responsive">
          <table className="superadmin-table floors-table">
            <thead>
              <tr>
                <th>Floor Name & Level</th>
                <th>Assigned Rooms</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created Date</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {floors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="td-empty">
                    <Layers size={32} className="empty-icon" />
                    <p>
                      {localSearch || statusFilter !== 'ALL'
                        ? 'No office floors match your active filters.'
                        : 'No office floors configured yet.'}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                      {(localSearch || statusFilter !== 'ALL') && (
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          onClick={() => {
                            handleClearSearch();
                            onStatusFilterChange && onStatusFilterChange('ALL');
                          }}
                        >
                          Reset Filters
                        </button>
                      )}
                      {onOpenCreateFloor && (
                        <button type="button" className="btn btn--outline btn--sm" onClick={onOpenCreateFloor}>
                          <Plus size={14} /> Add Floor
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                floors.map((floor) => {
                  const isActive = floor.status === 'ACTIVE';

                  return (
                    <tr
                      key={floor.id}
                      onClick={() => onInspectFloor && onInspectFloor(floor)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="td-strong">
                        <div className="entity-cell">
                          <div className="entity-cell__icon entity-cell__icon--blue">
                            <Layers size={16} />
                          </div>
                          <div className="entity-cell__content">
                            <div className="entity-cell__name">{floor.name}</div>
                            <div className="entity-cell__sub">
                              {floor.floorNumber !== null && floor.floorNumber !== undefined ? `Level #${floor.floorNumber}` : 'Standard Level'}
                              {floor.companyName ? ` • ${floor.companyName}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="admin-count-pill">
                          <DoorOpen size={12} />
                          <span>{floor.roomCount || 0} {floor.roomCount === 1 ? 'Room' : 'Rooms'}</span>
                        </span>
                      </td>

                      <td>
                        <span className="table-notes">{floor.description || '—'}</span>
                      </td>

                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className={`status-badge-btn ${isActive ? 'status-badge-btn--active' : 'status-badge-btn--inactive'}`}
                          onClick={() => onToggleStatus && onToggleStatus(floor)}
                          title="Click to toggle status"
                        >
                          <span className="status-badge__dot" />
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      <td>
                        <span className="table-date">{formatDate(floor.createdAt)}</span>
                      </td>

                      <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                        <div className="td-actions__group">
                          <button
                            type="button"
                            className="action-btn action-btn--inspect"
                            onClick={() => onInspectFloor && onInspectFloor(floor)}
                            title="Inspect Floor Specifications"
                            aria-label={`Inspect ${floor.name}`}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            className="action-btn action-btn--edit"
                            onClick={() => onOpenEditFloor && onOpenEditFloor(floor)}
                            title="Edit Floor Details"
                            aria-label={`Edit ${floor.name}`}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className={`action-btn ${isActive ? 'action-btn--deactivate' : 'action-btn--activate'}`}
                            onClick={() => onToggleStatus && onToggleStatus(floor)}
                            title={isActive ? 'Deactivate Floor' : 'Activate Floor'}
                            aria-label={isActive ? `Deactivate ${floor.name}` : `Activate ${floor.name}`}
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
        {floors.length === 0 ? (
          <div className="mobile-empty-state">
            <Layers size={32} className="empty-icon" />
            <p>
              {localSearch || statusFilter !== 'ALL'
                ? 'No floors match your current filter.'
                : 'No office floors configured yet.'}
            </p>
            {onOpenCreateFloor && (
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={onOpenCreateFloor}
              >
                <Plus size={14} /> Add Floor
              </button>
            )}
          </div>
        ) : (
          floors.map((floor) => {
            const isActive = floor.status === 'ACTIVE';
            return (
              <div
                key={floor.id}
                className="mobile-card"
                onClick={() => onInspectFloor && onInspectFloor(floor)}
                style={{ cursor: 'pointer' }}
              >
                <div className="mobile-card__header">
                  <div className="mobile-card__header-left">
                    <div className="mobile-card__title-row">
                      <h4 className="mobile-card__title">{floor.name}</h4>
                      <span className="mobile-card__subtitle">
                        {floor.floorNumber !== null && floor.floorNumber !== undefined
                          ? `Level #${floor.floorNumber}`
                          : 'Standard Level'}
                        {floor.companyName ? ` • ${floor.companyName}` : ''}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`status-pill ${
                      isActive ? 'status-pill--active' : 'status-pill--inactive'
                    }`}
                  >
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mobile-card__details">
                  <div className="mobile-card__info-row">
                    <DoorOpen size={14} className="mobile-card__icon" />
                    <span className="mobile-card__text">
                      <strong>{floor.roomCount || 0}</strong> {floor.roomCount === 1 ? 'Room' : 'Rooms'} Assigned
                    </span>
                  </div>
                  {floor.description && (
                    <div className="mobile-card__info-row">
                      <span className="mobile-card__text" style={{ fontStyle: 'italic' }}>
                        {floor.description}
                      </span>
                    </div>
                  )}
                  <div className="mobile-card__info-row">
                    <span className="mobile-card__text">
                      Created on {formatDate(floor.createdAt)}
                    </span>
                  </div>
                </div>

                <div
                  className="mobile-card__footer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mobile-card__footer-left">
                    <button
                      type="button"
                      className={`status-badge-btn ${
                        isActive
                          ? 'status-badge-btn--active'
                          : 'status-badge-btn--inactive'
                      }`}
                      onClick={() => onToggleStatus && onToggleStatus(floor)}
                      title="Click to toggle status"
                    >
                      <span className="status-badge__dot" />
                      <span>{isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </div>
                  <div className="mobile-card__actions">
                    <button
                      type="button"
                      className="action-btn action-btn--inspect"
                      onClick={() => onInspectFloor && onInspectFloor(floor)}
                      title="Inspect Floor Specifications"
                      aria-label={`Inspect ${floor.name}`}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      className="action-btn action-btn--edit"
                      onClick={() => onOpenEditFloor && onOpenEditFloor(floor)}
                      title="Edit Floor Details"
                      aria-label={`Edit ${floor.name}`}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className={`action-btn ${
                        isActive
                          ? 'action-btn--deactivate'
                          : 'action-btn--activate'
                      }`}
                      onClick={() => onToggleStatus && onToggleStatus(floor)}
                      title={isActive ? 'Deactivate Floor' : 'Activate Floor'}
                      aria-label={isActive ? `Deactivate ${floor.name}` : `Activate ${floor.name}`}
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

      {/* Pagination Footer */}
      {floors.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalCount > 0 ? totalCount : floors.length}
          itemName="floors"
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}