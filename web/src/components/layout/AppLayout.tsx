import React from 'react';
import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { ToastContainer } from '../ui/Toast';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';

export function AppLayout() {
  const { toasts, removeToast } = useToast();
  const { isOpen, options, handleConfirm, handleCancel } = useConfirm();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Aqui você pode adicionar Header, Sidebar, etc. */}
        <main>
          <Outlet />
        </main>
        <ToastContainer toasts={toasts} onClose={removeToast} />
        {options && (
          <ConfirmDialog
            isOpen={isOpen}
            onClose={handleCancel}
            onConfirm={handleConfirm}
            title={options.title}
            message={options.message}
            confirmText={options.confirmText}
            cancelText={options.cancelText}
            type={options.type}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}