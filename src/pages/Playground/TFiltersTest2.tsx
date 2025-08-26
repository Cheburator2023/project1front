/* eslint-disable react/button-has-type */
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import { create } from 'zustand';
import { Button, Modal, Select, Option, IconButton, ModalTitle } from '@admiral-ds/react-ui';
import { ReactComponent as FilterOutline } from '@admiral-ds/icons/build/system/FilterOutline.svg';
import { ReactComponent as CheckOutline } from '@admiral-ds/icons/build/service/CheckOutline.svg';

import { ReactComponent as DeleteOutline } from '@admiral-ds/icons/build/system/DeleteOutline.svg';
import {
  BadgeCount,
  ButtonCustom,
  CheckSolidCustom,
  FilterOutlineCustom,
} from '../../entities/FilterButtonCount/style';
import { useFiltersStore } from '../../shared/stores';
import { getActiveFiltersCount } from '../../shared/helpers';
import { useTableModels } from '../Home/hooks';
import { useTemplateFilters } from '../../shared/hooks';
import { Spacer } from '../../shared/ui/atoms';

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

interface TemplateConfig {
  id: string;
  name: string;
  filterModel: FilterModel;
  sortState: SortState;
}

interface TemplateStore {
  templates: TemplateConfig[];
  activeTemplate: TemplateConfig | null;
  addTemplate: (template: TemplateConfig) => void;
  updateTemplate: (template: TemplateConfig) => void;
  setActiveTemplate: (template: TemplateConfig | null) => void;
  clearActiveTemplate: () => void;
}

const useTemplateStore = create<TemplateStore>((set) => ({
  templates: [
    {
      id: '1',
      name: 'Шаблон 1',
      filterModel: {
        'Фильтр по статусу': {
          values: ['Активный', 'Неактивный'],
          filterType: 'set',
        },
      },
      sortState: [
        {
          colId: 'Фильтр по статусу',
          sort: 'asc',
          sortIndex: 0,
        },
      ],
    },
    {
      id: '2',
      name: 'Шаблон 2',
      filterModel: {
        date: {
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31',
          filterType: 'date',
          type: 'inRange',
        },
      },
      sortState: [
        {
          colId: 'date',
          sort: 'desc',
          sortIndex: 0,
        },
      ],
    },
  ],
  activeTemplate: null,
  addTemplate: (template) => set((state) => ({ templates: [...state.templates, template] })),
  updateTemplate: (template) =>
    set((state) => ({
      templates: state.templates.map((t) => (t.id === template.id ? template : t)),
    })),
  setActiveTemplate: (template) => set({ activeTemplate: template }),
  clearActiveTemplate: () => set({ activeTemplate: null }),
}));

interface FilterItem {
  id: string;
  name: string;
  type: string;
  value: string;
  active: boolean;
}

interface TemplateFilterGridProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: TemplateConfig) => void;
  defaultActiveTemplateId?: string;
  staticFilters?: FilterItem[];
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

        setRowData((prevData: any[]) =>
          prevData.map((row) =>
            row.id === params.data.id ? { ...row, active: e.target.checked } : row,
          ),
        );
        handleFilterChange();
      }}
    />
  );
});

CheckboxRenderer.displayName = 'CheckboxRenderer';

