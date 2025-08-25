import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import { create } from 'zustand';
import { Button, Modal, Select, Option } from '@admiral-ds/react-ui';
import { ReactComponent as FilterOutline } from '@admiral-ds/icons/build/system/FilterOutline.svg';
import { ReactComponent as CheckOutline } from '@admiral-ds/icons/build/service/CheckOutline.svg';

import { ReactComponent as DeleteOutline } from '@admiral-ds/icons/build/system/DeleteOutline.svg';

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
        name: {
          values: ['Активный', 'Неактивный'],
          filterType: 'set',
        },
      },
      sortState: [
        {
          colId: 'name',
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

interface TemplateFilterGridProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: TemplateConfig) => void;
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
  const { setRowData } = params.context;

  return (
    <input
      type="checkbox"
      checked={params.value}
      onChange={(e) => {
        params.setValue(e.target.checked);

        setRowData((prevData: any[]) =>
          prevData.map(row =>
            row.id === params.data.id
              ? { ...row, active: e.target.checked }
              : row
          )
        );
      }}
    />
  );
});

CheckboxRenderer.displayName = 'CheckboxRenderer';

export const TemplateFilterGrid: React.FC<TemplateFilterGridProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const {
    templates,
    activeTemplate,
    addTemplate,
    updateTemplate,
    setActiveTemplate,
    clearActiveTemplate,
  } = useTemplateStore();


  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);
  const [rowData, setRowData] = useState([
    {
      id: '1',
      name: 'Фильтр по статусу',
      type: 'set',
      value: 'Активный, Неактивный',
      active: true,
    },
    {
      id: '2',
      name: 'Фильтр по дате создания',
      type: 'date',
      value: '2024-01-01 - 2024-12-31',
      active: true,
    },
    { id: '3', name: 'Фильтр по названию', type: 'set', value: 'содержит "тест"', active: false },
    {
      id: '4',
      name: 'Фильтр по категории',
      type: 'set',
      value: 'Категория А, Категория Б',
      active: true,
    },
    { id: '5', name: 'Фильтр по приоритету', type: 'set', value: '> 5', active: false },
    {
      id: '6',
      name: 'Фильтр по автору',
      type: 'set',
      value: 'Иванов, Петров, Сидоров',
      active: true,
    },
    {
      id: '7',
      name: 'Фильтр по региону',
      type: 'set',
      value: 'Москва, СПб, Екатеринбург',
      active: false,
    },
    { id: '8', name: 'Фильтр по сумме', type: 'set', value: '1000 - 50000', active: true },
  ]);

  const [isInitialized, setIsInitialized] = useState(false);
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  const onGridReady = useCallback((params: any) => {
    setGridApi(params.api);
  }, []);

  useEffect(() => {
    if (activeTemplate && !isInitialized) {
      setSelectedTemplate(activeTemplate);
      setIsInitialized(true);
    }
  }, [activeTemplate, isInitialized]);

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
      headerName: 'Название фильтра',
      field: 'name',
      flex: 1,
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Тип',
      field: 'type',
      width: 120,
      filter: 'agSetColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Значение',
      field: 'value',
      flex: 1,
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Активен',
      field: 'active',
      width: 100,
      filter: 'agSetColumnFilter',
      sortable: true,
      cellRenderer: CheckboxRenderer,
    },
  ];



  const handleTemplateChange = useCallback(
    (templateId: string) => {
      if (templateId === '') {
        setSelectedTemplate(null);
        clearActiveTemplate();
        setIsInitialized(false);
        return;
      }

      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        setActiveTemplate(template);
        setIsInitialized(false);
      }
    },
    [templates, setActiveTemplate, clearActiveTemplate],
  );

  const handleSave = useCallback(() => {
    if (selectedTemplate && gridApi) {
      const activeFilters = rowData.filter(row => row.active);

      const filterModel: FilterModel = {};
      activeFilters.forEach(filter => {
        if (filter.type === 'set') {
          filterModel[filter.id] = {
            values: filter.value.split(', '),
            filterType: 'set'
          };
        } else if (filter.type === 'date') {
          const dates = filter.value.split(' - ');
          filterModel[filter.id] = {
            dateFrom: dates[0],
            dateTo: dates[1],
            filterType: 'date',
            type: 'inRange'
          };
        } else if (filter.type === 'text') {
          filterModel[filter.id] = {
            filter: filter.value,
            filterType: 'text',
            type: 'contains'
          };
        }
      });

      const sortState: SortState = [];
      if (gridApi) {
        gridApi.forEachNode((node, index) => {
          if (node.data) {
            sortState.push({
              colId: node.data.id,
              sort: 'asc',
              sortIndex: index
            });
          }
        });
      }

      const updatedTemplate = {
        ...selectedTemplate,
        filterModel,
        sortState,
      };
      updateTemplate(updatedTemplate);
      onSave(updatedTemplate);
      console.log('Сохранен шаблон:', updatedTemplate);

      onClose();
    }
  }, [selectedTemplate, gridApi, rowData, updateTemplate, onSave, onClose]);

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
  }, [gridApi]);

  if (!isOpen) return null;

  return (
    <Modal
      onClose={onClose}
      style={{
        width: '800px',
        height: '600px',
      }}
    >
      <div
        style={{
          padding: '24px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            Настройка фильтров и сортировки
          </h2>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Select
            value={selectedTemplate?.id || ''}
            onChange={(e) => handleTemplateChange(e.target.value)}
            placeholder="Выберите шаблон"
          >
            <Option value="">Без шаблона</Option>
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
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div className="ag-theme-quartz" style={{ height: '100%', width: '100%' }}>
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              onGridReady={onGridReady}
              context={{ setRowData }}
              onRowDragEnd={(event) => {
                const newRowData: any[] = [];
                gridApi?.forEachNode((node) => {
                  if (node.data) {
                    newRowData.push(node.data);
                  }
                });
                setRowData(newRowData);
                console.log('Новый порядок строк:', newRowData);
              }}
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

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <Button onClick={handleClearFilters} appearance="ghost">
            <DeleteOutline />
            Очистить фильтры
          </Button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button onClick={handleCancel} appearance="secondary">
              Отмена
            </Button>
            <Button onClick={handleSave} appearance="primary">
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = useCallback((template: TemplateConfig) => {}, []);

  return (
    <div style={{ padding: '20px' }}>
      <Button onClick={() => setIsModalOpen(true)} appearance="primary">
        <FilterOutline />
        Настроить фильтры
      </Button>
      <TemplateFilterGrid
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

