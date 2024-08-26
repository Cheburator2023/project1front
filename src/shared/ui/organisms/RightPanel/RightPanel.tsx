import { T } from '@admiral-ds/react-ui';
import React, { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ReactComponent as CloseOutline } from '@admiral-ds/icons/build/service/CloseOutline.svg';

import { ErrorStatus, Loading } from '@shared/ui/atoms';
import { IconButton } from '@shared/ui/molecules';

import { Overlay, Panel, Header, HeaderRow, Body, Footer, StatusWrapper } from './styles';

export interface RightPanelProps {
  title: string;
  error?: string;
  loading?: boolean;
  subTitle?: string;
  showPanel: boolean;
  header?: React.ReactNode;
  body?: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
}

export const RightPanel = ({
  showPanel,
  title = 'Заголовок панели',
  header,
  body,
  error,
  loading,
  footer,
  onClose,
}: RightPanelProps) => {
  const escFunction = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (showPanel) {
      document.addEventListener('keydown', escFunction, false);

      return () => {
        document.removeEventListener('keydown', escFunction, false);
      };
    }
  }, [escFunction, showPanel]);

  if (!showPanel) {
    return null;
  }

  const errorCmp = error && (
    <StatusWrapper>
      <ErrorStatus text={error} />
    </StatusWrapper>
  );

  const loadingCmp = loading && (
    <StatusWrapper>
      <Loading text="Загрузка данных ..." />
    </StatusWrapper>
  );

  return createPortal(
    <Overlay>
      <Panel>
        <Header>
          <HeaderRow>
            <T font="Subtitle/Subtitle 2" as="div">
              {title}
            </T>
            <IconButton
              dimension="lBig"
              icon={<CloseOutline />}
              tooltip="Закрыть"
              onClick={onClose}
            />
          </HeaderRow>
          {header}
        </Header>
        <Body>{errorCmp || loadingCmp || body}</Body>
        {footer ? <Footer>{footer}</Footer> : null}
      </Panel>
    </Overlay>,
    document.body,
  );
};
