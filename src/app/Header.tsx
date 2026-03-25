import React from 'react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import Keycloak from 'keycloak-js';
import styled from 'styled-components';

import { T, Button, Avatar } from '@admiral-ds/react-ui';
import { ReactComponent as ExitIcon } from '@admiral-ds/icons/build/system/ExitSolid.svg';
import { ReactComponent as ArrowsHorizontalOutline } from '@admiral-ds/icons/build/system/ArrowsHorizontalOutline.svg';
import { ReactComponent as PersonSolid } from '@admiral-ds/icons/build/system/PersonSolid.svg';

import { IconButton } from '@shared/ui/molecules';
import { useModelRiskReport, useRoles } from '@shared/hooks';

import { useExploitationModeStore } from '@src/shared/stores';

import { ReactComponent as LogoIcon } from './logo.svg';
import { ColumnsFilter } from '../shared/types';
import { ROUTES } from './Routes';
import { useGlobalStore } from '../shared/stores/globalStore';
import { defaultExcelExportParams } from '../shared/helpers/excelExportHelpers';

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
  const { isBusinessCustomer } = useRoles();
  const navigate = useNavigate();

  const { downloadReport: downloadModelRiskReport, isDownloading: isDownloadingKMR } =
    useModelRiskReport();

  const userName =
    user?.family_name && user?.given_name
      ? `${user.family_name} ${user.given_name}`
      : 'Анонимный пользователь';

  // Helper to extract filters from agGrid
  const getFiltersFromAgGrid = (): Partial<ColumnsFilter> => {
    if (!agGridApi) return {};

    const filterModel = agGridApi.getFilterModel();
    return filterModel as Partial<ColumnsFilter>;
  };

  return (
    <Container>
      <Link to="/">
        <Logo>
          <LogoIcon />
          <CustomLabel font="Caption/Caption 1">Реестр моделей</CustomLabel>
        </Logo>
      </Link>

      <ActionsGroup>
        {/* <CustomButton
          dimension="s"
          disabled={!agGridApi || isDownloadingKMR}
          onClick={() => {
            const filters = getFiltersFromAgGrid();
            downloadModelRiskReport(filters);
          }}
        >
          <T font="Button/Button 2">
            {isDownloadingKMR ? 'Выгружается...' : 'Отчет КМР'}
          </T>
        </CustomButton> */}

        <CustomButton
          dimension="s"
          disabled={!agGridApi}
          onClick={() => {
            if (!agGridApi) return;

            // Get only visible columns in their current display order
            const visibleColumns = agGridApi.getAllDisplayedColumns();

            const columnKeys = visibleColumns
              .filter((col) => col.getColId() !== 'ag-Grid-ControlsColumn')
              .map((col) => col.getColId());

            return agGridApi.exportDataAsExcel({
              columnKeys,
              fileName: `Отчет ${format(new Date(), 'dd.MM.yyyy')}.xlsx`,
              // Export only filtered data if filters are applied
              onlySelected: false,
              // Include column headers
              skipColumnHeaders: false,
              // Use current column widths and order
              allColumns: false,
              ...defaultExcelExportParams,
            });
          }}
        >
          <T font="Button/Button 2">Выгрузить отчет</T>
        </CustomButton>

        {isBusinessCustomer && (
          <CustomButton dimension="s" onClick={() => navigate(ROUTES.ALLOCATION_CONFIRMATION)}>
            <T font="Button/Button 2">Подтвердить аллокацию за квартал</T>
          </CustomButton>
        )}

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

