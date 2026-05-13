/* eslint-disable no-nested-ternary */
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { AgGridReact } from 'ag-grid-react';

import {
  ColDef,
  FilterChangedEvent,
  FirstDataRenderedEvent,
  GetMainMenuItemsParams,
  GridApi,
  GridReadyEvent,
  IRowNode,
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
import { ReactComponent as ArrowsHorizontalOutline } from '@admiral-ds/icons/build/system/ArrowsHorizontalOutline.svg';
import { ReactComponent as SearchOutline } from '@admiral-ds/icons/build/system/SearchOutline.svg';
import { ReactComponent as DeleteSolid } from '@admiral-ds/icons/build/system/DeleteSolid.svg';
import { ReactComponent as CalendarOutline } from '@admiral-ds/icons/build/system/CalendarOutline.svg';
import { InputField, T } from '@admiral-ds/react-ui';
import { ErrorStatus, Flexbox, Spacer, useToast } from '@src/shared/ui/atoms';
import { IconButton } from '@shared/ui/molecules';
import { useNavigate } from 'react-router-dom';
import { Column, COLUMN_TYPE, Row } from '@src/shared/types';
import { Template } from '@src/shared/api/types';
import styled from 'styled-components';
import { debounce, isEmpty } from 'lodash';
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
import { defaultExcelExportParams } from '../../../shared/helpers/excelExportHelpers';
import {
  EMPTY_PARSED_GRID_SEARCH,
  getDisplayedColumnsWithSearchMatches,
  getParsedGridSearchForHighlight,
  isCellMatched,
  parseGridSearchQuery,
  setParsedGridSearchForHighlight,
  type SearchMatchColumn,
} from '../../../shared/helpers/highlightHelpers';

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
  cellHeight: 42,
  cellRenderer: (props) => {
    const text = props.value === null ? '(Пустые)' : props.value || '';
    const maxLength = 80;
    const truncatedText = text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          lineHeight: '18px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
          minWidth: 0,
        }}
        title={text}
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
    const { filtersResetCount, setAgGridApi, agGridApi, searchString, setSearchString } =
      useGlobalStore();
    const { filterModel, topFilters, setTopFilters, setFilterModel, setColumnsFilters } =
      useFiltersStore();
    const { setPendingTemplate } = useTemplatesStore();

    const { modelsCount, modelSource, isDeleteButtonEnabled, userMatches, updateDeleteModelState } =
      useDeleteRightModelPanelStore();
    const { isAdmin, isValidatorLead } = useRoles();
    const { isAddModelEnabled } = usePermissions();
    const { showToast } = useToast();

    useEffect(() => {
      if (error) {
        showToast({
          message: `Ошибка загрузки моделей`,
          type: 'error',
          duration: 5000,
        });
      }
    }, [error, showToast]);

    const navigate = useNavigate();
    const gridRefInner = useRef<AgGridReact>(null);
    const gridRef = ref || gridRefInner;
    /** Синхронный доступ к api без гонки с ref AgGridReact (нужен для скролла после закрытия дропдауна). */
    const gridApiRef = useRef<GridApi | null>(null);
    const [activeRows, setActiveRows] = useState<Partial<Row>[]>([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const searchBeforeDatePickerRef = useRef<string>('');
    const lastUserColumnStateRef = useRef<any[] | null>(null);
    const suppressTemplateResetRef = useRef(false);
    const [searchColumnMatches, setSearchColumnMatches] = useState<SearchMatchColumn[]>([]);
    const [searchColumnMatchesOpen, setSearchColumnMatchesOpen] = useState(false);
    const searchColumnMatchesHostRef = useRef<HTMLDivElement>(null);

    const dataColumnNames = useMemo(
      () => columnList.map((c) => c.name as string),
      [columnList],
    );

    const columnHeadersForSearch = useMemo(
      () => columnList.map((c) => ({ colId: c.name as string, headerName: c.title })),
      [columnList],
    );

    const applySearchToGrid = useCallback(
      (searchValue: string) => {
        const parsed = parseGridSearchQuery(searchValue, columnHeadersForSearch);
        setParsedGridSearchForHighlight({
          raw: searchValue,
          valueQuery: parsed.valueQuery,
          columnColId: parsed.columnColId,
          columnHeaderOnly: parsed.columnHeaderOnly,
        });
        const api = gridApiRef.current ?? gridRef.current?.api;
        const quickText = parsed.columnHeaderOnly ? '' : parsed.valueQuery;
        api?.setGridOption('quickFilterText', quickText);
        setTimeout(() => {
          api?.refreshClientSideRowModel('filter');
          api?.refreshCells({ force: true });
          api?.refreshHeader();
        }, 0);
      },
      [columnHeadersForSearch],
    );

    const columnDefs: ColDef[] = useMemo(() => {
      return columnList
        .map((data, colIndex) => {
          const effectiveColumnType =
            data.name === 'remove_date_validation' ? COLUMN_TYPE.STRING : data.type;

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
            type: effectiveColumnType,
            headerName: data.title,
            field: data.name,
            headerTooltip: data.title,
            rowDrag: colIndex === 0 && rowDragManaged,
            filter:
              effectiveColumnType === COLUMN_TYPE.DATE
                ? 'agDateColumnFilter'
                : effectiveColumnType === COLUMN_TYPE.NUMBER
                ? 'agNumberColumnFilter'
                : 'agSetColumnFilter',
            filterParams:
              effectiveColumnType === COLUMN_TYPE.DATE ? dateFilterParams : dynamicSetFilterParams,
            cellRenderer: data.cellRenderer,
            headerClass: (params) => {
              const p = getParsedGridSearchForHighlight();
              if (p.columnColId && params.column.getColId() === p.columnColId) {
                return 'search-highlight-column-header';
              }
              return '';
            },
            cellClass: (params) => {
              const classes: string[] = [];

              if (isCompared) {
                const rowIndex = params.node.rowIndex;
                const prevRow = params.api.getDisplayedRowAtIndex(Number(rowIndex) - 1);
                const colId = params.column.getColId();
                const cellValue = params.data[colId];
                const prevRowSameCellValue = prevRow?.data[colId];
                const sameId = params?.data?.id?.split(':')[0] === prevRow?.data?.id?.split(':')[0];

                if (prevRow && sameId && prevRowSameCellValue !== cellValue) {
                  classes.push('ag-custom-cell-value-changed');
                }
              } else {
                classes.push(`data-tech-label_${data.name}`);
              }

              const p = getParsedGridSearchForHighlight();
              if (!p.columnHeaderOnly) {
                const effective =
                  (p.valueQuery || '').trim() || (p.raw || '').trim();
                const colId = params.column.getColId();
                if (
                  effective &&
                  (!p.columnColId || colId === p.columnColId) &&
                  isCellMatched(params.value, effective)
                ) {
                  classes.push('search-highlight-cell');
                }
              }

              return classes.length > 0 ? classes.join(' ') : undefined;
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
    }, [handleClickOnActionCellFromProps, noCustomCells, pivot]);

    const rowSelection = useMemo<RowSelectionOptions | 'single' | 'multiple'>(() => {
      return {
        mode: 'multiRow',
        headerCheckbox: true,
        selectAll: 'filtered',
        // rowSelected: (params) => {},
      };
    }, []);

    const debouncedSetSearchString = useMemo(() => {
      return debounce((searchValue: string) => {
        setSearchString(searchValue);
      }, 700);
    }, [setSearchString]);

    useEffect(() => {
      return () => {
        debouncedSetSearchString.cancel();
      };
    }, [debouncedSetSearchString]);

    const onFilterTextBoxChanged = useCallback(
      (e: any) => {
        const searchValue =
          e?.target?.value ??
          (document.getElementById('filter-text-box') as HTMLInputElement | null)?.value ??
          '';
        applySearchToGrid(searchValue);
        debouncedSetSearchString(searchValue);
      },
      [applySearchToGrid, debouncedSetSearchString],
    );

    const handleDateSelect = useCallback((date: Date) => {
      if (!date || Number.isNaN(date.getTime())) return;
      setSelectedDate(date);
    }, []);

    const formatDateToYYYYMMDD = useCallback((date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }, []);

    const handleApplyDatePicker = useCallback(() => {
      if (!selectedDate) return;

      const formattedDate = formatDateToYYYYMMDD(selectedDate);
      const searchInput = document.getElementById('filter-text-box') as HTMLInputElement;

      if (searchInput) {
        searchInput.value = formattedDate;
      }

      setSearchString(formattedDate);
      applySearchToGrid(formattedDate);
      setShowDatePicker(false);
    }, [applySearchToGrid, formatDateToYYYYMMDD, selectedDate, setSearchString]);

    const handleCancelDatePicker = useCallback(() => {
      const searchInput = document.getElementById('filter-text-box') as HTMLInputElement;

      if (searchInput) {
        searchInput.value = searchBeforeDatePickerRef.current;
      }

      setSelectedDate(null);
      setShowDatePicker(false);
    }, []);

    const handleToggleDatePicker = useCallback(() => {
      if (showDatePicker) {
        handleCancelDatePicker();
        return;
      }

      const searchInput = document.getElementById('filter-text-box') as HTMLInputElement;
      const currentValue = searchInput?.value ?? searchString ?? '';
      searchBeforeDatePickerRef.current = currentValue;

      if (/^\d{4}-\d{2}-\d{2}$/.test(currentValue)) {
        const parsed = new Date(currentValue);
        setSelectedDate(Number.isNaN(parsed.getTime()) ? null : parsed);
      } else {
        setSelectedDate(null);
      }

      setShowDatePicker(true);
    }, [handleCancelDatePicker, searchString, showDatePicker]);

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
      //  setPendingTemplate(updatedTemplate as any);
      // }
    };

    const handleColumnMoved = (event: ColumnMovedEvent) => {
      if (event.source === 'api') return;
      if (event.source !== 'uiColumnDragged' && event.source !== 'toolPanelUi') return;

      // * Если есть изменение порядка столбцов (главная талица, панель шаблонов после сохранения pending шаблона), то шаблон сбрасывается до "Шаблон не активен"
      setTopFilters?.({ ...topFilters, templates: [] });
      lastUserColumnStateRef.current = event.api.getColumnState();

      handleColumnStateChange();
    };

    useEffect(() => {
      if (!agGridApi) return;
      if (filterModel && Object.keys(filterModel).length > 0) {
        agGridApi.setFilterModel(filterModel);
      }
      if (lastUserColumnStateRef.current?.length) {
        agGridApi.applyColumnState({
          state: lastUserColumnStateRef.current,
          applyOrder: true,
        });
      }
    }, [agGridApi, columnDefs, filterModel]);

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
      if (event.source === 'quickFilter') return;

      const filterModelPending = event.api.getFilterModel();
      const hasSameFilterModel = JSON.stringify(filterModelPending) === JSON.stringify(filterModel);

      if (hasSameFilterModel) {
        if (suppressTemplateResetRef.current) {
          suppressTemplateResetRef.current = false;
        }
        return;
      }

      const colName: string | undefined = event?.columns?.[0]?.getColId();

      setFilterModel(filterModelPending);

      // Convert filterModel to columnsFilters format and update the store
      const newColumnsFilters = convertFilterModelToColumnsFilters(filterModelPending);
      setColumnsFilters(newColumnsFilters);

      if (suppressTemplateResetRef.current && topFilters?.templates?.length) {
        suppressTemplateResetRef.current = false;
        return;
      }

      if (suppressTemplateResetRef.current) {
        suppressTemplateResetRef.current = false;
      }

      if (!colName) {
        return;
      }

      const filterModelCountPending = Object.keys(filterModelPending).length;
      const filterModelCount = Object.keys(currentTemplate?.filterModel || {}).length;
      const colDef: any = colName ? event.api.getColumnFilterModel(colName) : undefined;
      const isDate = colDef?.filterType === 'date';
      // @ts-ignore
      const currentTempleteFilterVals = currentTemplate?.filterModel?.[colName]?.values;

      const wasInitialyFiltered = colName in (currentTemplate?.filterModel || {});

      const hasNewColInFilter = filterModelCountPending > filterModelCount;
      const hasSameColNumberInFilter = filterModelCountPending === filterModelCount;
      const hasRemovedColInFilter = filterModelCountPending < filterModelCount;
      const hasChangesInFilter =
        JSON.stringify(filterModelPending) !== JSON.stringify(currentTemplate?.filterModel || {});

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

      // * Если я удаляю атрибут из набора фильтра (в таблице или после применения шаблона через панель фильтров), который входит в шаблон, то шаблон сбрасывается до "Шаблон не активен"
      if (hasRemovedColInFilter) {
        console.log('🐸 Pepe said -- 3.');
        setTopFilters?.({ ...topFilters, templates: [] });
        setPendingTemplate?.(undefined);
        return undefined;
      }

      // * Если я добавляю сортировку/фильтрацию на атрибут в шаблоне, на котором уже есть сортировка или фильтрация, шаблон сбрасывается до "Шаблон не активен"
      if (wasInitialyFiltered && hasChangesInFilter) {
        console.log('🐸 Pepe said -- 4.');
        setTopFilters?.({ ...topFilters, templates: [] });
        setPendingTemplate?.(undefined);
        return undefined;
      }
      console.log('🐸 Pepe said -- 5.');
    };

    const clearFilters = () => {
      const api: GridApi | undefined = gridApiRef.current ?? gridRef.current?.api;
      if (api) {
        api?.setFilterModel(null);
        setParsedGridSearchForHighlight(EMPTY_PARSED_GRID_SEARCH);
        api?.setGridOption('quickFilterText', '');
        setSearchString('');
        setTimeout(() => {
          api?.refreshClientSideRowModel('filter');
          api?.refreshCells({ force: true });
          api?.refreshHeader();
        }, 0);
        api?.redrawRows();
      }
    };

    useEffect(() => {
      if (filtersResetCount) {
        clearFilters();
      }
    }, [filtersResetCount, setSearchString]);

    // Sync search input with global store
    useEffect(() => {
      const searchInput = document.getElementById('filter-text-box') as HTMLInputElement;
      if (searchInput && searchInput.value !== searchString) {
        searchInput.value = searchString;
      }
    }, [searchString]);

    useEffect(() => {
      const api = gridApiRef.current ?? gridRef.current?.api ?? agGridApi;
      if (!api) {
        return;
      }
      const q = searchString?.trim();
      if (!q) {
        setSearchColumnMatches([]);
        return;
      }
      const t = window.setTimeout(() => {
        setSearchColumnMatches(
          getDisplayedColumnsWithSearchMatches(
            api,
            searchString,
            dataColumnNames,
            columnHeadersForSearch,
          ),
        );
      }, 0);
      return () => window.clearTimeout(t);
    }, [
      agGridApi,
      dataColumnNames,
      filterModel,
      filtersResetCount,
      rowList,
      searchString,
      columnHeadersForSearch,
    ]);

    const handleSearchColumnClick = useCallback(
      (colId: string) => {
        setSearchColumnMatchesOpen(false);
        const scrollToColumnAndFirstMatch = () => {
          const api = gridApiRef.current ?? gridRef.current?.api ?? agGridApi;
          if (!api) {
            return;
          }
          const p = getParsedGridSearchForHighlight();
          api.ensureColumnVisible(colId, 'middle');
          if (p.columnHeaderOnly) {
            return;
          }
          const effective = (p.valueQuery || '').trim() || (p.raw || '').trim();
          if (!effective) {
            return;
          }
          let first: IRowNode | undefined;
          api.forEachNodeAfterFilter((node) => {
            if (first || !node.data) {
              return;
            }
            if (isCellMatched(node.data[colId], effective)) {
              first = node;
            }
          });
          if (!first) {
            return;
          }
          const rowIndex = first.rowIndex;
          if (typeof rowIndex === 'number' && rowIndex >= 0) {
            api.ensureIndexVisible(rowIndex, 'middle');
          } else {
            api.ensureNodeVisible(first, 'middle');
          }
        };
        // После setState (закрытие дропдауна) даём React/гриду отрисоваться, иначе скролл часто не применяется.
        window.setTimeout(() => {
          requestAnimationFrame(scrollToColumnAndFirstMatch);
        }, 0);
      },
      [agGridApi],
    );

    const isExternalFilterPresent = useCallback(
      () => {
        const p = getParsedGridSearchForHighlight();
        return Boolean(
          p.columnColId && !p.columnHeaderOnly && (p.valueQuery || '').trim(),
        );
      },
      [],
    );

    const doesExternalFilterPass = useCallback((node: IRowNode) => {
      const p = getParsedGridSearchForHighlight();
      if (!p.columnColId || p.columnHeaderOnly) {
        return true;
      }
      const effective = (p.valueQuery || '').trim() || (p.raw || '').trim();
      if (!effective) {
        return true;
      }
      return isCellMatched(node.data?.[p.columnColId], effective);
    }, []);

    useEffect(() => {
      const hasDropdown =
        searchColumnMatchesOpen &&
        searchColumnMatches.length > 0 &&
        Boolean(searchString?.trim());
      if (!hasDropdown) {
        return;
      }

      const handleMouseDown = (event: MouseEvent) => {
        const host = searchColumnMatchesHostRef.current;
        if (!host) {
          return;
        }
        const target = event.target as Node | null;
        if (target && host.contains(target)) {
          return;
        }
        setSearchColumnMatchesOpen(false);
      };

      document.addEventListener('mousedown', handleMouseDown);
      return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [
      searchColumnMatchesOpen,
      searchColumnMatches.length,
      searchString,
    ]);

    // Close date picker when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (showDatePicker) {
          const target = event.target as Element;
          const datePickerElement = target.closest('[data-date-picker]');
          if (!datePickerElement) {
            handleCancelDatePicker();
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [handleCancelDatePicker, showDatePicker]);

    useDeepEffect(() => {
      if (rowList?.length) {
        setTotalRows?.(rowList.length);
      }
    }, [rowList, setTotalRows]);

    useEffect(() => {
      suppressTemplateResetRef.current = true;
    }, [rowList]);

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

    const _onGridReady = useCallback(
      (event: GridReadyEvent) => {
        gridApiRef.current = event.api;
        onGridReady?.(event);
        setAgGridApi(event.api);
        const searchInput = document.getElementById('filter-text-box') as HTMLInputElement | null;
        const v = searchInput?.value ?? useGlobalStore.getState().searchString ?? '';
        if (v.trim()) {
          applySearchToGrid(v);
        }
      },
      [onGridReady, applySearchToGrid],
    );

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

    const quickFilterParser = (quickFilter: string) => quickFilter.split('🐸');

    const searchColumnPickerTitle =
      'Показать список колонок, в которых есть совпадения с текстом поиска. Выберите колонку — таблица прокрутится к колонке и к первой строке с совпадением. Можно указать колонку в конце строки поиска по началу её заголовка (например: «текст подразделение вла» для колонки «Подразделение владельца»).';

    const canShowSearchColumnPicker =
      searchColumnMatches.length > 0 && Boolean(searchString?.trim());

    const handleToggleSearchColumnMatches = useCallback(
      (event: ReactMouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!canShowSearchColumnPicker) {
          return;
        }
        setSearchColumnMatchesOpen((open) => !open);
      },
      [canShowSearchColumnPicker],
    );

    return (
      <Flexbox height="calc(100vh - 220px)">
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
                  <div
                    ref={searchColumnMatchesHostRef}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      flex: 1,
                      width: '555px',
                    }}
                  >
                    <InputField
                      id="filter-text-box"
                      onChange={onFilterTextBoxChanged}
                      defaultValue={searchString}
                      placeholder="Поиск"
                      style={{
                        width: '555px',
                      }}
                      dimension="s"
                      icons={
                        <>
                          <button
                            type="button"
                            title={searchColumnPickerTitle}
                            aria-label={searchColumnPickerTitle}
                            aria-expanded={searchColumnMatchesOpen}
                            aria-haspopup="listbox"
                            aria-controls="ag-grid-search-column-matches"
                            disabled={!canShowSearchColumnPicker}
                            onClick={handleToggleSearchColumnMatches}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: 0,
                              padding: 0,
                              border: 'none',
                              background: 'transparent',
                              cursor: canShowSearchColumnPicker ? 'pointer' : 'not-allowed',
                              opacity: canShowSearchColumnPicker ? 1 : 0.4,
                              color: 'inherit',
                            }}
                          >
                            <ArrowsHorizontalOutline width={20} height={20} />
                          </button>
                          <SearchOutline />
                        </>
                      }
                    />
                    {searchColumnMatchesOpen &&
                    searchColumnMatches.length > 0 &&
                    searchString.trim() ? (
                      <div
                        id="ag-grid-search-column-matches"
                        role="listbox"
                        aria-label="Колонки с совпадениями по поиску"
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 4px)',
                          left: 0,
                          width: '100%',
                          maxHeight: 220,
                          overflowY: 'auto',
                          zIndex: 1000,
                          background: '#fff',
                          border: '1px solid #d0d7de',
                          borderRadius: 4,
                          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                          padding: '8px 0',
                        }}
                      >
                        <div style={{ padding: '0 12px 6px' }}>
                          <T font="Caption/Caption 1" color="Neutral/Neutral 50">
                            Найдено в колонках
                          </T>
                        </div>
                        {searchColumnMatches.map(({ colId, headerName }) => (
                          <button
                            key={colId}
                            type="button"
                            role="option"
                            aria-selected
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSearchColumnClick(colId)}
                            style={{
                              display: 'block',
                              width: '100%',
                              textAlign: 'left',
                              border: 'none',
                              background: 'transparent',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontSize: 13,
                              lineHeight: '18px',
                            }}
                          >
                            {headerName}
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {/* {showDatePicker && (
                      <div
                        data-date-picker
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: '0',
                          zIndex: 1000,
                          background: 'white',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          padding: '8px',
                          marginTop: '4px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                      >
                        <input
                          type="date"
                          value={selectedDate ? formatDateToYYYYMMDD(selectedDate) : ''}
                          onChange={(e) => {
                            const date = new Date(e.target.value);
                            handleDateSelect(date);
                          }}
                          style={{
                            border: 'none',
                            outline: 'none',
                            fontSize: '14px',
                          }}
                        />

                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            marginTop: '8px',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <button
                            type="button"
                            onClick={handleCancelDatePicker}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '4px',
                              border: '1px solid #ccc',
                              background: 'white',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            Отменить
                          </button>
                          <button
                            type="button"
                            onClick={handleApplyDatePicker}
                            disabled={!selectedDate}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '4px',
                              border: '1px solid #0062FF',
                              background: '#0062FF',
                              color: 'white',
                              cursor: selectedDate ? 'pointer' : 'not-allowed',
                              fontSize: '12px',
                              opacity: selectedDate ? 1 : 0.5,
                            }}
                          >
                            Применить
                          </button>
                        </div>
                      </div>
                    )} */}
                  </div>
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
              quickFilterParser={quickFilterParser}
              isExternalFilterPresent={isExternalFilterPresent}
              doesExternalFilterPass={doesExternalFilterPass}
              maintainColumnOrder
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

  /* Search highlighting styles */
  & .search-highlight {
    background-color: #ffeb3b;
    color: #000;
    padding: 1px 2px;
    border-radius: 2px;
    font-weight: 500;
  }

  & .search-highlight-cell {
    background-color: #fff8e1;
    border: 1px solid #ffeb3b;
  }

  & .search-highlight-column-header {
    background-color: #fff8e1;
    box-shadow: inset 0 -2px 0 #ffeb3b;
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

