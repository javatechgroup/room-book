import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Repeat, Calendar, Trash2, X, Clock, DoorOpen } from 'lucide-react';
import { formatDate } from '../../../utils/dateUtils';
import './CancelRecurringModal.css';

/**
 * Dialog for choosing recurrence cancellation scope:
 * - Cancel only this single occurrence
 * - Cancel this and all future occurrences in the recurring series
 */
export default function CancelRecurringModal({
  isOpen,
  booking,
  onCancelSingle,
  onCancelSeries,
  onClose,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose && onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !booking) return null;

  const title = booking.title || booking.purpose || 'Meeting Reservation';
  const roomName = booking.roomName || 'Meeting Room';
  const timeInfo = booking.startTime && booking.endTime
    ? `${booking.startTime.substring(11, 16)} - ${booking.endTime.substring(11, 16)}`
    : booking.slot || '';
  const dateStr = booking.startTime ? booking.startTime.split('T')[0] : booking.date;

  const modalNode = (
    <div className="cancel-recurring-modal-overlay" onClick={onClose}>
      <div
        className="cancel-recurring-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-recurring-title"
      >
        <div className="cancel-recurring-modal__body">
          <div className="cancel-recurring-modal__icon-row">
            <div className="cancel-recurring-modal__icon-badge">
              <Repeat size={24} />
            </div>
            <div className="cancel-recurring-modal__title-wrap">
              <span className="cancel-recurring-modal__subtitle">Recurring Schedule</span>
              <h3 id="cancel-recurring-title" className="cancel-recurring-modal__title">
                Cancel Recurring Meeting
              </h3>
            </div>
            <button
              type="button"
              className="cancel-recurring-modal__close-btn"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>

          <div className="cancel-recurring-modal__target">
            <div className="cancel-recurring-modal__target-name">{title}</div>
            <div className="cancel-recurring-modal__target-details">
              <span><DoorOpen size={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> {roomName}</span>
              {booking.floor && <span>• {booking.floor}</span>}
              <span>• <Clock size={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> {formatDate(dateStr)} ({timeInfo})</span>
              {booking.recurrenceRule && <span>• Repeats: <strong>{booking.recurrenceRule}</strong></span>}
            </div>
          </div>

          <p className="cancel-recurring-modal__prompt">
            This reservation is part of a recurring series. How would you like to cancel it?
          </p>

          <div className="cancel-recurring-options">
            <button
              type="button"
              className="cancel-option-card cancel-option-card--single"
              onClick={() => onCancelSingle && onCancelSingle(booking)}
            >
              <div className="cancel-option-card__icon">
                <Calendar size={18} />
              </div>
              <div className="cancel-option-card__content">
                <div className="cancel-option-card__title">Cancel Only This Occurrence</div>
                <div className="cancel-option-card__desc">
                  Releases the slot on {formatDate(dateStr)}. All other future meetings in this recurring series remain active.
                </div>
              </div>
            </button>

            <button
              type="button"
              className="cancel-option-card cancel-option-card--series"
              onClick={() => onCancelSeries && onCancelSeries(booking)}
            >
              <div className="cancel-option-card__icon">
                <Trash2 size={18} />
              </div>
              <div className="cancel-option-card__content">
                <div className="cancel-option-card__title" style={{ color: '#ef4444' }}>
                  Cancel All Future Occurrences
                </div>
                <div className="cancel-option-card__desc">
                  Cancels this meeting and removes all remaining future scheduled meetings in this recurring series.
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="cancel-recurring-modal__footer">
          <button
            type="button"
            className="btn btn--outline"
            onClick={onClose}
          >
            Keep Reservation
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
