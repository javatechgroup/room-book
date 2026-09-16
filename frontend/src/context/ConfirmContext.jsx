import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmModal from '../components/common/ConfirmModal/ConfirmModal';

export const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [config, setConfig] = useState({
    isOpen: false,
    title: 'Are you sure?',
    subtitle: 'Confirmation Required',
    message: '',
    targetName: '',
    targetSub: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
  });

  const resolverRef = useRef(null);

  /**
   * Prompts user with a confirmation modal and returns a Promise resolving to boolean (true = confirmed, false = cancelled).
   *
   * @param {string|object} options - Message string or options object
   */
  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      if (typeof options === 'string') {
        setConfig({
          isOpen: true,
          title: 'Are you sure?',
          subtitle: 'Confirmation Required',
          message: options,
          targetName: '',
          targetSub: '',
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          type: 'danger',
        });
      } else {
        setConfig({
          isOpen: true,
          title: options?.title || 'Are you sure?',
          subtitle: options?.subtitle || 'Confirmation Required',
          message: options?.message || '',
          targetName: options?.targetName || '',
          targetSub: options?.targetSub || '',
          confirmText: options?.confirmText || 'Confirm',
          cancelText: options?.cancelText || 'Cancel',
          type: options?.type || 'danger',
        });
      }
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setConfig((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    setConfig((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmModal
        isOpen={config.isOpen}
        title={config.title}
        subtitle={config.subtitle}
        message={config.message}
        targetName={config.targetName}
        targetSub={config.targetSub}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        type={config.type}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
