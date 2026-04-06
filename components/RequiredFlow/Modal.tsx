import React, { useEffect } from 'react';
import {
  modalOverlayClasses,
  modalClasses,
  modalWideClasses,
  modalHeaderClasses,
  modalTitleClasses,
  modalBodyClasses,
  modalFooterClasses,
  modalCloseClasses,
  combineClasses,
} from '@/utils/requiredFlowUtils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}

interface ModalHeaderProps {
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

interface ModalTitleProps {
  className?: string;
  children: React.ReactNode;
}

interface ModalBodyProps {
  className?: string;
  children: React.ReactNode;
}

interface ModalFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children, className, wide = false }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={combineClasses(modalOverlayClasses, isOpen && 'open')}
      onClick={onClose}
    >
      <div
        className={combineClasses(wide ? modalWideClasses : modalClasses, className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ className, children, onClose }: ModalHeaderProps) {
  return (
    <div className={combineClasses(modalHeaderClasses, className)}>
      <div>{children}</div>
      {onClose && (
        <button
          className={modalCloseClasses}
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export function ModalTitle({ className, children }: ModalTitleProps) {
  return <h2 className={combineClasses(modalTitleClasses, className)}>{children}</h2>;
}

export function ModalBody({ className, children }: ModalBodyProps) {
  return <div className={combineClasses(modalBodyClasses, className)}>{children}</div>;
}

export function ModalFooter({ className, children }: ModalFooterProps) {
  return <div className={combineClasses(modalFooterClasses, className)}>{children}</div>;
}

export default Modal;
