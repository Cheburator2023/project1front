import { IconPlacement, IconPlacementDimension } from '@admiral-ds/react-ui';
import React, { useRef } from 'react';
import { Tooltip } from '@shared/ui/atoms';

export interface IconButtonProps {
  tooltip?: string;
  name?: string;
  color?: string;
  icon: React.ReactNode;
  dimension?: IconPlacementDimension;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled?: boolean;
}

export const IconButton = ({
  tooltip,
  name,
  icon,
  className,
  dimension = 'mBig',
  color = '#717681',
  onClick,
  disabled,
}: IconButtonProps) => {
  const iconRef = useRef(null);

  return (
    <>
      <IconPlacement
        name={name}
        className={className}
        ref={iconRef}
        onClick={onClick}
        dimension={dimension}
        appearance={{ iconColor: color }}
        disabled={disabled}
      >
        {icon}
      </IconPlacement>
      {tooltip ? <Tooltip targetRef={iconRef} title={tooltip} /> : null}
    </>
  );
};

