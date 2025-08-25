import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, RowDragEndEvent } from 'ag-grid-community';
import { create } from 'zustand';
import {
  Button,
  Modal,
  TextField,
  Checkbox,
  Badge,
  Tooltip,
  Select,
  Option,
} from '@admiral-ds/react-ui';
import { ReactComponent as FilterOutline } from '@admiral-ds/icons/build/system/FilterOutline.svg';
import { ReactComponent as CheckOutline } from '@admiral-ds/icons/build/service/CheckOutline.svg';
import { ReactComponent as CloseOutline } from '@admiral-ds/icons/build/service/CloseOutline.svg';
import { ReactComponent as PlusCircleOutline } from '@admiral-ds/icons/build/service/PlusCircleOutline.svg';
import { ReactComponent as DeleteOutline } from '@admiral-ds/icons/build/system/DeleteOutline.svg';

interface FilterItem {
  id: string;
  name: string;
  value: any;
  selected: boolean;
  order: number;
}

interface TemplateConfig {
  id: string;
  name: string;
  filters: FilterItem[];
  sortModel: any[];
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
      filters: [
        {
          id: '1',
          name: 'Название',
          value: '',
          selected: true,
          order: 1,
        },
        {
          id: '2',
          name: 'Дата создания',
          type: 'date',
          value: null,
          selected: false,
          order: 2,
        },
        {
          id: '3',
          name: 'Статус',
          value: '',
          selected: true,
          order: 3,
        },
      ],
      sortModel: [],
    },
    {
      id: '2',
      name: 'Шаблон 2',
      filters: [
        {
          id: '4',
          name: 'Количество',
          value: 0,
          selected: true,
          order: 1,
        },
        {
          id: '5',
          name: 'Категория',
          value: '',
          selected: false,
          order: 2,
        },
      ],
      sortModel: [],
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

const DragHandleCellRenderer: React.FC = React.memo(() => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        cursor: 'grab',
      }}
    >
      <span style={{ fontSize: '16px' }}>⋮⋮</span>
    </div>
  );
});

DragHandleCellRenderer.displayName = 'DragHandleCellRenderer';

interface SelectionCellRendererProps {
  data: FilterItem;
  onSelectionChange: (id: string, selected: boolean) => void;
}

const SelectionCellRenderer: React.FC<SelectionCellRendererProps> = React.memo(
  ({ data, onSelectionChange }) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Checkbox
          checked={data.selected}
          onChange={(e) => onSelectionChange(data.id, e.target.checked)}
        />
      </div>
    );
  },
);

SelectionCellRenderer.displayName = 'SelectionCellRenderer';

interface TemplateFilterGridProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: TemplateConfig) => void;
}