export const TemplateFilterGrid: React.FC<TemplateFilterGridProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultActiveTemplateId,
  staticFilters,
}) => {
  const {
    templates,
    activeTemplate,
    addTemplate,
    updateTemplate,
    setActiveTemplate,
    clearActiveTemplate,
  } = useTemplateStore();
  const {
    topFilters,
    modelsDownloadingDate,
    setModelsDownloadingDate,
    setTopFilters,
    setFirstDate,
    setSecondDate,
    resetFilters,
    filterModel,
  } = useFiltersStore();

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);
  const [isCustomTemplate, setIsCustomTemplate] = useState(false);

  const defaultFilters: FilterItem[] = [
    {
      id: '1',
      name: 'Фильтр по статусу',
      type: 'Список',
      value: 'Активный, Неактивный',
      active: false,
    },
    {
      id: '2',
      name: 'Фильтр по дате создания',
      type: 'Дата',
      value: '2024-01-01 - 2024-12-31',
      active: false,
    },
    { id: '3', name: 'Фильтр по названию', type: 'Текст', value: 'содержит "тест"', active: false },
    {
      id: '4',
      name: 'Фильтр по категории',
      type: 'Список',
      value: 'Категория А, Категория Б',
      active: false,
    },
    { id: '5', name: 'Фильтр по приоритету', type: 'Число', value: '> 5', active: false },
    {
      id: '6',
      name: 'Фильтр по автору',
      type: 'Список',
      value: 'Иванов, Петров, Сидоров',
      active: false,
    },
    {
      id: '7',
      name: 'Фильтр по региону',
      type: 'Список',
      value: 'Москва, СПб, Екатеринбург',
      active: false,
    },
    { id: '8', name: 'Фильтр по сумме', type: 'Число', value: '1000 - 50000', active: false },
  ];

  const [rowData, setRowData] = useState<FilterItem[]>(staticFilters || defaultFilters);

  const [isInitialized, setIsInitialized] = useState(false);
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  const onGridReady = useCallback((params: any) => {
    setGridApi(params.api);
  }, []);

  useEffect(() => {
    if (defaultActiveTemplateId && !isInitialized) {
      const defaultTemplate = templates.find((t) => t.id === defaultActiveTemplateId);
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate);
        setActiveTemplate(defaultTemplate);
        setIsInitialized(true);
      }
    } else if (activeTemplate && !isInitialized && !defaultActiveTemplateId) {
      setSelectedTemplate(activeTemplate);
      setIsInitialized(true);
    }
  }, [activeTemplate, isInitialized, defaultActiveTemplateId, templates, setActiveTemplate]);

  useEffect(() => {
    if (staticFilters) {
      setRowData(staticFilters);
    }
  }, [staticFilters]);

  useEffect(() => {
    if (gridApi && selectedTemplate) {
      gridApi.setFilterModel(selectedTemplate.filterModel);

      if (selectedTemplate.sortState.length > 0) {
        gridApi.applyColumnState({
          state: selectedTemplate.sortState,
          defaultState: { sort: null },
        });
      } else {
        gridApi.applyColumnState({
          defaultState: { sort: null },
        });
      }

      // Применяем активные фильтры из шаблона к rowData
      setRowData((currentRowData) =>
        currentRowData.map((row) => {
          const isActiveInTemplate = Object.keys(selectedTemplate.filterModel).some((filterKey) => {
            const filter = selectedTemplate.filterModel[filterKey];
            // Сопоставляем по типу фильтра
            if (filter.filterType === 'set' && row.type === 'Список') {
              return true;
            }
            if (filter.filterType === 'date' && row.type === 'Дата') {
              return true;
            }
            if (filter.filterType === 'text' && row.type === 'Текст') {
              return true;
            }
            if (filter.filterType === 'number' && row.type === 'Число') {
              return true;
            }
            return false;
          });
          return { ...row, active: isActiveInTemplate };
        }),
      );
    }
  }, [gridApi, selectedTemplate]);

  const columnDefs: ColDef[] = [
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
      width: 100,
      filter: 'agSetColumnFilter',
      sortable: true,
      cellRenderer: CheckboxRenderer,
    },
    {
      headerName: 'Название фильтра',
      field: 'name',
      flex: 1,
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Значение',
      field: 'value',
      flex: 1,
      filter: 'agTextColumnFilter',
      sortable: true,
    },
  ];

  const handleTemplateChange = useCallback(
    (templateId: string) => {
      if (templateId === '') {
        setSelectedTemplate(null);
        clearActiveTemplate();
        setIsInitialized(false);
        setIsCustomTemplate(false);
        // Сбрасываем все чекбоксы при очистке шаблона
        setRowData((currentRowData) => currentRowData.map((row) => ({ ...row, active: false })));
        return;
      }

      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        setActiveTemplate(template);
        setIsInitialized(false);
        setIsCustomTemplate(false);
      }
    },
    [templates, setActiveTemplate, clearActiveTemplate],
  );

  const handleFilterChange = useCallback(() => {
    if (selectedTemplate && !isCustomTemplate) {
      setSelectedTemplate(null);
      setIsCustomTemplate(true);
    }
  }, [selectedTemplate, isCustomTemplate]);

  const handleRowDragEnd = useCallback(
    (event: any) => {
      const newRowData: any[] = [];
      gridApi?.forEachNode((node) => {
        if (node.data) {
          newRowData.push(node.data);
        }
      });
      setRowData(newRowData);
      handleFilterChange();
      console.log('Новый порядок строк:', newRowData);
    },
    [gridApi, handleFilterChange],
  );

  const handleSave = useCallback(() => {
    if (gridApi) {
      const activeFilters = rowData.filter((row) => row.active);

      const filterModel: FilterModel = {};
      activeFilters.forEach((filter) => {
        if (filter.type === 'Список') {
          filterModel[filter.name] = {
            values: filter.value.split(', '),
            filterType: 'set',
          };
        } else if (filter.type === 'Дата') {
          const dates = filter.value.split(' - ');
          filterModel[filter.name] = {
            dateFrom: dates[0],
            dateTo: dates[1],
            filterType: 'date',
            type: 'inRange',
          };
        } else if (filter.type === 'Текст') {
          filterModel[filter.name] = {
            filter: filter.value,
            filterType: 'text',
            type: 'contains',
          };
        } else if (filter.type === 'Число') {
          filterModel[filter.name] = {
            filter: filter.value,
            filterType: 'number',
          };
        }
      });

      const sortState: SortState = [];
      gridApi.forEachNode((node, index) => {
        if (node.data) {
          sortState.push({
            colId: node.data.name,
            sort: 'asc',
            sortIndex: index,
          });
        }
      });

      let templateToSave;
      if (selectedTemplate) {
        templateToSave = {
          ...selectedTemplate,
          filterModel,
          sortState,
        };
        updateTemplate(templateToSave);
      } else {
        templateToSave = {
          id: `custom-${Date.now()}`,
          name: `Новый шаблон ${new Date().toLocaleString()}`,
          filterModel,
          sortState,
        };
        // addTemplate(templateToSave);
        // setSelectedTemplate(templateToSave);
      }

      setActiveTemplate(templateToSave);
      setIsCustomTemplate(false);
      onSave(templateToSave);
      console.log('Сохранен шаблон:', templateToSave);

      onClose();
    }
  }, [
    selectedTemplate,
    gridApi,
    rowData,
    updateTemplate,
    addTemplate,
    setActiveTemplate,
    setIsCustomTemplate,
    onSave,
    onClose,
  ]);

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
    setRowData(staticFilters || defaultFilters);
    // setRowData((currentRowData) => currentRowData.map((row) => ({ ...row, active: false })));
  }, [gridApi]);

  if (!isOpen) return null;

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
        <div style={{ marginBottom: '20px' }}>
          <Select
            value={selectedTemplate?.id || ''}
            onChange={(e) => handleTemplateChange(e.target.value)}
            placeholder=""
          >
            <Option value="">Новый шаблон</Option>
            {templates.map((template) => (
              <Option key={template.id} value={template.id}>
                {template.name}
              </Option>
            ))}
          </Select>
        </div>

        <div
          style={{
            flex: 1,
          }}
        >
          <div className="ag-theme-quartz" style={{ height: '100%', width: '100%' }}>
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              onGridReady={onGridReady}
              context={{ setRowData, handleFilterChange }}
              onRowDragEnd={handleRowDragEnd}
              getRowId={(params) => params.data.id}
              rowDragManaged
              animateRows
              suppressRowClickSelection
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

