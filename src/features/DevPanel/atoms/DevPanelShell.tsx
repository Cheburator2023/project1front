import React, { useState, type ReactNode } from 'react';
import { Button, T } from '@admiral-ds/react-ui';

type DevPanelShellProps = {
  title: string;
  children: ReactNode;
  launcherLabel?: string;
  width?: number;
  bottom?: number;
};

const panelStyle = (width: number, bottom: number): React.CSSProperties => ({
  position: 'fixed',
  right: 16,
  bottom,
  width,
  maxHeight: 'min(80vh, 720px)',
  zIndex: 10050,
  display: 'flex',
  flexDirection: 'column',
  background: '#fff',
  border: '1px solid #c5ccd6',
  borderRadius: 8,
  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  overflow: 'hidden',
});

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  background: '#f4f6f8',
  borderBottom: '1px solid #e5e7eb',
  gap: 8,
};

const launcherStyle: React.CSSProperties = {
  position: 'fixed',
  right: 16,
  bottom: 16,
  zIndex: 10050,
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #c5ccd6',
  background: '#fff',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
};

export const DevPanelShell = ({
  title,
  children,
  launcherLabel,
  width = 560,
  bottom = 16,
}: DevPanelShellProps) => {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} style={launcherStyle}>
        {launcherLabel ?? title}
      </button>
    );
  }

  return (
    <div style={panelStyle(width, bottom)} data-dev-panel-shell>
      <div style={headerStyle}>
        <T font="Subtitle/Subtitle 3">{title}</T>
        <Button dimension="s" appearance="secondary" onClick={() => setOpen(false)}>
          Скрыть
        </Button>
      </div>
      <div style={{ padding: 10, overflow: 'auto', flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
};
