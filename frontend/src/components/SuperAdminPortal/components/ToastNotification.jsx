import React from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export default function ToastNotification({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className={`superadmin-toast superadmin-toast--${toast.type || 'success'} animate-fade-in`}>
      <div className="superadmin-toast__icon">
        {toast.type === 'warning' ? (
          <AlertCircle size={18} />
        ) : toast.type === 'error' ? (
          <XCircle size={18} />
        ) : (
          <CheckCircle2 size={18} />
        )}
      </div>
      <div className="superadmin-toast__text">
        <strong>{toast.title}</strong>
        <p>{toast.message}</p>
      </div>
      <button
        type="button"
        className="superadmin-toast__close"
        onClick={onClose}
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
}
