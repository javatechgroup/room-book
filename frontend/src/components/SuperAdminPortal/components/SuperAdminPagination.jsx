import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function SuperAdminPagination({
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  itemName = 'items',
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
}) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="superadmin-pagination">
      <div className="pagination-info">
        Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{' '}
        <strong>{totalItems}</strong> {itemName}
      </div>

      <div className="pagination-controls">
        <div className="page-size-selector">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              if (onPageSizeChange) onPageSizeChange(Number(e.target.value));
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="page-buttons">
          <button
            type="button"
            className="page-nav-btn"
            disabled={currentPage <= 1}
            onClick={() => onPageChange && onPageChange(1)}
            title="First Page"
            aria-label="First Page"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            type="button"
            className="page-nav-btn"
            disabled={currentPage <= 1}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="current-page-badge">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            className="page-nav-btn"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            className="page-nav-btn"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange && onPageChange(totalPages)}
            title="Last Page"
            aria-label="Last Page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
