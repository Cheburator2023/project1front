/* eslint-disable no-nested-ternary */
import { forwardRef, useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';

import {
  ColDef,
  FilterChangedEvent,
  FirstDataRenderedEvent,
  GetContextMenuItems,
  GetMainMenuItemsParams,
  GridApi,
  GridReadyEvent,
  IDateFilterParams,
  IRowNode,
  ISetFilterParams,
  ITooltipParams,
  RowClassRules,
  RowDataUpdatedEvent,
  RowDragEndEvent,
  RowDragMoveEvent,
  RowSelectedEvent,
  RowSelectionOptions,
  SelectionChangedEvent,
  SelectionColumnDef,
  SideBarDef,
  SortChangedEvent,
  themeQuartz,
} from 'ag-grid-community';
import { ReactComponent as BrokerOutlineIcon } from '@admiral-ds/icons/build/finance/BrokerOutline.svg';
import { ReactComponent as MenuOutline } from '@admiral-ds/icons/build/service/MenuOutline.svg';
import { ReactComponent as PlusCircleSolid } from '@admiral-ds/icons/build/service/PlusCircleSolid.svg';
import { ReactComponent as SettingsOutline } from '@admiral-ds/icons/build/system/SettingsOutline.svg';
import { ReactComponent as SearchOutline } from '@admiral-ds/icons/build/system/SearchOutline.svg';
import { ReactComponent as ShowTableOutline } from '@admiral-ds/icons/build/category/ShowTableOutline.svg';
import { ReactComponent as DeleteSolid } from '@admiral-ds/icons/build/system/DeleteSolid.svg';
import { Checkbox, T, InputField } from '@admiral-ds/react-ui';

import { ErrorStatus, Flexbox, Loading, Spacer } from '@src/shared/ui/atoms';
import { TDisplayTableModels, TFilters, TModelsTable } from '@pages/Home/hooks';
import { IconButton } from '@shared/ui/molecules';
import { RIGHT_PANEL_TYPE } from '@shared/constants';
import { useNavigate } from 'react-router-dom';
import { Column, COLUMN_TYPE, Row } from '@src/shared/types';
import { useTableChange } from '@src/features/Tables/hooks';
import { format } from 'date-fns';
import { Template } from '@src/shared/api/types';
import styled from 'styled-components';
import { AgGridTableCustomCell } from './AgGridTableCustomCell';
import { AG_GRID_LOCALE_RU } from '../../pages/Playground/locale/agGridLocale.ru';
import { ROUTES } from '../../app/Routes';
import { useDeleteRightModelPanelStore, useDisplayStore } from '../../shared/stores';
import { usePermissions, useRoles, useTemplateFilters } from '../../shared/hooks';
import { isInBusinessCustomers, isModelCreator } from '../../shared/helpers';
import { useDeepEffect } from '../../shared/hooks/useDeepEffect';
import { useGlobalStore } from '../../shared/stores/globalStore';
import { useFiltersStore } from '../../shared/stores/filtersStore';

interface IAgGridTableProps {
  templates?: Template[];
  isCompared?: boolean;
  columnList: Column[];
  rowList: Partial<Row>[];
  error?: string | null;
  loading?: boolean;
  handleClickOnActionCell?: (action: any, row_system_model_id: any, columnName: any) => any;
  setPage?: (page: number) => void;
  page?: number;
  setTotalRows?: (rows: number) => void;
  pageSize?: number;
  searchString?: string;
  onRowDragMove?: (event: RowDragMoveEvent) => void;
  onRowDragEnd?: (event: RowDragEndEvent) => void;
  onRowSelected?: (event: RowSelectedEvent) => void;
  rowDragManaged?: boolean;
  pagination?: boolean;
  actionPanel?: boolean;
  sidePanel?: boolean;
  onFirstDataRendered?: (event: FirstDataRenderedEvent) => void;
  onRowDataUpdated?: (event: RowDataUpdatedEvent) => void;
  onSelectionChanged?: (event: SelectionChangedEvent) => void;
  onSortChanged?: (event: SortChangedEvent) => void;
  onGridReady?: (event: GridReadyEvent) => void;
  noCustomCells?: boolean;
  pivot?: boolean;
  overlayNoRowsTemplate?: string;
}

const sideBarProps: SideBarDef | string | string[] | boolean | null = {
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
};

const toolTipValueGetter = (params: ITooltipParams) =>
  params.value == null || params.value === '' ? '- Отсутствует -' : params.value;

const containerStyle = { width: '100%', height: '100%', padding: '10px' };
const gridStyle = { height: '100%', width: '100%' };

const dateFilterParams: IDateFilterParams = {
  buttons: ['clear', 'apply'],
  inRangeInclusive: true,
  maxNumConditions: 1,
  filterOptions: ['equals', 'inRange'],
  closeOnApply: true,
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

const setFilterParams: ISetFilterParams = {
  buttons: ['clear'],
  // excelMode: 'windows',
  // comparator: (a: any, b: any) => {
  //   if (a == null && b == null) return 0;
  //   if (a == null) return -1;
  //   if (b == null) return 1;
  //   return a.toString().localeCompare(b.toString());
  // },
  // valueFormatter: (params: any) => {
  //   // if (params.value == null || params.value === '') {
  //   //   return '(Пусто)';
  //   // }
  //   const cleanValue = params.value
  //     .toString()
  //     .replace(/<br\s*\/?>/gi, ' ')
  //     .replace(/<[^>]*>/g, '')
  //     .replace(/\s+/g, ' ')
  //     .trim();
  //   return cleanValue;
  // },
};

const autoGroupColumnDefProps: ColDef = {
  minWidth: 200,
  pinned: 'left',
  lockPinned: true,
};

const selectionColumnDef: SelectionColumnDef = {
  sortable: true,
  // sort: 'desc',
  resizable: true,
  suppressHeaderMenuButton: false,
  pinned: 'left',
};

export const AgGridTable = forwardRef<HTMLDivElement, IAgGridTableProps>(
  (
    {
      templates,
      isCompared = false,
      columnList,
      rowList,
      error,
      loading,
      handleClickOnActionCell,
      setPage = (v) => v,
      page = 0,
      setTotalRows = (v) => v,
      pageSize = 1000,
      searchString = '',
      onRowDragMove,
      onRowSelected,
      rowDragManaged,
      pagination = true,
      actionPanel = true,
      sidePanel = true,
      onFirstDataRendered,
      onRowDataUpdated,
      onSelectionChanged,
      onRowDragEnd,
      onSortChanged,
      onGridReady,
      pivot = false,
      noCustomCells = false,
      overlayNoRowsTemplate,
    }: IAgGridTableProps,
    ref: any,
  ) => {
    const { setRightPanelType } = useDisplayStore();

    const tableProps = useTableChange({
      rowList,
      setCurrentPage: setPage,
      page,
      updateRowsCount: setTotalRows,
      pageSize,
      searchString,
      columnList,
      templates,
    });

    const { filtersResetCount, setAgGridApi, agGridApi } = useGlobalStore();

    const { setRows, handleChangeColumnsFilter, onChangeTopFilters, topFilters } = tableProps;

    const { filterModel } = useFiltersStore();

    const { modelsCount, modelSource, isDeleteButtonEnabled, userMatches, updateDeleteModelState } =
      useDeleteRightModelPanelStore();

    const { shouldResetTemplateOnInitialValueChange } = useTemplateFilters(
      filterModel,
      templates,
      topFilters?.templates,
    );
    const { isAdmin, isValidatorLead } = useRoles();
    const { isAddModelEnabled } = usePermissions();

    const navigate = useNavigate();
    const gridRefInner = useRef<AgGridReact>(null);
    const gridRef = ref || gridRefInner;

    const columnDefs: ColDef[] = columnList
      .map((data, colIndex) => ({
        ...data,
        headerName: data.title,
        field: data.name,
        headerTooltip: data.title,
        rowDrag: colIndex === 0 && rowDragManaged,
        filter:
          data.type === COLUMN_TYPE.DATE
            ? 'agDateColumnFilter'
            : data.type === COLUMN_TYPE.NUMBER
            ? 'agNumberColumnFilter'
            : 'agSetColumnFilter',
        filterParams: data.type === COLUMN_TYPE.DATE ? dateFilterParams : setFilterParams,
        cellRenderer: data.cellRenderer,
        cellClass: (params) => {
          if (isCompared) {
            const rowIndex = params.node.rowIndex;
            const prevRow = params.api.getDisplayedRowAtIndex(Number(rowIndex) - 1);
            const colId = params.column.getColId();
            const cellValue = params.data[colId];
            const prevRowSameCellValue = prevRow?.data[colId];
            const sameId = params?.data?.id?.split(':')[0] === prevRow?.data?.id?.split(':')[0];

            if (prevRow && sameId && prevRowSameCellValue !== cellValue) {
              return 'ag-custom-cell-value-changed';
            }
          }
        },
      }))
      .filter((col) => col.name !== 'relations') as ColDef[];

    const defaultColDef = useMemo<ColDef>(() => {
      return {
        filter: 'agSetColumnFilter',
        mainMenuItems: (params: GetMainMenuItemsParams) => {
          return params.defaultItems.filter(
            (item) => item !== 'columnChooser' && item !== 'rowGroup',
          );
        },
        cellDataType: false,
        filterParams: setFilterParams,
        floatingFilter: true,
        initialWidth: 400,
        minWidth: 250,
        maxWidth: 1350,
        suppressHeaderMenuButton: false,
        suppressHeaderContextMenu: false,
        enableValue: true,
        enableRowGroup: true,
        enablePivot: pivot,
        flex: 2,
        sortable: true,
        resizable: true,
        wrapHeaderText: false,
        autoHeaderHeight: false,
        editable: false,
        toolTipValueGetter,
        cellRenderer: AgGridTableCustomCell,
        cellRendererParams: {
          noCustomCells,
          onAction: (action: any, row_system_model_id: any, columnName: any): any => {
            handleClickOnActionCell?.(action, row_system_model_id, columnName);
          },
        },
      };
    }, []);

    const rowSelection = useMemo<RowSelectionOptions | 'single' | 'multiple'>(() => {
      return {
        mode: 'multiRow',
        headerCheckbox: true,
        selectAll: 'filtered',
        // rowSelected: (params) => {},
      };
    }, []);

    const onFilterTextBoxChanged = useCallback(() => {
      gridRef.current!.api.setGridOption(
        'quickFilterText',
        (document.getElementById('filter-text-box') as HTMLInputElement).value,
      );
    }, []);

    const paginationPageSizeSelector = useMemo<number[] | boolean>(() => {
      return [20, 100, 200, 500, 1000];
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
      onSelectionChanged?.(event);
      const selectedRows = event.api.getSelectedRows();

      if (selectedRows.length === 1) {
        const selectedRow = selectedRows[0];

        const { model_source, status, id } = selectedRow;

        const _userMatches = isModelCreator(selectedRow) || isInBusinessCustomers(selectedRow);

        updateDeleteModelState(1, model_source, status, id, _userMatches);
      } else {
        updateDeleteModelState(selectedRows.length);
      }
    };

    const { setSortState, setFilterModel } = useFiltersStore();

    const handleSortChanged = (event: SortChangedEvent) => {
      onSortChanged?.(event);

      if (event.source === 'api') return;

      const colState = gridRef.current!.api.getColumnState();
      const sortState = colState
        .filter((s) => {
          return s.sort != null;
        })
        .map((s) => {
          return { colId: s.colId, sort: s.sort, sortIndex: s.sortIndex };
        });
      setSortState(sortState);
    };

    const handleFilterChange = (event: FilterChangedEvent): void => {
      if (event.source === 'api') return;

      const filterModel = event.api.getFilterModel();
      setFilterModel(filterModel);

      const colName: string = event?.columns[0]?.getColId();
      const colDef: any = event.api.getColumnFilterModel(colName);
      const isDate = colDef?.filterType === 'date';

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
        const value = colDef?.filterModels?.[1]?.values || colDef?.values;
        const initialTemplateValue = filterModel?.[colName]?.values || [];

        if (value) {
          const arrayValue = Array.isArray(value) ? value : [value];
          handleChangeColumnsFilter(colName, arrayValue);
          onChangeTopFilters?.({ ...topFilters, templates: [] });
        }
      }
    };

    const clearFilters = () => {
      const api: GridApi | undefined = gridRef.current.api;
      if (api) {
        api?.setFilterModel(null);
        api?.setFilterModel(null);
        api?.setGridOption('quickFilterText', '');
      }
    };

    useEffect(() => {
      if (filtersResetCount) {
        clearFilters();
      }
    }, [filtersResetCount]);

    useDeepEffect(() => {
      if (rowList?.length) {
        setRows(rowList);
        setTotalRows?.(rowList.length);
      }
    }, [rowList, setTotalRows, templates]);

    useDeepEffect(() => {
      if (agGridApi && filterModel) {
          agGridApi.setFilterModel(filterModel);
      }
    }, [agGridApi, filterModel]);

    const rowClassRules = useMemo<RowClassRules>(() => {
      return {
        // row style function
        'ag-row-is-odd': (params) => {
          return params?.rowIndex % 2 === 0;
        },
      };
    }, []);

    const _onGridReady = useCallback((event: GridReadyEvent) => {
      onGridReady?.(event);
      setAgGridApi(event.api);
    }, []);

    const _onFirstDataRendered = useCallback((event: FirstDataRenderedEvent) => {
      onFirstDataRendered?.(event);
    }, []);

    const getContextMenuItems = (params: any) => {
      if (params.column.colId === 'model_alias') {
        return [];
      }
      return params.defaultItems;
    };

    // useDeepEffect(() => {
    //   if (rows.length && initialRowData === undefined) {
    //     setInitialRowData(rows as any);
    //   }
    // }, [JSON.stringify(rows), initialRowData]);

    return (
      <Flexbox height="calc(100vh - 230px)">
        {error ? (
          <StatusWrapper>{error ? <ErrorStatus text={error} /> : null}</StatusWrapper>
        ) : null}
        <div style={containerStyle}>
          {actionPanel && (
            <>
              <Flexbox alignItems="center" justifyContent="space-between">
                <Flexbox
                  width="1000px"
                  fillChild
                  alignItems="center"
                  gap={20}
                  key={filtersResetCount}
                >
                  <InputField
                    id="filter-text-box"
                    onChange={onFilterTextBoxChanged}
                    placeholder="Поиск"
                    icons={<SearchOutline />}
                  />
                </Flexbox>

                <div>
                  {isAddModelEnabled && (
                    <IconButton
                      icon={<PlusCircleSolid />}
                      tooltip="Добавить модель"
                      color="#0062FF"
                      onClick={() => setRightPanelType(RIGHT_PANEL_TYPE.ADD_MODEL)}
                    />
                  )}
                  <IconButton
                    icon={<DeleteSolid />}
                    tooltip={deleteTooltipMessage}
                    color="#0062FF"
                    onClick={() => setRightPanelType(RIGHT_PANEL_TYPE.DELETE_MODEL)}
                    disabled={!isDeleteButtonEnabled}
                  />
                  <IconButton
                    icon={<BrokerOutlineIcon />}
                    tooltip="Графики"
                    onClick={() => navigate('charts')}
                  />
                  {/* <IconButton
                    icon={<ShowTableOutline />}
                    tooltip="Текущий интерфейс таблиц"
                    onClick={() => navigate(ROUTES.MF_HOME_ROUTE)}
                  /> */}
                  <IconButton icon={<MenuOutline />} tooltip="Меню" onClick={() => null} />
                  <IconButton icon={<SettingsOutline />} tooltip="Настройки" onClick={() => null} />
                </div>
              </Flexbox>

              <Spacer space={10} />
            </>
          )}

          <GridWrapper style={gridStyle} className="ag-theme-quartz">
            <AgGridReact
              pagination={pagination}
              rowDragManaged={rowDragManaged}
              ref={gridRef || gridRefInner}
              rowData={rowList}
              columnDefs={columnDefs as any}
              defaultColDef={defaultColDef}
              rowSelection={rowSelection}
              animateRows={false}
              pivotMode={pivot}
              cellSelection
              onGridReady={_onGridReady}
              rowClassRules={isCompared ? rowClassRules : undefined}
              selectionColumnDef={selectionColumnDef}
              autoGroupColumnDef={autoGroupColumnDefProps}
              sideBar={sidePanel ? sideBarProps : undefined}
              onSelectionChanged={handleSelectionChange}
              onFilterChanged={handleFilterChange}
              paginationPageSize={pageSize}
              paginationPageSizeSelector={paginationPageSizeSelector}
              singleClickEdit
              localeText={AG_GRID_LOCALE_RU}
              alwaysShowHorizontalScroll
              tooltipShowDelay={500}
              getContextMenuItems={getContextMenuItems}
              onRowDragMove={onRowDragMove}
              onSortChanged={handleSortChanged}
              onRowSelected={onRowSelected}
              onFirstDataRendered={_onFirstDataRendered}
              onRowDataUpdated={onRowDataUpdated}
              onRowDragEnd={onRowDragEnd}
              loading={loading}
              overlayNoRowsTemplate={overlayNoRowsTemplate}
            />
          </GridWrapper>
        </div>
      </Flexbox>
    );
  },
);

const GridWrapper = styled.div`
  & .ag-column-panel .ag-pivot-mode-panel {
    display: none;
  }

  & .ag-column-panel .ag-unselectable.ag-column-drop {
    display: none;
  }
`;

const StatusWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  padding: 50px 0;
  justify-content: center;
  position: absolute;
  align-items: center;
  z-index: 10;
  background-color: #fffffff0;
  pointer-events: none;
`;

