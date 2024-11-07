import { Flex, T } from '@admiral-ds/react-ui';
import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ReactComponent as CloseOutline } from '@admiral-ds/icons/build/service/CloseOutline.svg';
import { ReactComponent as ChevronLeftOutline } from '@admiral-ds/icons/build/system/ChevronLeftOutline.svg';
import { ReactComponent as ChevronRightOutline } from '@admiral-ds/icons/build/system/ChevronRightOutline.svg';

import { ErrorStatus, Loading } from '@shared/ui/atoms';
import { IconButton } from '@shared/ui/molecules';

import { Overlay, Panel, Header, HeaderRow, Body, Footer, StatusWrapper } from './styles';
import { Flexbox } from '../../atoms/Flexbox';

export interface RightPanelProps {
  title: string;
  error?: string;
  expanded?: boolean;
  loading?: boolean;
  subTitle?: string;
  showPanel: boolean;
  header?: React.ReactNode;
  body?: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  onExpanded?: () => void;
  headerRightTitleContent?: React.ReactNode;
}

export const RightPanel = ({
  showPanel,
  title = 'Заголовок панели',
  expanded = false,
  onExpanded,
  header,
  body,
  error,
  loading,
  footer,
  onClose,
  headerRightTitleContent,
}: RightPanelProps) => {
  const escFunction = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  const onExpandHandler = useCallback(() => {
    onExpanded?.();
  }, [expanded]);

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
      <Panel width={expanded ? '90%' : '400px'}>
        <Header>
          <HeaderRow>
            <IconButton
              dimension="lBig"
              icon={expanded ? <ChevronRightOutline /> : <ChevronLeftOutline />}
              tooltip="Развернуть панель"
              onClick={onExpandHandler}
            />

            <Flexbox justifyContent="center" alignItems="center">
              <T font="Subtitle/Subtitle 2" as="div">
                {title}
              </T>
            </Flexbox>
            <Flexbox alignItems="center">
              <div>{headerRightTitleContent}</div>
              <IconButton
                dimension="lBig"
                icon={<CloseOutline />}
                tooltip="Закрыть"
                onClick={onClose}
              />
            </Flexbox>
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

