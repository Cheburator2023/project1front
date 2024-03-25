import React, { useRef } from 'react';
import { T, Button } from '@admiral-ds/react-ui';
import { ReactComponent as ExitIcon } from '@admiral-ds/icons/build/system/ExitSolid.svg';
import { ReactComponent as ArrowsHorizontalOutline } from '@admiral-ds/icons/build/system/ArrowsHorizontalOutline.svg';
import styled from 'styled-components';

import { IconButton, Tooltip } from 'src/components';
import { ReactComponent as LogoIcon } from './logo.svg';
import { DownloadReport } from './DownloadReport';
import { CSVReportBody, CSVReportHeader } from './DownloadReport/types';

const Container = styled.div`
  width: 100%;
  height: 64px;
  background: #0132b0;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  padding: 0 28px;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  span {
    margin: 5px 0 0 8px;
  }
`;

const CustomLabel = styled(T)`
  color: var(--primary-primary-20, #dde9ff);
  font-size: 10px;
  text-transform: uppercase;
`;

const CustomButton = styled(Button)`
  margin-right: 10px;

  span {
    color: #fff;
  }

  path {
    fill: #fff !important;
  }
`;

const ActionsGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

interface HeaderProps {
  csvReportContent: {
    header: CSVReportHeader;
    body: CSVReportBody;
  };
  onLogout?: () => void;
  goToSum?: () => void;
}

const Header = ({ csvReportContent, onLogout, goToSum }: HeaderProps) => {
  const sumBtnRef = useRef(null);

  return (
    <Container>
      <Logo>
        <LogoIcon />
        <CustomLabel font="Caption/Caption 1">Реестр моделей</CustomLabel>
      </Logo>
      <ActionsGroup>
        <DownloadReport header={csvReportContent.header} body={csvReportContent.body} />
        <CustomButton
          ref={sumBtnRef}
          onClick={goToSum}
          dimension="m"
          appearance="ghost"
          iconPlace="right"
          icon={<ArrowsHorizontalOutline />}
        >
          <T font="Button/Button 2">СУМ</T>
        </CustomButton>
        <Tooltip targetRef={sumBtnRef} title="Перейти в СУМ" />
        <IconButton
          color="#fff"
          dimension="mBig"
          onClick={onLogout}
          tooltip="Выйти из учетной записи"
          icon={<ExitIcon />}
        />
      </ActionsGroup>
    </Container>
  );
};

export { Header };