export const TemplateFilterGrid: React.FC<TemplateFilterGridProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const {
    templates,
    activeTemplate,
    setActiveTemplate,
    addTemplate,
    updateTemplate,
    clearActiveTemplate,
  } = useTemplateStore();
  const [rowData, setRowData] = useState<FilterItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showNewTemplateInput, setShowNewTemplateInput] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  useEffect(() => {
    if (activeTemplate && !isInitialized) {
      setRowData([...activeTemplate.filters].sort((a, b) => a.order - b.order));
      setSelectedTemplate(activeTemplate.id);
      setIsInitialized(true);
    } else if (!activeTemplate) {
      setRowData([]);
      setSelectedTemplate('');
      setIsInitialized(false);
    }
  }, [activeTemplate, isInitialized]);

  const handleSelectionChange = useCallback(
    (id: string, selected: boolean) => {
      if (gridApi) {
        gridApi.forEachNode((node) => {
          if (node.data && node.data.id === id) {
            node.setData({ ...node.data, selected });
          }
        });
      }
    },
    [gridApi],
  );

  const columnDefs: ColDef[] = [
    {
      headerName: '',
      field: 'drag',
      width: 50,
      cellRenderer: DragHandleCellRenderer,
      rowDrag: true,
      suppressMenu: true,
      sortable: false,
      filter: false,
    },
    {
      headerName: 'Выбор',
      field: 'selected',
      width: 80,
      cellRenderer: SelectionCellRenderer,
      cellRendererParams: {
        onSelectionChange: handleSelectionChange,
      },
      suppressMenu: true,
      sortable: false,
      filter: false,
    },
    {
      headerName: 'Название фильтра',
      field: 'name',
      flex: 1,
      suppressMenu: true,
      sortable: false,
      filter: false,
    },
  ];

  const handleRowDragEnd = useCallback(
    (event: RowDragEndEvent) => {
      const { node, overNode } = event;
      if (!node || !overNode) return;

      const draggedData = node.data;
      const overData = overNode.data;

      if (draggedData.id === overData.id) return;

      const newRowData = [...rowData];
      const draggedIndex = newRowData.findIndex((item) => item.id === draggedData.id);
      const overIndex = newRowData.findIndex((item) => item.id === overData.id);

      newRowData.splice(draggedIndex, 1);
      newRowData.splice(overIndex, 0, draggedData);

      const updatedData = newRowData.map((item, index) => ({ ...item, order: index + 1 }));
      setRowData(updatedData);
    },
    [rowData],
  );

  const handleTemplateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const templateId = e.target.value;
      if (templateId === 'new') {
        setShowNewTemplateInput(true);
        return;
      }
      if (templateId === 'clear') {
        clearActiveTemplate();
        return;
      }
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setIsInitialized(false);
        setActiveTemplate(template);
      }
      setSelectedTemplate(templateId);
    },
    [templates, setActiveTemplate, clearActiveTemplate],
  );

  const handleSave = useCallback(() => {
    if (!activeTemplate || !gridApi) return;

    const currentData: FilterItem[] = [];
    gridApi.forEachNode((node) => {
      if (node.data) {
        currentData.push(node.data);
      }
    });

    const updatedTemplate: TemplateConfig = {
      ...activeTemplate,
      filters: currentData,
    };

    updateTemplate(updatedTemplate);
    onSave(updatedTemplate);
    onClose();
  }, [activeTemplate, gridApi, updateTemplate, onSave, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleClearFilters = useCallback(() => {
    if (gridApi) {
      gridApi.forEachNode((node) => {
        if (node.data) {
          node.setData({ ...node.data, selected: false });
        }
      });
    }
  }, [gridApi]);

  const handleCreateNewTemplate = useCallback(() => {
    if (!newTemplateName.trim()) return;

    const newTemplate: TemplateConfig = {
      id: Date.now().toString(),
      name: newTemplateName,
      filters: [],
      sortModel: [],
    };

    addTemplate(newTemplate);
    setActiveTemplate(newTemplate);
    setSelectedTemplate(newTemplate.id);
    setNewTemplateName('');
    setShowNewTemplateInput(false);
  }, [newTemplateName, addTemplate, setActiveTemplate]);

  const onGridReady = useCallback((params: any) => {
    setGridApi(params.api);
  }, []);

  const selectedCount = rowData.filter((item) => item.selected).length;

  if (!isOpen) return null;

  return (
    <Modal
      onClose={onClose}
      style={{
        width: '800px',
        maxWidth: '90vw',
        height: '600px',
        maxHeight: '90vh',
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
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <FilterOutline style={{ fontSize: '24px' }} />
            <h2
              style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '600',
              }}
            >
              Настройка фильтров
            </h2>
            {selectedCount > 0 && <Badge style={{ marginLeft: '8px' }}>{selectedCount}</Badge>}
          </div>
        </div>

        <div
          style={{
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontWeight: '500' }}>Активный шаблон:</span>
          {showNewTemplateInput ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TextField
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Название нового шаблона"
                style={{ width: '200px' }}
              />
              <Button
                dimension="s"
                appearance="primary"
                onClick={handleCreateNewTemplate}
                disabled={!newTemplateName.trim()}
              >
                <CheckOutline />
              </Button>
              <Button
                dimension="s"
                appearance="ghost"
                onClick={() => {
                  setShowNewTemplateInput(false);
                  setNewTemplateName('');
                }}
              >
                <CloseOutline />
              </Button>
            </div>
          ) : (
            <Select
              value={selectedTemplate}
              onChange={handleTemplateChange}
              placeholder="Выберите шаблон"
              style={{ width: '250px' }}
            >
              {templates.map((template) => (
                <Option key={template.id} value={template.id}>
                  {template.name}
                </Option>
              ))}
              <Option value="new">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PlusCircleOutline />
                  Создать новый
                </div>
              </Option>
              <Option value="clear">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DeleteOutline />
                  Очистить
                </div>
              </Option>
            </Select>
          )}
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
          <Button dimension="m" appearance="ghost" onClick={handleClearFilters}>
            Очистить все
          </Button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button dimension="m" appearance="secondary" onClick={handleCancel}>
              Отмена
            </Button>
            <Button
              dimension="m"
              appearance="primary"
              onClick={handleSave}
              disabled={!activeTemplate}
            >
              Сохранить шаблон
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export const TFiltersTest2 = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appliedTemplates, setAppliedTemplates] = useState<TemplateConfig[]>([]);
  console.log('🐸 Pepe said >> TFiltersTest2 >> appliedTemplates:', appliedTemplates);


  const handleSaveTemplate = useCallback((template: TemplateConfig) => {
    setAppliedTemplates((prev) => {
      const existing = prev.find((t) => t.id === template.id);
      if (existing) {
        return prev.map((t) => (t.id === template.id ? template : t));
      }
      return [...prev, template];
    });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Тест компонента фильтрации шаблонов AG-Grid</h1>

      <Button
        dimension="m"
        appearance="primary"
        onClick={() => setIsModalOpen(true)}
        style={{ marginBottom: '20px' }}
      >
        Открыть
      </Button>

      <TemplateFilterGrid
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTemplate}
      />
    </div>
  );
};

