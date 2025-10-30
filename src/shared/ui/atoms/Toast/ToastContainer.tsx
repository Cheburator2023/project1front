import React, { ReactNode } from 'react';
import { ToastContainerWrapper } from './style';

interface ToastContainerProps {
  children: ReactNode;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ children }) => {
  return <ToastContainerWrapper>{children}</ToastContainerWrapper>;
};