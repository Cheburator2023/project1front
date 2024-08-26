import React, { useState, useLayoutEffect } from 'react';
import { Tooltip as AdmiralTooltip } from '@admiral-ds/react-ui';
import { TooltipPositionType } from '@admiral-ds/react-ui/dist/components/Tooltip/utils';

import { checkOverflow } from './helpers';

export type TooltipProps = {
  targetRef: React.RefObject<HTMLDivElement>;
  title: string;
  showOnOverflowOnly?: boolean;
  tooltipPosition?: TooltipPositionType;
};

export const Tooltip = ({
  targetRef,
  title,
  tooltipPosition = 'bottom',
  showOnOverflowOnly = false,
}: TooltipProps) => {
  const [overflow, setOverflow] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useLayoutEffect(() => {
    const element = targetRef.current;
    if (element && checkOverflow(element) !== overflow) {
      setOverflow(checkOverflow(element));
    }
  }, [tooltipVisible, setOverflow, targetRef, overflow]);

  // eslint-disable-next-line consistent-return
  useLayoutEffect(() => {
    function show() {
      setTooltipVisible(true);
    }
    function hide() {
      setTooltipVisible(false);
    }

    const text = targetRef.current;
    if (text) {
      text.addEventListener('mouseenter', show);
      text.addEventListener('mouseleave', hide);
      return () => {
        text.removeEventListener('mouseenter', show);
        text.removeEventListener('mouseleave', hide);
      };
    }
  }, [targetRef, setTooltipVisible]);

  if ((showOnOverflowOnly && !overflow) || !tooltipVisible) {
    return null;
  }

  return (
    <AdmiralTooltip
      targetRef={targetRef}
      tooltipPosition={tooltipPosition}
      renderContent={() => title}
    />
  );
};
