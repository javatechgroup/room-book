import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert, Check } from 'lucide-react';
import './ConfirmModal.css';

/**
 * Universal Confirmation Modal for Critical Operations
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {string} title - Dialog title
 * @param {string} subtitle - Optional category subtitle
 * @param {string|React.ReactNode} message - Detailed warning / explanation text
 * @param {string} targetName - Highlighted entity name
 * @param {string} targetSub - Highlighted entity secondary detail
 * @param {string} confirmText - Primary button text (e.g. 'Suspend Access', 'Deactivate')
 * @param {string} cancelText - Secondary button text (default 'Cancel')
 * @param {'danger'|'warning'|'primary'} type - Color tone & icon theme
 * @param {boolean} loading - Loading state for action
 * @param {function} onConfirm - Confirm callback
 * @param {function} onCancel - Cancel callback
 */
export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  subtitle = 'Confirmation Required',
  message,
  targetName,
  targetSub,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel && onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={24} />;
      case 'warning':
        return <ShieldAlert size={24} />;
      case 'primary':
      default:
        return <Info size={24} />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'btn--danger';
      case 'warning':
        return 'btn--warning';
      case 'primary':
      default:
        return 'btn--primary';
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div
        className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="confirm-modal__body">
          <div className="confirm-modal__icon-row">
            <div className={`confirm-modal__icon-badge confirm-modal__icon-badge--${type}`}>
              {getIcon()}
            </div>
            <div className="confirm-modal__title-wrap">
              {subtitle && <span className="confirm-modal__subtitle">{subtitle}</span>}
              <h3 id="confirm-modal-title" className="confirm-modal__title">{title}</h3>
            </div>
          </div>

          <p className="confirm-modal__message">{message}</p>

          {(targetName || targetSub) && (
            <div className="confirm-modal__target-card">
              <div>
                {targetName && <div className="confirm-modal__target-name">{targetName}</div>}
                {targetSub && <div className="confirm-modal__target-sub">{targetSub}</div>}
              </div>
            </div>
          )}
        </div>

        <div className="confirm-modal__footer">
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${getButtonClass()} btn--sm`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
