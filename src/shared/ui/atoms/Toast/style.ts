import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { smallGroupBorderRadius } from '@admiral-ds/react-ui';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

interface ToastWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  $toastType: 'error' | 'success' | 'warning' | 'info';
}

export const ToastWrapper = styled.div<ToastWrapperProps>`
  display: flex;
  align-items: center;
  min-width: 300px;
  max-width: 500px;
  margin-bottom: 8px;
  padding: 12px 16px;
  border-radius: ${(p) => smallGroupBorderRadius(p.theme.shape)};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: ${slideIn} 0.3s ease-out;
  position: relative;
  
  ${({ $toastType, theme }) => {
    switch ($toastType) {
      case 'error':
        return css`
          background-color: ${theme.color['Error/Error 10']};
          border-left: 4px solid ${theme.color['Error/Error 60']};
          color: ${theme.color['Error/Error 60']};
        `;
      case 'success':
        return css`
          background-color: ${theme.color['Success/Success 10']};
          border-left: 4px solid ${theme.color['Success/Success 50']};
          color: ${theme.color['Success/Success 50']};
        `;
      case 'warning':
        return css`
          background-color: ${theme.color['Warning/Warning 10']};
          border-left: 4px solid ${theme.color['Warning/Warning 50']};
          color: ${theme.color['Warning/Warning 50']};
        `;
      case 'info':
      default:
        return css`
          background-color: ${theme.color['Primary/Primary 10']};
          border-left: 4px solid ${theme.color['Primary/Primary 60']};
          color: ${theme.color['Primary/Primary 60']};
        `;
    }
  }}
`;

export const ToastContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export const ToastMessage = styled.div`
  flex: 1;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  margin-right: 12px;
`;

export const CloseButton = styled.button.attrs(() => ({
  type: 'button' as const,
}))<React.ButtonHTMLAttributes<HTMLButtonElement>>`
  background: none;
  border: none;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  color: inherit;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  &:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
`;

export const ToastContainerWrapper = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
  
  > * {
    pointer-events: auto;
  }
`;