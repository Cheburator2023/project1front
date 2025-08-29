import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import { Button, Modal, Select, Option, ModalTitle } from '@admiral-ds/react-ui';
import { ReactComponent as CheckOutline } from '@admiral-ds/icons/build/service/CheckOutline.svg';
import { ReactComponent as DeleteOutline } from '@admiral-ds/icons/build/system/DeleteOutline.svg';
import { isEmpty } from 'lodash';
import { format, parse } from 'date-fns/esm';
import {
  BadgeCount,
  ButtonCustom,
  CheckSolidCustom,
  FilterOutlineCustom,
} from '../../entities/FilterButtonCount/style';
import { useFiltersStore, useTemplatesStore } from '../../shared/stores';
import { useGlobalStore } from '../../shared/stores/globalStore';
import { getActiveFiltersCount } from '../../shared/helpers';
import { useTableModels } from '../Home/hooks';
import { Spacer } from '../../shared/ui/atoms';
import { initialColumns } from '../../shared/constants';
import { Template } from '../../shared/api';
import { COLUMN_TYPE } from '../../shared/types';
import { AG_GRID_LOCALE_RU } from './locale/agGridLocale.ru';
import { DateSelect } from '../../shared/ui/organisms/DateSelect';
import { SearchSelect } from '../../shared/ui/organisms/SearchSelect/SearchSelect';
import { SELECT_TYPE } from '../../shared/ui/organisms/SearchSelect/types';
import { useDeepEffect } from '../../shared/hooks/useDeepEffect';

type SetFilter = {
  values: (string | null)[];
  filterType: string;
};

type DateFilter = {
  dateFrom: string;
  dateTo: string;
  filterType: string;
  type: string;
};

type FilterModel = {
  [key: string]: SetFilter | DateFilter | any;
};

type SortState = Array<{
  colId: string;
  sort: 'asc' | 'desc';
  sortIndex: number;
}>;

interface FilterItem {
  id: string;
  name: string;
  type: string;
  value: string;
  active: boolean;
}

interface TemplateFilterGridProps {
  onClose: () => void;
  onSave?: (template: any) => void;
}

const DragHandleRenderer = React.memo(() => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      cursor: 'grab',
    }}
  >
    ⋮⋮
  </div>
));

DragHandleRenderer.displayName = 'DragHandleRenderer';

const CheckboxRenderer = React.memo((params: any) => {
  const { setRowData, handleFilterChange } = params.context;

  return (
    <input
      type="checkbox"
      checked={params.value}
      onChange={(e) => {
        params.setValue(e.target.checked);
        setRowData((prevData: any[]) => {
          const updatedData = prevData.map((row) =>
            row.id === params.data.id ? { ...row, active: e.target.checked } : row,
          );
          handleFilterChange(updatedData);
          return updatedData;
        });
      }}
    />
  );
});

const SelectAllHeaderRenderer = React.memo((params: any) => {
  const { setRowData, handleFilterChange } = params.context;
  const [allSelected, setAllSelected] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);

  useEffect(() => {
    const updateSelectAllState = () => {
      const allRows: any[] = [];
      params.api.forEachNode((node: any) => allRows.push(node.data));

      const selectedCount = allRows.filter((row: any) => row.active).length;
      const totalCount = allRows.length;

      setAllSelected(selectedCount === totalCount && totalCount > 0);
      setIndeterminate(selectedCount > 0 && selectedCount < totalCount);
    };

    updateSelectAllState();

    const listener = () => updateSelectAllState();
    params.api.addEventListener('cellValueChanged', listener);
    params.api.addEventListener('rowDataUpdated', listener);

    return () => {
      params.api.removeEventListener('cellValueChanged', listener);
      params.api.removeEventListener('rowDataUpdated', listener);
    };
  }, [params.api]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;

    setRowData((currentRowData: any[]) =>
      currentRowData.map((row: any) => ({ ...row, active: newValue })),
    );

    params.api.forEachNode((node: any) => {
      node.data.active = newValue;
    });

    params.api.refreshCells({ force: true });
    handleFilterChange();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <input
        type="checkbox"
        checked={allSelected}
        ref={(input) => {
          if (input) input.indeterminate = indeterminate;
        }}
        onChange={handleSelectAll}
        style={{
          accentColor: '#0062FF',
          cursor: 'pointer',
        }}
      />
      <span>Выбран</span>
    </div>
  );
});

