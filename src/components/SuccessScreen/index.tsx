import React, { useEffect, useMemo, useState } from 'react';
import { StatusIndicator } from '@admiral-ds/react-ui';
import styled, { css } from 'styled-components';
import { ReactComponent as CheckSolid } from '@admiral-ds/icons/build/service/CheckSolid.svg';

import { Loading } from '../Loading';

const StatusWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 50px 0;
  justify-content: center;
`;

const SuccessColor = css`
  color: ${(p) => p.theme.color['Success/Success 50 Main']};
  > div {
    svg {
      path {
        fill: ${(p) => p.theme.color['Success/Success 50 Main']};
      }
    }
  }
`;

interface SuccessScreenProps {
  apiLoading: boolean;
  showTimeMls?: number;
  loadingLabel?: string;
  successLabel?: string;
  onFinished: () => void;
  children: React.ReactNode;
}

export const SuccessScreen = ({
  apiLoading,
  loadingLabel = 'Загрузка...',
  successLabel = 'Успешно',
  children,
  onFinished,
}: SuccessScreenProps) => {
  const [firstUpdate, setFirstUpdate] = useState(true);
  const [apiStatus, setApiStatus] = useState<'inProgress' | 'finished'>();

  const [tik, setTick] = React.useState(0);

  useEffect(() => {
    if (apiLoading && firstUpdate) {
      setApiStatus('inProgress');
      setFirstUpdate(false);
    } else if (!apiLoading && !firstUpdate) {
      setApiStatus('finished');
    }
  }, [apiLoading]);

  useEffect(() => {
    if (apiStatus === 'finished') {
      const counter = () => setTick((prev) => prev + 20);

      const timerId = setTimeout(counter, 500);
      if (tik === 100) {
        clearTimeout(timerId);
        onFinished();
      }
      return () => {
        clearTimeout(timerId);
      };
    }
  }, [apiStatus, tik]);

  const loadingStatus = useMemo(() => {
    if (apiStatus === 'inProgress') {
      return true;
    }

    if (apiStatus === 'finished' && tik < 50) {
      return true;
    }

    return false;
  }, [apiStatus, tik]);

  return (
    <>
      {apiStatus ? (
        <StatusWrapper>
          {loadingStatus ? (
            <Loading text={loadingLabel} />
          ) : (
            <StatusIndicator
              cssMixin={SuccessColor}
              dimension="m"
              text={successLabel}
              displayRight={false}
              icon={<CheckSolid />}
            />
          )}
        </StatusWrapper>
      ) : (
        children
      )}
    </>
  );
};