const getButtonApperance = (hasTemplates: boolean) => {
  return hasTemplates ? 'primary' : 'white';
};

const getBadgeApperance = (hasTemplates: boolean, hasActiveFilters: boolean) => {
  return hasTemplates && hasActiveFilters ? 'info' : 'white';
};

export const TFiltersTest2 = () => {
  const {
    topFilters,
    modelsDownloadingDate,
    setModelsDownloadingDate,
    setTopFilters,
    setFirstDate,
    setSecondDate,
    resetFilters,
    filterModel,
  } = useFiltersStore();

  const { filters } = useTableModels();

  const templates = filters?.templates;

  const { isModifiedFilter } = useTemplateFilters(filterModel, templates, topFilters.templates);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = useCallback((template: TemplateConfig) => {}, []);

  const activeFiltersCount = useMemo(
    () => getActiveFiltersCount(filterModel, templates, topFilters.templates[0]),
    [filterModel, templates, topFilters.templates],
  );

  const hasTemplates = topFilters.templates.length > 0;
  const hasActiveFilters = activeFiltersCount > 0;
  const hasNoActiveFilters = activeFiltersCount === 0;

  const buttonAppearance = getButtonApperance(hasTemplates);
  const badgeAppearance = getBadgeApperance(hasTemplates, hasActiveFilters);

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
      <TemplateFilterGrid
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        defaultActiveTemplateId={undefined}
        staticFilters={undefined}
      />
    </div>
  );
};

