/* eslint-disable no-nested-ternary */
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';

import {
  ColDef,
  FilterChangedEvent,
  FirstDataRenderedEvent,
  GetMainMenuItemsParams,
  GridApi,
  GridReadyEvent,
  IDateFilterParams,
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
  ColumnMovedEvent,
} from 'ag-grid-community';
import { ReactComponent as BrokerOutlineIcon } from '@admiral-ds/icons/build/finance/BrokerOutline.svg';
import { ReactComponent as PlusCircleSolid } from '@admiral-ds/icons/build/service/PlusCircleSolid.svg';
import { ReactComponent as SearchOutline } from '@admiral-ds/icons/build/system/SearchOutline.svg';
import { ReactComponent as DeleteSolid } from '@admiral-ds/icons/build/system/DeleteSolid.svg';
import { InputField } from '@admiral-ds/react-ui';
import { ErrorStatus, Flexbox, Spacer } from '@src/shared/ui/atoms';
import { IconButton } from '@shared/ui/molecules';
import { useNavigate } from 'react-router-dom';
import { Column, COLUMN_TYPE, Row } from '@src/shared/types';
import { Template } from '@src/shared/api/types';
import styled from 'styled-components';
import { isEmpty } from 'lodash';
import { AgGridTableCustomCell } from '../molecules/AgGridTableCustomCell';
import { AG_GRID_LOCALE_RU } from '../../../app/agGridLocale.ru';
import { useDeleteRightModelPanelStore, usePanelsStore } from '../../../shared/stores';
import { usePermissions, useRoles } from '../../../shared/hooks';
import { isInBusinessCustomers, isModelCreator } from '../../../shared/helpers';
import { useDeepEffect } from '../../../shared/hooks/useDeepEffect';
import { useGlobalStore } from '../../../shared/stores/globalStore';
import { useFiltersStore } from '../../../shared/stores/filtersStore';
import { useTemplatesStore } from '../../../shared/stores/templatesStore';
import { convertFilterModelToColumnsFilters } from '../../../shared/helpers/filterModelConverter';
import { defaultExcelExportParams } from '../../../shared/helpers/excelExportHelpers'

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
  refreshValuesOnOpen: true,
  cellHeight: 30,
  cellRenderer: (props) => {
    console.log('🐸 Pepe said >> props:', props);

    const text = props.value === null ? '(Пустые)' : props.value || '';
    const maxLength = 80; // Fallback character limit
    const truncatedText = text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

    return (
      <div
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
          minWidth: 0, // Ensures flex shrinking works
        }}
        title={text} // Tooltip shows full text on hover
      >
        {truncatedText}
      </div>
    );
  },
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
      setTotalRows = (v) => v,
      handleClickOnActionCell,
      pageSize = 1000,
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
    const { openAddModelPanel, openDeleteModelPanel } = usePanelsStore();
    const handleClickOnActionCellFromProps = handleClickOnActionCell || (() => {});
    const { filtersResetCount, setAgGridApi, agGridApi } = useGlobalStore();
    const { filterModel, topFilters, setTopFilters, setFilterModel, setColumnsFilters } =
      useFiltersStore();
    const { setPendingTemplate } = useTemplatesStore();

    const { modelsCount, modelSource, isDeleteButtonEnabled, userMatches, updateDeleteModelState } =
      useDeleteRightModelPanelStore();
    const { isAdmin, isValidatorLead } = useRoles();
    const { isAddModelEnabled } = usePermissions();

    const navigate = useNavigate();
    const gridRefInner = useRef<AgGridReact>(null);
    const gridRef = ref || gridRefInner;
    const [activeRows, setActiveRows] = useState<Partial<Row>[]>([]);

    const columnDefs: ColDef[] = useMemo(() => {
      return columnList
        .map((data, colIndex) => {
          const dynamicSetFilterParams = {
            ...setFilterParams,
            valueFormatter: (params: any) => {
              if (params.value === '(Пустые значения)') {
                return '(Пустые значения)';
              }
              if (params.value === '(Непустые значения)') {
                return '(Непустые значения)';
              }
              return params.value;
            },
            ...(data.name === 'group_company' && {
              comparator: (a: string, b: string) => {
                const priorityValue = 'Банк ВТБ (ПАО)';

                // Handle null/undefined values - empty values come first
                if (!a && !b) return 0;
                if (!a && b === priorityValue) return -1; // empty before priority
                if (!a) return -1; // empty before other values
                if (!b && a === priorityValue) return 1; // priority after empty
                if (!b) return 1; // other values after empty

                if (a === priorityValue && b !== priorityValue) return -1;
                if (a !== priorityValue && b === priorityValue) return 1;
                return a.localeCompare(b, 'ru');
              },
            }),
          };

          return {
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
            filterParams:
              data.type === COLUMN_TYPE.DATE ? dateFilterParams : dynamicSetFilterParams,
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
              } else {
                return `data-tech-label_${data.name}`;
              }
            },
          };
        })
        .filter((col) => col.name !== 'relations') as ColDef[];
    }, [columnList, rowDragManaged, isCompared]);

    const defaultColDef = useMemo<ColDef>(() => {
      return {
        filter: 'agSetColumnFilter',
        mainMenuItems: (params: GetMainMenuItemsParams) => {
          return params.defaultItems.filter(
            (item) => item !== 'columnChooser' && item !== 'rowGroup',
          );
        },
        cellDataType: false,
        filterParams: {
          ...setFilterParams,
          valueFormatter: (params: any) => {
            if (params.value === '(Пустые значения)') {
              return '(Пустые значения)';
            }
            if (params.value === '(Непустые значения)') {
              return '(Непустые значения)';
            }
            return params.value;
          },
          predicate: (filterValues: string[], cellValue: any) => {
            if (!filterValues || filterValues.length === 0) {
              return true;
            }

            const hasEmptyFilter = filterValues.includes('(Пустые значения)');
            const hasNonEmptyFilter = filterValues.includes('(Непустые значения)');
            const isEmptyCell = cellValue == null || cellValue === '';
            const isNonEmptyCell = !isEmptyCell;
            const specificFilters = filterValues.filter(
              (v) => v !== '(Пустые значения)' && v !== '(Непустые значения)',
            );

            let matchesEmpty = false;
            let matchesNonEmpty = false;
            let matchesSpecific = false;

            if (hasEmptyFilter && isEmptyCell) {
              matchesEmpty = true;
            }

            if (hasNonEmptyFilter && isNonEmptyCell) {
              matchesNonEmpty = true;
            }

            if (specificFilters.length > 0 && specificFilters.includes(cellValue)) {
              matchesSpecific = true;
            }

            return matchesEmpty || matchesNonEmpty || matchesSpecific;
          },
        },
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
            handleClickOnActionCellFromProps?.(action, row_system_model_id, columnName);
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
      setActiveRows(selectedRows as Partial<Row>[]);

      const selectedRow: Partial<Row> = selectedRows[0];

      const { model_source, status, system_model_id } = selectedRow || {};

      if (selectedRows.length === 1) {
        const _userMatches =
          process.env.NO_ROLES === 'true' ||
          isModelCreator(selectedRow) ||
          isInBusinessCustomers(selectedRow);

        updateDeleteModelState(1, model_source, status, system_model_id, _userMatches);
      } else {
        updateDeleteModelState(selectedRows.length);
      }
    };

    const handleColumnStateChange = () => {
      // if (agGridApi) {
      //   const columnState = agGridApi.getColumnState();
      //   const updatedTemplate = {
      //     ...pendingTemplate,
      //     columnState,
      //   };
      //   console.log('🐸 Pepe said >> handleColumnStateChange >> updatedTemplate:', updatedTemplate);
      //   setPendingTemplate(updatedTemplate as any);
      // }
    };

    const handleColumnMoved = (event: ColumnMovedEvent) => {
      if (event.source === 'api') return;

      // * Если есть изменение порядка столбцов (главная талица, панель шаблонов после сохранения pending шаблона), то шаблон сбрасывается до “Шаблон не активен”
      setTopFilters?.({ ...topFilters, templates: [] });

      handleColumnStateChange();
    };

    const handleSortChanged = (event: SortChangedEvent) => {
      // // Проверяем, нужно ли сбросить активный шаблон при изменении сортировки
      // // Используем setTimeout чтобы дать AgGrid время обновить состояние
      // setTimeout(() => {
      //   if (shouldResetActiveTemplate?.()) {
      //     setTopFilters?.({ ...topFilters, templates: [] });
      //     setPendingTemplate?.(undefined);
      //   }
      // }, 0);

      // Вызываем внешний обработчик, если он передан
      onSortChanged?.(event);
    };

    const currentTemplate = templates?.find(
      ({ template_id }) => String(template_id) === topFilters?.templates?.[0],
    );

    const handleFilterChange = async (event: FilterChangedEvent): Promise<void> => {
      if (event.source === 'api') return;

      const filterModelPending = event.api.getFilterModel();
      const filterModelCountPending = Object.keys(filterModelPending).length;
      const filterModelCount = Object.keys(currentTemplate?.filterModel || {}).length;
      const colName: string = event?.columns[0]?.getColId();
      const colDef: any = event.api.getColumnFilterModel(colName);
      const isDate = colDef?.filterType === 'date';
      // @ts-ignore
      const currentTempleteFilterVals = currentTemplate?.filterModel?.[colName]?.values;
      const allColDataFromRows = rowList.map((row) => row[colName]);
      const isColDefaultNonFiltered =
        JSON.stringify(allColDataFromRows) === JSON.stringify(currentTempleteFilterVals) ||
        isEmpty(currentTempleteFilterVals);

      const wasInitialyFiltered =
        !isColDefaultNonFiltered && colName in (currentTemplate?.filterModel || {});

      const hasNewColInFilter = filterModelCountPending > filterModelCount;
      const hasSameColNumberInFilter = filterModelCountPending === filterModelCount;
      const hasRemovedColInFilter = filterModelCountPending < filterModelCount;
      const hasChangesInFilter =
        JSON.stringify(filterModelPending) !== JSON.stringify(currentTemplate?.filterModel || {});

      setFilterModel(filterModelPending);

      // Convert filterModel to columnsFilters format and update the store
      const newColumnsFilters = convertFilterModelToColumnsFilters(filterModelPending);
      setColumnsFilters(newColumnsFilters);

      // * Если я добавляю новый атрибут в набор фильтра, то шаблон остается активным
      if (hasNewColInFilter) {
        console.log('🐸 Pepe said -- 1.');
        return undefined;
      }

      // * Если я добавляю сортирвоку/фильтрацию на атрибут (колонку) в шаблоне, на котором нет сортировки или фильтрации, то шаблон не сбрасывается. То есть расширение шаблона не сбрасывает шаблон
      if (!currentTempleteFilterVals && hasSameColNumberInFilter) {
        console.log('🐸 Pepe said -- 2.');
        return undefined;
      }

      // * Если я удаляю атрибут из набора фильтра (в таблице или после применения шаблона через панель фильтров), который входит в шаблон, то шаблон сбрасывается до “Шаблон не активен”
      if (hasRemovedColInFilter) {
        console.log('🐸 Pepe said -- 3.');
        setTopFilters?.({ ...topFilters, templates: [] });
        setPendingTemplate?.(undefined);
        return undefined;
      }

      // * Если я добавляю сортировку/фильтрацию на атрибут в шаблоне, на котором уже есть сортировка или фильтрация, шаблон сбрасывается до “Шаблон не активен”
      if (wasInitialyFiltered && hasChangesInFilter) {
        console.log('🐸 Pepe said -- 4.');
        setTopFilters?.({ ...topFilters, templates: [] });
        setPendingTemplate?.(undefined);
        return undefined;
      }
      console.log('🐸 Pepe said -- 5.');
    };

    const clearFilters = () => {
      const api: GridApi | undefined = gridRef.current.api;
      if (api) {
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
        setTotalRows?.(rowList.length);
      }
    }, [rowList, setTotalRows]);

    useDeepEffect(() => {
      if (agGridApi && templates && topFilters?.templates?.[0]) {
        const activeTemplate = templates.find(
          (t) => String(t.template_id) === topFilters.templates[0],
        );

        agGridApi.setFilterModel(filterModel);

        if (activeTemplate?.columnState) {
          agGridApi.applyColumnState({
            state: activeTemplate.columnState,
            defaultState: { hide: true },
            applyOrder: true,
          });
        }
      }
    }, [agGridApi, templates, topFilters]);

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
      if (params?.column?.colId === 'model_alias') {
        return [];
      }
      return params.defaultItems;
    };

    const _onRowDragEnd = (e) => {
      onRowDragEnd?.(e);
    };

    return (
      <Flexbox height="calc(100vh - 220px)">
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
                    dimension="s"
                    icons={<SearchOutline />}
                  />
                </Flexbox>

                <div>
                  {isAddModelEnabled && (
                    <IconButton
                      icon={<PlusCircleSolid />}
                      tooltip="Добавить модель"
                      color="#0062FF"
                      onClick={() => openAddModelPanel()}
                    />
                  )}
                  <IconButton
                    icon={<DeleteSolid />}
                    tooltip={deleteTooltipMessage}
                    color="#0062FF"
                    onClick={() => {
                      return openDeleteModelPanel(activeRows);
                    }}
                    disabled={!isDeleteButtonEnabled}
                  />
                  <IconButton
                    icon={<BrokerOutlineIcon />}
                    tooltip="Графики"
                    onClick={() => navigate('charts')}
                  />
                  {/* <IconButton icon={<MenuOutline />} tooltip="Меню" onClick={() => null} /> */}
                  {/* <IconButton icon={<SettingsOutline />} tooltip="Настройки" onClick={() => null} /> */}
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
              animateRows
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
              localeText={AG_GRID_LOCALE_RU}
              alwaysShowHorizontalScroll
              tooltipShowDelay={500}
              getContextMenuItems={getContextMenuItems}
              onRowDragMove={onRowDragMove}
              onSortChanged={handleSortChanged}
              onRowSelected={onRowSelected}
              onFirstDataRendered={_onFirstDataRendered}
              onRowDataUpdated={onRowDataUpdated}
              onRowDragEnd={_onRowDragEnd}
              onColumnMoved={handleColumnMoved}
              loading={loading}
              overlayNoRowsTemplate={overlayNoRowsTemplate}
              defaultExcelExportParams={defaultExcelExportParams}
            />
          </GridWrapper>
        </div>
      </Flexbox>
    );
  },
);

const GridWrapper = styled('div')`
  & .ag-column-panel .ag-pivot-mode-panel {
    display: none;
  }

  & .ag-column-panel .ag-unselectable.ag-column-drop {
    display: none;
  }

  & .ag-popup {
  }
`;

const StatusWrapper = styled('div')`
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

