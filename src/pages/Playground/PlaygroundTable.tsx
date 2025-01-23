/* eslint-disable no-nested-ternary */
import React, { useCallback, useMemo, useRef, useState, StrictMode, useEffect } from 'react';
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import 'ag-grid-enterprise';

import {
  ColDef,
  FilterChangedEvent,
  FilterModifiedEvent,
  GetMainMenuItemsParams,
  IDateFilterParams,
  ITooltipParams,
  RowClassRules,
  RowSelectedEvent,
  RowSelectionOptions,
  SelectionChangedEvent,
  ValueGetterParams,
} from 'ag-grid-community';
import { ReactComponent as BrokerOutlineIcon } from '@admiral-ds/icons/build/finance/BrokerOutline.svg';
import { ReactComponent as MenuOutline } from '@admiral-ds/icons/build/service/MenuOutline.svg';
import { ReactComponent as PlusCircleSolid } from '@admiral-ds/icons/build/service/PlusCircleSolid.svg';
import { ReactComponent as SettingsOutline } from '@admiral-ds/icons/build/system/SettingsOutline.svg';
import { ReactComponent as SearchOutline } from '@admiral-ds/icons/build/system/SearchOutline.svg';
import { ReactComponent as ShowTableOutline } from '@admiral-ds/icons/build/category/ShowTableOutline.svg';
import { ReactComponent as DeleteSolid } from '@admiral-ds/icons/build/system/DeleteSolid.svg';
import { Checkbox, PaginationOne, T, InputField } from '@admiral-ds/react-ui';

import { Flexbox, Spacer } from '@src/shared/ui/atoms';
import { TDisplayTableModels, TFilters, TModelsTable } from '@pages/Home/hooks';
import { IconButton } from '@shared/ui/molecules';
import { RIGHT_PANEL_TYPE } from '@shared/constants';
import { useNavigate } from 'react-router-dom';
import { Column, COLUMN_TYPE, Row } from '@src/shared/types';
import { useAppInjectStore } from '@src/shared/stores/appInjectStore';
import { CUSTOMER_MAP } from '@src/shared/constants/customers';
import { useTableChange } from '@src/features/Tables/hooks';
import { format } from 'date-fns';
import { Template } from '@src/shared/api/types';
import { useExcludeErrorStore } from '@src/shared/stores/excludeErrorStore';
import { PlaygroundCustomCell } from './PlaygroundCustomCell';
import { AG_GRID_LOCALE_RU } from './locale/agGridLocale.ru';
import { ROUTES } from '../../app/Routes';
import { useDeleteRightModelPanelStore } from '../../shared/stores';
import { useRoles, useTemplateFilters } from '../../shared/hooks';
import { isInBusinessCustomers, isModelCreator } from '../../shared/helpers';
import { useDeepEffect } from '../../shared/hooks/useDeepEffect';

const toolTipValueGetter = (params: ITooltipParams) =>
  params.value == null || params.value === '' ? '- Отсутствует -' : params.value;

const containerStyle = { width: '100%', height: '100%', padding: '10px' };
const gridStyle = { height: '100%', width: '100%' };