CheckboxRenderer.displayName = 'CheckboxRenderer';

const ValueRenderer = React.memo((params: any) => {
  const { data, value, api, context } = params;

  const isDateType = data.type === 'date';
  const { rowList } = context || {};

  const handleValueChange = (newValue: string[] | string) => {
    const isActive = !isEmpty(newValue) && !newValue.includes('_') && newValue !== ' - ';
    const updatedData = { ...data, value: newValue, active: isActive };
    const rowNode = api.getRowNode(data.id);
    if (rowNode) {
      rowNode.setData(updatedData);
    }
  };

  if (isDateType) {
    const dateRange =
      value
        ?.replaceAll(' 00:00:00', '')
        .split(' - ')
        .map((dateStr) => new Date(dateStr).toLocaleDateString('ru')) || [];

    return (
      <DateSelect
        value={dateRange}
        initType={dateRange.length > 1 ? 'range' : 'single'}
        onChange={(dateValue) => {
          handleValueChange(dateValue || []);
        }}
      />
    );
  }

  const getOptionsForColumn = () => {
    if (!rowList || !Array.isArray(rowList) || !data.colId) {
      return [];
    }

    const uniqueValues = new Set();
    rowList.forEach((row: any) => {
      const cellValue = row[data.colId];
      if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
        uniqueValues.add(String(cellValue));
      }
    });

    return Array.from(uniqueValues).map((val: any) => ({
      value: val,
      label: val,
    }));
  };

  const currentValues = value ? value.map((v: string) => v.trim()).filter(Boolean) : [];

  const uniqueValues = getOptionsForColumn();
  const options = {
    type: SELECT_TYPE.STRING as any,
    options: uniqueValues.map((val) => ({ value: String(val.value), text: String(val.value) })),
  };

  return (
    <SearchSelect
      name={data.name}
      options={options}
      selectedValues={currentValues}
      onChange={(name, selectValue) => {
        handleValueChange(selectValue);
      }}
    />
  );
});

ValueRenderer.displayName = 'ValueRenderer';

