import { IconPlacement, IconPlacementDimension } from '@admiral-ds/react-ui';
import React, { useRef, useState } from 'react';
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
  const iconRef = useRef<HTMLDivElement>(null);
  const [isTooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div
      ref={iconRef}
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
      style={{ display: 'inline-block' }}
    >
      <IconPlacement
        name={name}
        className={className}
        onClick={onClick}
        dimension={dimension}
        appearance={{ iconColor: color }}
        disabled={disabled}
      >
        {icon}
      </IconPlacement>
      {tooltip && isTooltipVisible && <Tooltip targetRef={iconRef as any} title={tooltip} />}
    </div>
  );
};

