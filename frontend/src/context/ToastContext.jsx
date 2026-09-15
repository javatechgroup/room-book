import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export const ToastContext = createContext(null);

let toastCount = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const recentToastsRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback((options) => {
    // Support addToast('Simple message string') or addToast({ type, title, message, duration })
    let toastItem = {};
    if (typeof options === 'string') {
      toastItem = {
        title: '',
        message: options,
        type: 'info',
        duration: 4000,
      };
    } else {
      toastItem = {
        title: options.title || '',
        message: options.message || (typeof options === 'string' ? options : ''),
        type: options.type || 'info',
        duration: options.duration !== undefined ? options.duration : 4000,
      };
    }

    // Deduplication signature: ignore identical toast triggered within 600ms
    const signature = `${toastItem.type}::${toastItem.title}::${toastItem.message}`;
    const now = Date.now();
    const lastTrigger = recentToastsRef.current.get(signature) || 0;

    if (now - lastTrigger < 600) {
      // Duplicate trigger detected within 600ms window; ignore
      return null;
    }
    recentToastsRef.current.set(signature, now);

    // Clean up old signatures from memory
    if (recentToastsRef.current.size > 20) {
      for (const [key, timestamp] of recentToastsRef.current.entries()) {
        if (now - timestamp > 5000) {
          recentToastsRef.current.delete(key);
        }
      }
    }

    const id = `toast-${now}-${++toastCount}`;
    const newToast = { ...toastItem, id };

    setToasts((prev) => {
      // Keep up to 5 concurrent toasts
      const updated = [...prev, newToast];
      if (updated.length > 5) {
        return updated.slice(updated.length - 5);
      }
      return updated;
    });

    return id;
  }, []);

  // Intuitive helper object
  const toast = useCallback(
    Object.assign(
      (options) => addToast(options),
      {
        success: (title, message, duration) => {
          if (message === undefined && typeof title === 'string') {
            return addToast({ type: 'success', title: 'Success', message: title, duration });
          }
          return addToast({ type: 'success', title, message, duration });
        },
        error: (title, message, duration) => {
          if (message === undefined && typeof title === 'string') {
            return addToast({ type: 'error', title: 'Error', message: title, duration });
          }
          return addToast({ type: 'error', title, message, duration });
        },
        warning: (title, message, duration) => {
          if (message === undefined && typeof title === 'string') {
            return addToast({ type: 'warning', title: 'Warning', message: title, duration });
          }
          return addToast({ type: 'warning', title, message, duration });
        },
        info: (title, message, duration) => {
          if (message === undefined && typeof title === 'string') {
            return addToast({ type: 'info', title: 'Information', message: title, duration });
          }
          return addToast({ type: 'info', title, message, duration });
        },
        dismiss: (id) => removeToast(id),
        dismissAll: () => clearToasts(),
      }
    ),
    [addToast, removeToast, clearToasts]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