const dateFilterParams: IDateFilterParams = {
  buttons: ['clear'],
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
  filters,
  templates,
  isCompared = false,
  columnList: columnListOuter,
  rowList: rowsOuter,
}: {
  display: TDisplayTableModels;
  modelsTable: TModelsTable;
  filters: TFilters;
  templates: Template[];
  isCompared?: boolean;
  columnList?: Column[];
  rowList?: Partial<Row>[];
}) => {
  const {
    rowList: rowListInner,
    setPage,
    page,
    setTotalRows,
    pageSize,
    searchString,
    columnList: columnListInner,
  } = modelsTable;

  const rowList = rowsOuter || rowListInner;
  const columnList = columnListOuter || columnListInner;

  const {
    cols,
    rows,
    setCols,
    setRows,
    // handleSelectionChange,
    handleResize,
    handleSort,
    handleChangeColumnsFilter,
    handleColumnDragEnd,
    columnsFilters,
    onChangeColumnsFilters,
    onChangeTopFilters,
    topFilters,
  } = useTableChange({
    rowList,
    setCurrentPage: setPage,
    page,
    updateRowsCount: setTotalRows,
    pageSize,
    searchString,
    columnList,
    templates: filters.templates,
  });
  const { currentCustomer } = useAppInjectStore();
  const { modelsCount, modelSource, isDeleteButtonEnabled, userMatches, updateDeleteModelState } =
    useDeleteRightModelPanelStore();
  const { excludeError, updateExcludeError } = useExcludeErrorStore();

  const { shouldResetTemplateOnInitialValueChange } = useTemplateFilters(
    columnsFilters,
    filters.templates,
    topFilters?.templates,
  );
  const { isAdmin, isValidatorLead } = useRoles();

  const navigate = useNavigate();
  const gridRef = useRef<AgGridReact>(null);
  const rowData = rows;
  const columnDefs = columnList.map((data) => ({
    ...data,
    headerName: data.title,
    field: data.name,
    headerTooltip: data.title,
    // https://www.ag-grid.com/react-data-grid/filter-date/#custom-selection-component
    filter:
      data.type === COLUMN_TYPE.DATE
        ? 'agDateColumnFilter'
        : data.type === COLUMN_TYPE.NUMBER
        ? 'agNumberColumnFilter'
        : 'agTextColumnFilter',
    filterParams: data.type === COLUMN_TYPE.DATE ? dateFilterParams : { buttons: ['clear'] },
    cellClass: (params) => {
      if (isCompared) {
        const rowIndex = params.node.rowIndex;
        const prevRow = params.api.getDisplayedRowAtIndex(rowIndex - 1);
        const colId = params.column.colId;
        const cellValue = params.data[colId];
        const prevRowSameCellValue = prevRow?.data[colId];
        const sameId = params?.data?.id?.split(':')[0] === prevRow?.data?.id?.split(':')[0];

        if (prevRow && sameId && prevRowSameCellValue !== cellValue) {
          return 'ag-custom-cell-value-changed';
        }
      }
    },
    // pinned: data.name === 'active_model' && currentCustomer === CUSTOMER_MAP.UMRV && 'left',
  }));

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: 'agTextColumnFilter',
      mainMenuItems: (params: GetMainMenuItemsParams) => {
        return params.defaultItems.filter(
          (item) => item !== 'columnChooser' && item !== 'rowGroup',
        );
      },
      filterParams: { buttons: ['clear'] },
      floatingFilter: true,
      initialWidth: 400,
      minWidth: 250,
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
      wrapHeaderText: false,
      autoHeaderHeight: false,
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
      rowSelected: (params) => {},
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

  let deleteTooltipMessage = '';

  if (modelsCount === 0) {
    deleteTooltipMessage = 'Выберите модель для удаления';
  } else if (modelsCount > 1) {
    deleteTooltipMessage = 'Нельзя удалить несколько моделей';
  } else if (modelSource !== 'sum-rm') {
    deleteTooltipMessage = 'Модель должна быть с исчтоником "sum-rm"';
  } else if (!userMatches && !isAdmin && !isValidatorLead) {
    deleteTooltipMessage =
      'Модель может-быть удалена только создателем, владельцем модели или администратором';
  } else {
    deleteTooltipMessage = 'Удалить модель';
  }

  const handleSelectionChange = (event: SelectionChangedEvent): void => {
    const selectedRows = event.api.getSelectedRows();

    if (selectedRows.length === 1) {
      const selectedRow = selectedRows[0];

      const { model_source, status, id } = selectedRow;

      const userMatches = isModelCreator(selectedRow) || isInBusinessCustomers(selectedRow);

      updateDeleteModelState(1, model_source, status, id, userMatches);
    } else {
      updateDeleteModelState(selectedRows.length);
    }
  };

  const handleFilterChange = (event: FilterChangedEvent): void => {
    // @ts-ignore
    const colDef: any = event.api.getColumnFilterModel(event?.columns[0]?.getColDef());
    // @ts-ignore
    const isDate = event?.columns[0]?.colDef?.filterType === 'date';
    // @ts-ignore
    const colName: string = event?.columns[0]?.colId;

    if (isDate) {
      const dateFrom = new Date(colDef.dateFrom);
      const dateTo = new Date(colDef.dateTo || colDef.dateFrom);
      const toReverse = dateFrom > dateTo;

      if (toReverse) {
        const dateRange = [format(dateTo, 'yyyy-MM-dd'), format(dateFrom, 'yyyy-MM-dd')];
        handleChangeColumnsFilter(colName, dateRange);
      } else {
        const dateRange = [format(dateFrom, 'yyyy-MM-dd'), format(dateTo, 'yyyy-MM-dd')];
        handleChangeColumnsFilter(colName, dateRange);
      }
    } else {
      // @ts-ignore
      const value = colDef?.filterModels[1]?.values;
      const initialTemplateValue = columnsFilters?.[colName] || [];

      if (value) {
        const arrayValue = Array.isArray(value) ? value : [value];
        handleChangeColumnsFilter(colName, arrayValue);

        if (shouldResetTemplateOnInitialValueChange(arrayValue, initialTemplateValue, colName)) {
          onChangeTopFilters?.({ ...topFilters, templates: [] });
        }
      }
    }
  };

  useDeepEffect(() => {
    if (rowList.length) {
      setRows(rowList);
      modelsTable.setTotalRows(rowList.length);
    }
  }, [rowList, modelsTable.setTotalRows, templates]);

  const rowClassRules = useMemo<RowClassRules>(() => {
    return {
      // row style function
      'ag-row-is-odd': (params) => {
        return params?.rowIndex % 2 === 0;
      },
    };
  }, []);

  return (
    <Flexbox height="calc(100vh - 230px)">
      <div style={containerStyle}>
        <Flexbox alignItems="center" justifyContent="space-between">
          <Flexbox width="1500px" fillChild alignItems="center" gap={20}>
            <InputField
              id="filter-text-box"
              onChange={onFilterTextBoxChanged}
              placeholder="Поиск"
              icons={<SearchOutline />}
            />

            <Flexbox gap={6}>
              <Checkbox
                dimension="s"
                checked={excludeError}
                onChange={(e) => updateExcludeError(e.target.checked)}
              />
              <T font="Body/Body 2 Short" as="div">
                Не включать модели со статусом ошибка заведения
              </T>
            </Flexbox>
          </Flexbox>

          <div>
            <IconButton
              icon={<PlusCircleSolid />}
              tooltip="Добавить модель"
              color="#0062FF"
              onClick={() => display.setRightPanelType(RIGHT_PANEL_TYPE.ADD_MODEL)}
            />
            {/* <IconButton
              icon={<DeleteSolid />}
              tooltip={deleteTooltipMessage}
              color="#0062FF"
              onClick={() => display.setRightPanelType(RIGHT_PANEL_TYPE.DELETE_MODEL)}
              disabled={!isDeleteButtonEnabled}
            /> */}
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
            rowClassRules={rowClassRules}
            selectionColumnDef={{
              pinned: 'left',
              lockPinned: true,
            }}
            autoGroupColumnDef={{
              minWidth: 200,
              pinned: 'left',
              lockPinned: true,
            }}
            sideBar={{
              toolPanels: [
                {
                  id: 'columns',
                  labelDefault: 'Columns',
                  labelKey: 'columns',
                  iconKey: 'columns',
                  toolPanel: 'agColumnsToolPanel',
                },
                {
                  id: 'filters',
                  labelDefault: 'Filters',
                  labelKey: 'filters',
                  iconKey: 'filter',
                  toolPanel: 'agFiltersToolPanel',
                },
              ],
              defaultToolPanel: undefined,
              // hiddenByDefault: true,
            }}
            onSelectionChanged={handleSelectionChange}
            onFilterChanged={handleFilterChange}
            pagination
            paginationPageSize={pageSize}
            paginationPageSizeSelector={paginationPageSizeSelector}
            singleClickEdit
            localeText={AG_GRID_LOCALE_RU}
            alwaysShowHorizontalScroll
            tooltipShowDelay={500}
          />
        </div>
      </div>
    </Flexbox>
  );
};

