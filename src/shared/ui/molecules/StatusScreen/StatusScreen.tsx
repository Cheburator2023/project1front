import React, { useEffect, useMemo, useState } from 'react';
import { StatusIndicator } from '@admiral-ds/react-ui';
import { ReactComponent as CheckSolid } from '@admiral-ds/icons/build/service/CheckSolid.svg';
import { ReactComponent as ErrorSolid } from '@admiral-ds/icons/build/service/ErrorSolid.svg';

import { Loading } from '@shared/ui/atoms';

import { ErrorColor, StatusWrapper, SuccessColor } from './styled';

export interface StatusScreenProps {
  apiLoading: boolean;
  error?: string;
  showTimeMls?: number;
  loadingLabel?: string;
  successLabel?: string;
  onFinished?: () => void;
  children: React.ReactNode;
}

export const StatusScreen = ({
  apiLoading,
  error,
  loadingLabel = 'Загрузка...',
  successLabel = 'Успешно',
  children,
  onFinished,
}: StatusScreenProps) => {
  const [firstUpdate, setFirstUpdate] = useState(true);
  const [apiStatus, setApiStatus] = useState<'inProgress' | 'finished' | 'finishedWithError'>();

  const [tik, setTick] = React.useState(0);

  useEffect(() => {
    if (apiLoading && firstUpdate) {
      setApiStatus('inProgress');
      setFirstUpdate(false);
    } else if (!apiLoading && !firstUpdate) {
      if (error) {
        setApiStatus('finishedWithError');
      } else {
        setApiStatus('finished');
      }
    }
  }, [apiLoading, error]);

  useEffect(() => {
    if (apiStatus && apiStatus !== 'inProgress') {
      const counter = () => setTick((prev) => prev + 20);

      const timerTime = apiStatus === 'finished' ? 500 : 900;

      const timerId = setTimeout(counter, timerTime);

      if (tik === 100) {
        clearTimeout(timerId);
        setTick(0);
        setApiStatus(undefined);
        setFirstUpdate(true);

        onFinished?.();
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
              cssMixin={error ? ErrorColor : SuccessColor}
              dimension="m"
              text={error ? error : successLabel}
              displayRight={false}
              icon={error ? <ErrorSolid /> : <CheckSolid />}
            />
          )}
        </StatusWrapper>
      ) : (
        children
      )}
    </>
  );
};
