import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isConfirming?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  isConfirming = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all" style={{ backgroundColor: 'var(--color-surface-card)'}}>
        <div className="flex items-start">
            <div className="flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10" style={{ backgroundColor: 'var(--color-status-error-bg)'}}>
                <i className="fa-solid fa-triangle-exclamation h-6 w-6" style={{ color: 'var(--color-status-error-text)'}} aria-hidden="true"></i>
            </div>
            <div className="ml-4 text-left">
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-heading)'}} id="modal-title">
                {title}
                </h3>
                <div className="mt-2">
                <p className="text-sm" style={{ color: 'var(--color-text-default)'}}>
                    {message}
                </p>
                </div>
            </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isConfirming}
          >
            {cancelButtonText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-danger"
            disabled={isConfirming}
          >
            {isConfirming ? (
                <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Processing...
                </>
            ) : confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;