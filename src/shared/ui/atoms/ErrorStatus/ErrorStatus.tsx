import React from 'react';
import { StatusIndicator } from '@admiral-ds/react-ui';
import { ReactComponent as ErrorSolid } from '@admiral-ds/icons/build/service/ErrorSolid.svg';

import { ErrorColor } from './styled';

export interface ErrorStatusProps {
  text: string;
}

export const ErrorStatus = ({ text }: ErrorStatusProps) => (
  <StatusIndicator
    cssMixin={ErrorColor}
    dimension="m"
    text={text}
    displayRight={false}
    icon={<ErrorSolid />}
  />
);

