import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import Keycloak from 'keycloak-js';
import styled from 'styled-components';

import { T, Button, Avatar } from '@admiral-ds/react-ui';
import { ReactComponent as ExitIcon } from '@admiral-ds/icons/build/system/ExitSolid.svg';
import { ReactComponent as ArrowsHorizontalOutline } from '@admiral-ds/icons/build/system/ArrowsHorizontalOutline.svg';
import { ReactComponent as PersonSolid } from '@admiral-ds/icons/build/system/PersonSolid.svg';

import { getRootPath } from './helpers';

import { IconButton, Loading, Tooltip } from 'src/components';
import { ReactComponent as LogoIcon } from './logo.svg';
import { ColumnsFilter } from 'src/modules/Home/TableModels/types';

import { API_ROUTES, useFetch } from 'src/api';
import { ReportApi } from 'src/api/types';

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

const LoadingWrapper = styled.div`
  margin-right: 65px;
`;

const ActionsGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

interface HeaderProps {
  columnsFilters?: Partial<ColumnsFilter>;
  downloadReportStatus: boolean;
  user?: Keycloak.KeycloakTokenParsed & { family_name: string; given_name: string };
  updateColumnsFilters: (newColumnsFilters?: Partial<ColumnsFilter>) => void;
  updateDownloadReportStatus: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout?: () => void;
  goToSum?: () => void;
}

const Header = ({
  columnsFilters,
  user,
  downloadReportStatus,
  updateColumnsFilters,
  updateDownloadReportStatus,
  onLogout,
  goToSum,
}: HeaderProps) => {
  const sumBtnRef = useRef(null);

  const rootPath = getRootPath();
  const { mutationProtectedFetch } = useFetch({});

  useEffect(() => {
    if (columnsFilters && downloadReportStatus) {
      mutationProtectedFetch<ReportApi, Blob>({
        body: {
          filters: columnsFilters,
        },
        fetchApiRoute: API_ROUTES.REPORT,
        fetchMethod: 'POST',
        fileName: `Отчёт ${format(new Date(), 'dd.MM.yyyy')}`,
      })?.then(() => {
        updateDownloadReportStatus(false);
        updateColumnsFilters(undefined);
      });
    }
  }, [columnsFilters, downloadReportStatus]);

  const userName =
    user?.family_name && user?.given_name
      ? `${user.family_name} ${user.given_name}`
      : 'Анонимный пользователь';

  return (
    <Container>
      <Link to={rootPath}>
        <Logo>
          <LogoIcon />
          <CustomLabel font="Caption/Caption 1">Реестр моделей</CustomLabel>
        </Logo>
      </Link>
      <ActionsGroup>
        {downloadReportStatus ? (
          <LoadingWrapper>
            <Loading text="" spinnerSize="s" />
          </LoadingWrapper>
        ) : (
          <CustomButton dimension="s" onClick={() => updateDownloadReportStatus(true)}>
            <T font="Button/Button 2">Выгрузить отчет</T>
          </CustomButton>
        )}
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
        <Avatar
          dimension="xs"
          showTooltip
          icon={<PersonSolid />}
          status="success"
          userName={userName}
        />
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
