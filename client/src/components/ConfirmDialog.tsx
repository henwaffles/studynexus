import type { ReactNode } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmClasses =
    confirmVariant === 'primary'
      ? 'bg-primary hover:bg-primary-hover text-white'
      : 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 animate-ui-fade-in"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md mx-4 bg-card-dark border border-border-dark rounded-xl p-4 sm:p-6 animate-ui-scale-in">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <div className="text-text-secondary mb-6">{message}</div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto min-h-11 px-4 py-2 bg-card-hover hover:bg-border-dark text-white rounded-lg transition-colors duration-200 ease-out"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full sm:w-auto min-h-11 px-4 py-2 rounded-lg transition-colors duration-200 ease-out ${confirmClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
