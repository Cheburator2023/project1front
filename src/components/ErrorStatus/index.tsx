import React from 'react';
import { StatusIndicator } from '@admiral-ds/react-ui';
import { ReactComponent as ErrorSolid } from '@admiral-ds/icons/build/service/ErrorSolid.svg';

import { css } from 'styled-components';

interface ErrorStatusProps {
  text: string;
}

const ErrorColor = css`
  color: ${(p) => p.theme.color['Error/Error 60 Main']};
  > div {
    svg {
      path {
        fill: ${(p) => p.theme.color['Error/Error 60 Main']};
      }
    }
  }
`;

export const ErrorStatus = ({ text }: ErrorStatusProps) => (
  <StatusIndicator
    cssMixin={ErrorColor}
    dimension="m"
    text={text}
    displayRight={false}
    icon={<ErrorSolid />}
  />
);
