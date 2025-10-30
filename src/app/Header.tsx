import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import Keycloak from 'keycloak-js';
import styled from 'styled-components';

import { T, Button, Avatar } from '@admiral-ds/react-ui';
import { ReactComponent as ExitIcon } from '@admiral-ds/icons/build/system/ExitSolid.svg';
import { ReactComponent as ArrowsHorizontalOutline } from '@admiral-ds/icons/build/system/ArrowsHorizontalOutline.svg';
import { ReactComponent as PersonSolid } from '@admiral-ds/icons/build/system/PersonSolid.svg';

import { Loading, Tooltip } from '@shared/ui/atoms';
import { IconButton } from '@shared/ui/molecules';
import { ReportApi } from '@shared/api';
import { useReportsControllerGetReport } from '@shared/api/generated/endpoints';

import { useExploitationModeStore } from '@src/shared/stores';
import { ReactComponent as LogoIcon } from './logo.svg';
import { ColumnsFilter } from '../shared/types';
import { ROUTES } from './Routes';
import { useGlobalStore } from '../shared/stores/globalStore';

const Container = styled('div')`
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

const Logo = styled('div')`
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

const LoadingWrapper = styled('div')`
  margin-right: 65px;
`;

const ActionsGroup = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

interface HeaderProps {
  downloadReportStatus?: boolean;
  user?: Keycloak.KeycloakTokenParsed & {
    family_name: string;
    given_name: string;
    realm_access: {
      roles: string[];
    };
    roles: string[];
  };
  onLogout?: () => void;
}

const Header = ({ user, downloadReportStatus, onLogout }: HeaderProps) => {
  const { agGridApi } = useGlobalStore();
  const selectedExploitationModes = useExploitationModeStore(
    (state) => state.selectedExploitationModes,
  );

  const userName =
    user?.family_name && user?.given_name
      ? `${user.family_name} ${user.given_name}`
      : 'Анонимный пользователь';

  return (
    <Container>
      <Link to="/sum-rm">
        <Logo>
          <LogoIcon />
          <CustomLabel font="Caption/Caption 1">Реестр моделей</CustomLabel>
        </Logo>
      </Link>

      <ActionsGroup>
        <CustomButton
          dimension="s"
          disabled={!agGridApi}
          onClick={() => {
            // @ts-ignore
            const columnKeys = agGridApi
              ?.getColumns()
              .filter((col) => col.getColId() !== 'ag-Grid-ControlsColumn')
              .map((col) => col.getColId());

            return agGridApi?.exportDataAsExcel({
              columnKeys,
              fileName: `Отчет ${format(new Date(), 'dd.MM.yyyy')}.xlsx`,
            });
          }}
        >
          <T font="Button/Button 2">Выгрузить отчет</T>
        </CustomButton>

        <CustomButton
          title="Перейти в СУМ"
          onClick={() => {
            window.location.href = '/sum';
          }}
          dimension="m"
          appearance="ghost"
          iconPlace="right"
          icon={<ArrowsHorizontalOutline />}
        >
          <T font="Button/Button 2">СУМ</T>
        </CustomButton>
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

