import React, { useEffect } from 'react';
import { ToastWrapper, ToastContent, ToastMessage, CloseButton } from './style';

export interface ToastProps {
  id: string;
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  duration = 5000,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const handleClose = () => {
    onClose(id);
  };

  return (
    <ToastWrapper $toastType={type}>
      <ToastContent>
        <ToastMessage>{message}</ToastMessage>
        <CloseButton onClick={handleClose} aria-label="Close notification">
          ×
        </CloseButton>
      </ToastContent>
    </ToastWrapper>
  );
};