export const TemplateFilterGrid: React.FC<TemplateFilterGridProps> = ({ onClose, onSave }) => {
  const { templates, setTemplates, pendingTemplate, setPendingTemplate } = useTemplatesStore();
  const { modelsTable } = useTableModels();
  const { rowList } = modelsTable;
  const { topFilters, setFilterModel, setSortState } = useFiltersStore();
  const defaultActiveTemplateId = topFilters.templates?.[0];
  const { agGridApi: agGridApiGlobal } = useGlobalStore();

  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isCustomTemplate, setIsCustomTemplate] = useState(false);

  const defaultFilters: FilterItem[] = useMemo(() => {
    return initialColumns.map((column, index) => {
      // Получаем значения из selectedTemplate.filterModel если они есть
      const templateFilter = selectedTemplate?.filterModel?.[column.name];
      let value;

      if (templateFilter) {
        if ('values' in templateFilter && templateFilter.values) {
          // Для set фильтров - объединяем values через запятую
          value = templateFilter.values.filter((v) => v !== null);
        } else if ('dateFrom' in templateFilter && 'dateTo' in templateFilter) {
          // Для date фильтров - формируем диапазон дат
          if (templateFilter.dateTo) {
            value = `${templateFilter.dateFrom} - ${templateFilter.dateTo}`;
          } else {
            value = templateFilter.dateFrom;
          }
        }
      }

      return {
        id: String(index + 1),
        colId: column.name,
        name: column.title,
        type: column.type === COLUMN_TYPE.DATE ? 'date' : 'set',
        value,
        active: selectedTemplate ? !!templateFilter : true,
      };
    });
  }, [selectedTemplate]);

  const [rowData, setRowData] = useState<FilterItem[]>(defaultFilters);

  const [isInitialized, setIsInitialized] = useState(false);
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  const onGridReady = useCallback((params: any) => {
    setGridApi(params.api);
  }, []);

  useDeepEffect(() => {
    if (pendingTemplate && !isInitialized) {
      const updatedRowData = initialColumns.map((column, index) => {
        const templateFilter = pendingTemplate?.filterModel?.[column.name] as any;
        let value = '';

        if (templateFilter) {
          if (column.type === COLUMN_TYPE.STRING) {
            value = templateFilter.values || [];
          } else if (column.type === COLUMN_TYPE.DATE) {
            if (templateFilter.dateTo) {
              value = `${templateFilter.dateFrom} - ${templateFilter.dateTo}`;
            } else {
              value = templateFilter.dateFrom;
            }
          }
        }

        return {
          id: String(index + 1),
          colId: column.name,
          name: column.title,
          type: column.type === COLUMN_TYPE.DATE ? 'date' : 'set',
          value,
          active: !!templateFilter,
        };
      });

      setRowData(updatedRowData);
      setSelectedTemplate(pendingTemplate);
      setActiveTemplate(pendingTemplate);
      setIsInitialized(true);
    } else if (defaultActiveTemplateId && !isInitialized) {
      const defaultTemplate = templates.find(
        (t) => String(t.template_id) === defaultActiveTemplateId,
      );

      if (defaultTemplate) {
        const updatedRowData = initialColumns.map((column, index) => {
          const templateFilter = defaultTemplate.filterModel?.[column.name] as any;
          let value = '';

          if (templateFilter) {
            if (column.type === COLUMN_TYPE.STRING) {
              value = templateFilter.values || [];
            } else if (column.type === COLUMN_TYPE.DATE) {
              if (templateFilter.dateTo) {
                value = `${templateFilter.dateFrom} - ${templateFilter.dateTo}`;
              } else {
                value = templateFilter.dateFrom;
              }
            }
          }

          return {
            id: String(index + 1),
            colId: column.name,
            name: column.title,
            type: column.type === COLUMN_TYPE.DATE ? 'date' : 'set',
            value,
            active: !!templateFilter,
          };
        });

        setRowData(updatedRowData);
        setSelectedTemplate(defaultTemplate);
        setActiveTemplate(defaultTemplate);
        setIsInitialized(true);
      }
    } else if (activeTemplate && !isInitialized && !defaultActiveTemplateId && !pendingTemplate) {
      const updatedRowData = initialColumns.map((column, index) => {
        const templateFilter = activeTemplate.filterModel?.[column.name] as any;
        let value = '';

        if (templateFilter) {
          if (column.type === COLUMN_TYPE.STRING) {
            value = templateFilter.values || [];
          } else if (column.type === COLUMN_TYPE.DATE) {
            if (templateFilter.dateTo) {
              value = `${templateFilter.dateFrom} - ${templateFilter.dateTo}`;
            } else {
              value = templateFilter.dateFrom;
            }
          }
        }

        return {
          id: String(index + 1),
          colId: column.name,
          name: column.title,
          type: column.type === COLUMN_TYPE.DATE ? 'date' : 'set',
          value,
          active: !!templateFilter,
        };
      });

      setRowData(updatedRowData);
      setSelectedTemplate(activeTemplate);
      setIsInitialized(true);
    }
  }, [
    activeTemplate,
    isInitialized,
    defaultActiveTemplateId,
    templates,
    setActiveTemplate,
    pendingTemplate,
  ]);

  const prevTemplateRef = useRef<Template | null>(null);

  useEffect(() => {
    if (gridApi && selectedTemplate && selectedTemplate !== prevTemplateRef.current) {
      prevTemplateRef.current = selectedTemplate;
      gridApi.setFilterModel(selectedTemplate.filterModel || null);

      if (selectedTemplate.sortState && selectedTemplate.sortState.length > 0) {
        gridApi.applyColumnState({
          state: selectedTemplate.sortState,
          defaultState: { sort: null },
        });
      } else {
        gridApi.applyColumnState({
          defaultState: { sort: null },
        });
      }

      // Всегда сохраняем текущие активные значения и добавляем новые из шаблона
      setRowData((currentRowData) =>
        currentRowData.map((row) => {
          const isActiveInTemplate = selectedTemplate.filterModel
            ? Object.keys(selectedTemplate.filterModel).some((filterKey) => {
                const matchingColumn = initialColumns.find((col) => col.name === filterKey);
                if (!matchingColumn) return false;
                return matchingColumn.title === row.name;
              })
            : false;
          // Сохраняем текущее состояние active или устанавливаем из шаблона
          return { ...row, active: row.active || isActiveInTemplate };
        }),
      );
    }
  }, [gridApi, selectedTemplate]);

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: '',
        field: 'drag',
        width: 50,
        rowDrag: true,
        suppressMenu: true,
        sortable: false,
        filter: false,
        cellRenderer: DragHandleRenderer,
      },
      {
        headerName: 'Выбран',
        field: 'active',
        width: 130,
        filter: 'agSetColumnFilter',
        sortable: false,
        cellRenderer: CheckboxRenderer,
        headerComponent: SelectAllHeaderRenderer,
      },
      {
        headerName: 'Название фильтра',
        field: 'name',
        flex: 1,
        filter: 'agTextColumnFilter',
        sortable: false,
      },
      {
        headerName: 'Значение',
        field: 'value',
        flex: 1,
        filter: 'agTextColumnFilter',
        sortable: false,
        cellRenderer: ValueRenderer,
        editable: true,
      },
    ],
    [],
  );

  const handleTemplateChange = useCallback(
    (value: string) => {
      if (value === '') {
        setSelectedTemplate(null);
        prevTemplateRef.current = null;
        setActiveTemplate(null);
        setIsInitialized(false);
        setIsCustomTemplate(false);
        setRowData((currentRowData) => currentRowData.map((row) => ({ ...row, active: true })));
        return;
      }

      let template = templates.find((t) => String(t.template_id) === value);

      if (!template && pendingTemplate && String(pendingTemplate?.template_id) === value) {
        template = pendingTemplate;
      }

      if (template) {
        const updatedRowData = initialColumns.map((column, index) => {
          const templateFilter = template.filterModel?.[column.name] as any;
          let value = '';

          if (templateFilter) {
            if (column.type === COLUMN_TYPE.STRING) {
              value = templateFilter.values || [];
            } else if (column.type === COLUMN_TYPE.DATE) {
              if (templateFilter.dateTo) {
                value = `${templateFilter.dateFrom} - ${templateFilter.dateTo}`;
              } else {
                value = templateFilter.dateFrom;
              }
            }
          }

          return {
            id: String(index + 1),
            colId: column.name,
            name: column.title,
            type: column.type === COLUMN_TYPE.DATE ? 'date' : 'set',
            value,
            active: !!templateFilter,
          };
        });

        setRowData(updatedRowData);
        setSelectedTemplate(template);
        setActiveTemplate(template);
        setIsInitialized(false);
        setIsCustomTemplate(false);
      }
    },
    [templates, setActiveTemplate, initialColumns, pendingTemplate],
  );

  const handleFilterChange = useCallback(
    (currentRowData?: any[]) => {
      if (selectedTemplate && !isCustomTemplate) {
        // Если это pending шаблон, обновляем его данные
        if (
          selectedTemplate.isPending ||
          (pendingTemplate && selectedTemplate.template_id === pendingTemplate.template_id)
        ) {
          // Для pending шаблона просто помечаем как кастомный, но не сбрасываем selectedTemplate
          setIsCustomTemplate(true);
        } else {
          // Сохраняем текущие активные состояния перед сбросом шаблона
          if (currentRowData) {
            const activeStates = currentRowData.reduce((acc, row) => {
              acc[row.id] = row.active;
              return acc;
            }, {} as Record<string, boolean>);

            // Применяем сохраненные состояния после сброса шаблона
            setTimeout(() => {
              setRowData((prevData) =>
                prevData.map((row) => ({
                  ...row,
                  active: activeStates[row.id] ?? row.active,
                })),
              );
            }, 0);
          }

          setSelectedTemplate(null);
          prevTemplateRef.current = null;
          setIsCustomTemplate(true);
        }
      }
    },
    [selectedTemplate, isCustomTemplate, setRowData, pendingTemplate],
  );

  const handleRowDragEnd = useCallback(() => {
    const newRowData: any[] = [];
    gridApi?.forEachNode((node) => {
      if (node.data) {
        newRowData.push(node.data);
      }
    });
    setRowData(newRowData);
    handleFilterChange();
  }, [gridApi, handleFilterChange]);

  const handleSave = () => {
    if (gridApi) {
      const _rowData: any = [];
      gridApi.forEachNode((node) => {
        _rowData.push(node.data);
      });

      const activeFilters = _rowData.filter((row) => row.active);

      const filterModel: FilterModel = {};
      activeFilters.forEach((filter) => {
        // Находим соответствующую колонку в initialColumns по имени фильтра
        const matchingColumn = initialColumns.find((col) => col.title === filter.name);
        if (!matchingColumn) return;

        function convertRuDateToISO(ruDate) {
          try {
            // Parse the Russian date format (dd.MM.yyyy)
            const date = parse(ruDate, 'dd.MM.yyyy', new Date());

            // Check if the parsed date is valid
            if (Number.isNaN(date.getTime())) {
              console.error(`Invalid date: ${ruDate}`);
            }

            // Format to ISO date string (yyyy-MM-dd)
            return format(date, 'yyyy-MM-dd');
          } catch (error: any) {
            console.error(`Failed to convert date "${ruDate}": ${error?.message}`);
          }
        }

        const columnId = matchingColumn.name;

        if (filter.type === 'date') {
          console.log('🐸 Pepe said >> handleSave >> filter.value:', filter.value);

          if (filter.value) {
            filterModel[columnId] = {
              dateFrom: convertRuDateToISO(filter.value[0]),
              dateTo: convertRuDateToISO(filter.value[1]),
              filterType: 'date',
              type: filter.value[1] ? 'inRange' : 'equals',
            };
          } else {
            filterModel[columnId] = {
              dateFrom: null,
              dateTo: null,
              filterType: 'date',
              type: 'inRange',
            };
          }
        } else {
          // Все остальные типы используют set фильтр
          filterModel[columnId] = {
            values: filter.value,
            filterType: 'set',
          };
        }
      });

      const sortState: SortState = [];
      const columnState: any[] = [];

      gridApi.forEachNode((node, index) => {
        if (node.data) {
          // Находим соответствующую колонку в initialColumns по имени фильтра
          const matchingColumn = initialColumns.find((col) => col.title === node.data.name);

          if (matchingColumn) {
            sortState.push({
              colId: matchingColumn.name,
              sort: 'asc',
              sortIndex: index,
            });

            columnState.push({
              colId: matchingColumn.name,
              hide: !node.data.active,
              sort: null,
              sortIndex: null,
            });
          }
        }
      });

      let templateToSave;
      if (
        selectedTemplate &&
        templates.some((t) => t.template_id === selectedTemplate.template_id)
      ) {
        templateToSave = {
          ...selectedTemplate,
          filterModel,
          sortState,
          columnState,
        };
        setTemplates((prev) =>
          prev.map((t) => (t.template_id === selectedTemplate.template_id ? templateToSave : t)),
        );
      } else {
        templateToSave = {
          template_id: Date.now(),
          template_name: `Новый шаблон ${new Date().toLocaleString()}`,
          filterModel,
          sortState,
          columnState,
          isPending: true,
        };
        setPendingTemplate(templateToSave);
      }

      if (agGridApiGlobal) {
        setTimeout(() => {
          agGridApiGlobal.setFilterModel(filterModel);
          agGridApiGlobal.applyColumnState({ state: columnState, applyOrder: true });
        }, 300);
      }

      setFilterModel(filterModel);
      setSortState(sortState);
      console.log('🐸 Pepe said >> handleSave >> templateToSave:', templateToSave);
      setActiveTemplate(templateToSave);

      setIsCustomTemplate(false);

      // Обновляем topFilters с новым активным шаблоном
      const { setTopFilters } = useFiltersStore.getState();
      setTopFilters({ ...topFilters, templates: [String(templateToSave.template_id)] });

      onSave?.(templateToSave);

      onClose();
    }
  };

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleClearFilters = useCallback(() => {
    if (gridApi) {
      gridApi.setFilterModel(null);
      gridApi.applyColumnState({
        defaultState: { sort: null },
      });
    }
    handleFilterChange();
    setRowData(defaultFilters);
    setSelectedTemplate(null);
    setActiveTemplate(null);
    setPendingTemplate(undefined);
    setIsCustomTemplate(false);
  }, [gridApi, handleFilterChange, defaultFilters, setPendingTemplate]);

  return (
    <Modal
      onClose={onClose}
      style={{
        width: '90%',
        height: '90%',
      }}
      closeOnEscapeKeyDown
      closeOnOutsideClick
      title="Настройка фильтров и сортировки"
    >
      <ModalTitle>Настройка шаблона фильтров и сортировки</ModalTitle>
      <div
        style={{
          padding: '24px',
          paddingBottom: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Select
          value={selectedTemplate ? String(selectedTemplate.template_id) : ''}
          onChange={(e) => handleTemplateChange(e.target.value)}
          placeholder=""
        >
          <Option value="">Новый шаблон</Option>

          {pendingTemplate && (
            <Option key={pendingTemplate.template_id} value={String(pendingTemplate.template_id)}>
              {pendingTemplate.template_name} (не сохранен)
            </Option>
          )}

          {templates.map((template) => (
            <Option key={template.template_id} value={String(template.template_id)}>
              {template.template_name}
            </Option>
          ))}
        </Select>

        <Spacer />

        <div
          style={{
            flex: 1,
          }}
        >
          <div className="ag-theme-quartz" style={{ height: '100%', width: '100%' }}>
            <AgGridReact
              ref={gridRef}
              localeText={AG_GRID_LOCALE_RU}
              rowData={rowData}
              columnDefs={columnDefs}
              onGridReady={onGridReady}
              context={{ setRowData, handleFilterChange, rowList }}
              onRowDragEnd={handleRowDragEnd}
              getRowId={(params) => params.data.id}
              rowDragManaged
              animateRows
              suppressRowClickSelection
              suppressContextMenu
              headerHeight={40}
              rowHeight={40}
              defaultColDef={{
                resizable: true,
                suppressMovable: true,
                filter: true,
                sortable: true,
              }}
            />
          </div>
        </div>

        <Spacer />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button onClick={handleClearFilters} appearance="ghost" dimension="s">
            <DeleteOutline />
            Очистить фильтры
          </Button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button onClick={handleCancel} appearance="secondary" dimension="s">
              Отмена
            </Button>
            <Button onClick={handleSave} appearance="primary" dimension="s">
              <CheckOutline />
              Сохранить
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export const TFiltersTest2 = () => {
  const { topFilters, filterModel } = useFiltersStore();
  const { filters } = useTableModels();
  const filterTemplates = filters?.templates;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeFiltersCount = useMemo(
    () => getActiveFiltersCount(filterModel, filterTemplates, topFilters.templates[0]),
    [filterModel, filterTemplates, topFilters.templates],
  );

  const hasTemplates = topFilters.templates.length > 0;
  const hasActiveFilters = activeFiltersCount > 0;
  const hasNoActiveFilters = activeFiltersCount === 0;

  const buttonAppearance = hasTemplates ? 'primary' : 'white';
  const badgeAppearance = hasTemplates && hasActiveFilters ? 'info' : 'white';

  return (
    <div style={{ position: 'relative' }}>
      <ButtonCustom
        appearance={buttonAppearance}
        dimension="s"
        icon={<FilterOutlineCustom appearance={buttonAppearance} />}
        displayAsSquare
        onClick={() => setIsModalOpen(true)}
      />

      {hasTemplates && hasNoActiveFilters ? (
        <CheckSolidCustom />
      ) : (
        <BadgeCount appearance={badgeAppearance} dimension="s">
          {activeFiltersCount}
        </BadgeCount>
      )}
      {isModalOpen && <TemplateFilterGrid onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

