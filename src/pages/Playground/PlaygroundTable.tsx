/* eslint-disable no-nested-ternary */
import React, { useCallback, useMemo, useRef, useState, StrictMode } from 'react';
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import 'ag-grid-enterprise';

import {
  ColDef,
  IDateFilterParams,
  ITooltipParams,
  RowSelectionOptions,
  ValueGetterParams,
} from 'ag-grid-community';
import { ReactComponent as BrokerOutlineIcon } from '@admiral-ds/icons/build/finance/BrokerOutline.svg';
import { ReactComponent as MenuOutline } from '@admiral-ds/icons/build/service/MenuOutline.svg';
import { ReactComponent as PlusCircleSolid } from '@admiral-ds/icons/build/service/PlusCircleSolid.svg';
import { ReactComponent as SettingsOutline } from '@admiral-ds/icons/build/system/SettingsOutline.svg';
import { ReactComponent as SearchOutline } from '@admiral-ds/icons/build/system/SearchOutline.svg';
import { ReactComponent as ShowTableOutline } from '@admiral-ds/icons/build/category/ShowTableOutline.svg';

import { Flexbox, Spacer } from '@src/shared/ui/atoms';
import { TDisplayTableModels, TModelsTable } from '@pages/Home/hooks';
import { IconButton } from '@shared/ui/molecules';
import { RIGHT_PANEL_TYPE } from '@shared/constants';
import { useNavigate } from 'react-router-dom';
import { InputField } from '@admiral-ds/react-ui';
import { COLUMN_TYPE } from '@src/shared/types';
import { useAppInjectStore } from '@src/shared/stores/appInjectStore';
import { CUSTOMER_MAP } from '@src/shared/constants/customers';
import { PlaygroundCustomCell } from './PlaygroundCustomCell';
import { AG_GRID_LOCALE_RU } from './locale/agGridLocale.ru';
import { ROUTES } from '../../app/Routes';

const toolTipValueGetter = (params: ITooltipParams) =>
  params.value == null || params.value === '' ? '- Отсутствует -' : params.value;

const containerStyle = { width: '100%', height: '100%', padding: '10px' };
const gridStyle = { height: '100%', width: '100%' };

const dateFilterParams: IDateFilterParams = {
  inRangeInclusive: true,
  comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
    if (cellValue == null) return -1;

    const cellDate = new Date(cellValue);

    if (cellDate.toLocaleDateString() === filterLocalDateAtMidnight.toLocaleDateString()) {
      return 0;
    }
    if (cellDate < filterLocalDateAtMidnight) {
      return -1;
    }
    if (cellDate > filterLocalDateAtMidnight) {
      return 1;
    }
    return 0;
  },
  minValidYear: 2000,
  inRangeFloatingFilterDateFormat: ' YYYY-MM-DD ',
};

export const PlaygroundTable = ({
  display,
  modelsTable,
}: {
  display: TDisplayTableModels;
  modelsTable: TModelsTable;
}) => {
  const { currentCustomer } = useAppInjectStore();
  const navigate = useNavigate();
  const gridRef = useRef<AgGridReact>(null);
  const rowData = modelsTable.rowList;
  const columnDefs = modelsTable.columnList.map((data) => ({
    ...data,
    headerName: data.title,
    field: data.name,
    // https://www.ag-grid.com/react-data-grid/filter-date/#custom-selection-component
    filter:
      data.type === COLUMN_TYPE.DATE
        ? 'agDateColumnFilter'
        : data.type === COLUMN_TYPE.NUMBER
        ? 'agNumberColumnFilter'
        : 'agMultiColumnFilter',
    filterParams: data.type === COLUMN_TYPE.DATE && dateFilterParams,
    // pinned: data.name === 'active_model' && currentCustomer === CUSTOMER_MAP.UMRV && 'left',
  }));

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: 'agMultiColumnFilter',
      floatingFilter: true,
      initialWidth: 400,
      minWidth: 200,
      maxWidth: 1350,
      suppressHeaderMenuButton: false,
      suppressHeaderContextMenu: false,
      // allow every column to be aggregated
      enableValue: true,
      // allow every column to be grouped
      enableRowGroup: true,
      // allow every column to be pivoted
      enablePivot: true,
      flex: 2,
      sortable: true,
      resizable: true,
      wrapHeaderText: true,
      autoHeaderHeight: true,
      // valueGetter: (params: ValueGetterParams) => {
      //   return `(${params.getValue})`;
      // },
      editable: false,
      toolTipValueGetter,
      cellRenderer: PlaygroundCustomCell,
      cellRendererParams: {
        onAction: (action: any, row_system_model_id: any, columnName: any): any => {
          modelsTable.handleClickOnActionCell(action, row_system_model_id, columnName);
        },
      },
    };
  }, []);

  const rowSelection = useMemo<RowSelectionOptions | 'single' | 'multiple'>(() => {
    return {
      mode: 'multiRow',
      headerCheckbox: true,
      selectAll: 'filtered',
    };
  }, []);

  const onGridReadyGetData = useCallback(() => {}, []);

  const onFilterTextBoxChanged = useCallback(() => {
    gridRef.current!.api.setGridOption(
      'quickFilterText',
      (document.getElementById('filter-text-box') as HTMLInputElement).value,
    );
  }, []);

  const paginationPageSizeSelector = useMemo<number[] | boolean>(() => {
    return [20, 100, 500, 1000];
  }, []);

  return (
    <Flexbox height="calc(100vh - 230px)">
      <div style={containerStyle}>
        <Flexbox alignItems="center" justifyContent="space-between">
          <Flexbox width="500px" fillChild>
            <InputField
              id="filter-text-box"
              onChange={onFilterTextBoxChanged}
              placeholder="Поиск"
              icons={<SearchOutline />}
            />
          </Flexbox>
          <div>
            <IconButton
              icon={<PlusCircleSolid />}
              tooltip="Добавить модель"
              color="#0062FF"
              onClick={() => display.setRightPanelType(RIGHT_PANEL_TYPE.ADD_MODEL)}
            />
            <IconButton
              icon={<BrokerOutlineIcon />}
              tooltip="Графики"
              onClick={() => navigate('charts')}
            />
            <IconButton
              icon={<ShowTableOutline />}
              tooltip="Текущий интерфейс таблиц"
              onClick={() => navigate(ROUTES.MF_HOME_ROUTE)}
            />
            <IconButton icon={<MenuOutline />} tooltip="Меню" onClick={() => null} />
            <IconButton icon={<SettingsOutline />} tooltip="Настройки" onClick={() => null} />
          </div>
        </Flexbox>

        <Spacer />

        <div style={gridStyle} className="ag-theme-quartz">
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs as any}
            defaultColDef={defaultColDef}
            rowSelection={rowSelection}
            animateRows
            cellSelection
            onGridReady={onGridReadyGetData}
            selectionColumnDef={{
              pinned: 'left',
              lockPinned: true,
            }}
            autoGroupColumnDef={{
              minWidth: 200,
              pinned: 'left',
              lockPinned: true,
            }}
            sideBar
            pagination
            paginationPageSize={100}
            paginationPageSizeSelector={paginationPageSizeSelector}
            singleClickEdit
            localeText={AG_GRID_LOCALE_RU}
            alwaysShowHorizontalScroll
          />
        </div>
      </div>
    </Flexbox>
  );
};

