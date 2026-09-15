import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import './Toast.css';

function ToastItem({ toast, onDismiss }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const timerRef = useRef(null);
  const remainingTimeRef = useRef(toast.duration || 4000);
  const startTimeRef = useRef(Date.now());

  const startTimer = () => {
    if (toast.duration === 0) return; // Persistent
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      handleClose();
    }, remainingTimeRef.current);
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }
  };

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 220); // Sync with CSS slide-out animation duration
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} />;
      case 'error':
        return <XCircle size={18} />;
      case 'warning':
        return <AlertTriangle size={18} />;
      case 'info':
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div
      className={`toast-item toast-item--${toast.type || 'info'} ${isLeaving ? 'toast-item--leaving' : ''}`}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      role="status"
      aria-live="polite"
    >
      <div className="toast-item__icon">
        {getIcon()}
      </div>
      <div className="toast-item__content">
        {toast.title && <div className="toast-item__title">{toast.title}</div>}
        {toast.message && <div className="toast-item__message">{toast.message}</div>}
      </div>
      <button
        type="button"
        className="toast-item__close"
        onClick={handleClose}
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}

export default ToastContainer;
