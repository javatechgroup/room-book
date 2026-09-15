import React from 'react';
import { Layers, Check, X, Download } from 'lucide-react';

export default function BulkOperationsToolbar({
  selectedCount = 0,
  entityName = 'records',
  onActivate,
  onSuspend,
  onExport,
  onClear,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="bulk-toolbar animate-fade-in">
      <div className="bulk-toolbar__info">
        <Layers size={16} className="bulk-icon" />
        <span>
          <strong>{selectedCount}</strong> {entityName} selected
        </span>
      </div>
      <div className="bulk-toolbar__actions">
        {onActivate && (
          <button
            type="button"
            className="bulk-btn bulk-btn--activate"
            onClick={onActivate}
            title="Bulk Activate"
          >
            <Check size={14} />
            <span>Activate Selected</span>
          </button>
        )}
        {onSuspend && (
          <button
            type="button"
            className="bulk-btn bulk-btn--suspend"
            onClick={onSuspend}
            title="Bulk Suspend"
          >
            <X size={14} />
            <span>Suspend Selected</span>
          </button>
        )}
        {onExport && (
          <button
            type="button"
            className="bulk-btn bulk-btn--export"
            onClick={onExport}
            title="Export Selected to CSV"
          >
            <Download size={14} />
            <span>Export Selected</span>
          </button>
        )}
        {onClear && (
          <button
            type="button"
            className="bulk-btn bulk-btn--clear"
            onClick={onClear}
            title="Clear Selection"
          >
            Deselect All
          </button>
        )}
      </div>
    </div>
  );
}
