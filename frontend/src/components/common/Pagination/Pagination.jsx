import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Select from '../Select/Select';
import './Pagination.css';

/**
 * Universal Pagination Component
 *
 * @param {number} currentPage - Current page number (1-indexed)
 * @param {number} pageSize - Number of items per page
 * @param {number} totalItems - Total number of items across all pages
 * @param {number} [totalPages] - Total number of pages (computed automatically if omitted)
 * @param {string} [itemName='items'] - Name of entity being displayed (e.g. 'companies', 'records')
 * @param {function} onPageChange - Callback when a page is selected: (page: number) => void
 * @param {function} [onPageSizeChange] - Callback when page size changes: (size: number) => void
 * @param {number[]} [pageSizeOptions=[5, 10, 25, 50]] - Available page size dropdown options
 * @param {boolean} [showPageNumbers=true] - Whether to show clickable numbered page pills
 * @param {boolean} [showTotalInfo=true] - Whether to show "Showing X to Y of Z" text
 * @param {boolean} [showPageSizeSelector=true] - Whether to show the rows per page dropdown
 * @param {string} [className=''] - Additional custom CSS class
 */
export default function Pagination({
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  totalPages: propTotalPages,
  itemName = 'items',
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
  showPageNumbers = true,
  showTotalInfo = true,
  showPageSizeSelector = true,
  className = '',
}) {
  const calculatedTotalPages = Math.ceil(totalItems / pageSize) || 1;
  const totalPages = propTotalPages !== undefined ? propTotalPages : calculatedTotalPages;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis window
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // Number of pages to show around current page

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > delta + 2) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - delta);
      const end = Math.min(totalPages - 1, currentPage + delta);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - (delta + 1)) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const handlePageClick = (page) => {
    if (page === '...' || page === currentPage || page < 1 || page > totalPages) return;
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <div className={`common-pagination ${className}`}>
      {showTotalInfo && (
        <div className="common-pagination__info">
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{' '}
          <strong>{totalItems}</strong> {itemName}
        </div>
      )}

      <div className="common-pagination__controls">
        {showPageSizeSelector && onPageSizeChange && (
          <div className="common-pagination__size-selector">
            <span>Rows:</span>
            <Select
              size="sm"
              value={pageSize}
              onChange={(val) => onPageSizeChange(Number(val))}
              options={pageSizeOptions}
              placeholder={null}
              aria-label="Rows per page"
            />
          </div>
        )}

        <div className="common-pagination__nav">
          <button
            type="button"
            className="common-pagination__btn"
            disabled={currentPage <= 1}
            onClick={() => handlePageClick(1)}
            title="First Page"
            aria-label="First Page"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            type="button"
            className="common-pagination__btn"
            disabled={currentPage <= 1}
            onClick={() => handlePageClick(currentPage - 1)}
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          {showPageNumbers ? (
            <div className="common-pagination__pages">
              {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="common-pagination__ellipsis">
                    &hellip;
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    className={`common-pagination__page-btn ${
                      currentPage === page ? 'common-pagination__page-btn--active' : ''
                    }`}
                    onClick={() => handlePageClick(page)}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          ) : (
            <span className="common-pagination__badge">
              Page {currentPage} of {totalPages}
            </span>
          )}

          <button
            type="button"
            className="common-pagination__btn"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageClick(currentPage + 1)}
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            className="common-pagination__btn"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageClick(totalPages)}
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
