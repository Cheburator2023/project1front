/* eslint-disable no-nested-ternary */
/* eslint-disable react/button-has-type */
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import { Button, Modal, Select, Option, ModalTitle } from '@admiral-ds/react-ui';
import { ReactComponent as CheckOutline } from '@admiral-ds/icons/build/service/CheckOutline.svg';

import { ReactComponent as DeleteOutline } from '@admiral-ds/icons/build/system/DeleteOutline.svg';
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
import { useTemplateFilters } from '../../shared/hooks';
import { Spacer } from '../../shared/ui/atoms';
import { initialColumns } from '../../shared/constants';
import { Template } from '../../shared/api';
import { COLUMN_TYPE } from '../../shared/types';
import { AG_GRID_LOCALE_RU } from './locale/agGridLocale.ru';

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

interface FilterItem {
  id: string;
  name: string;
  type: string;
  value: string;
  active: boolean;
}

interface TemplateFilterGridProps {
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

const ValueRenderer = React.memo((params: any) => {
  const { data, value, api } = params;
  const isDateType = data.type === 'Дата';

  const handleValueChange = (newValue: string) => {
    const updatedData = { ...data, value: newValue };
    const rowNode = api.getRowNode(data.id);
    if (rowNode) {
      rowNode.setData(updatedData);
    }
  };

  if (isDateType) {
    return (
      <input
        type="date"
        value={value ? value.split(' - ')[0] : ''}
        onChange={(e) => {
          const dateValue = e.target.value;
          handleValueChange(dateValue ? `${dateValue} - ${dateValue}` : '');
        }}
        style={{
          width: '100%',
          padding: '4px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
    );
  }

  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => handleValueChange(e.target.value)}
      placeholder="Введите значения через запятую"
      style={{
        width: '100%',
        padding: '4px',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    />
  );
});

ValueRenderer.displayName = 'ValueRenderer';

export const TemplateFilterGrid: React.FC<TemplateFilterGridProps> = ({ onClose, onSave }) => {
  const { templates, setTemplates } = useTemplatesStore();
  console.log('🐸 Pepe said >> TemplateFilterGrid >> templates:', templates);

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
      let value = '';

      if (templateFilter) {
        if ('values' in templateFilter && templateFilter.values) {
          // Для set фильтров - объединяем values через запятую
          value = templateFilter.values.filter((v) => v !== null).join(', ');
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
        name: column.title,
        type: column.type === COLUMN_TYPE.DATE ? 'Дата' : 'Список',
        value,
        active: !!templateFilter,
      };
    });
  }, [selectedTemplate]);

  const [rowData, setRowData] = useState<FilterItem[]>(defaultFilters);

  // Обновляем rowData когда изменяется defaultFilters
  useEffect(() => {
    setRowData(defaultFilters);
  }, [defaultFilters]);

  const [isInitialized, setIsInitialized] = useState(false);
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  const onGridReady = useCallback((params: any) => {
    setGridApi(params.api);
  }, []);

  useEffect(() => {
    if (defaultActiveTemplateId && !isInitialized) {
      const defaultTemplate = templates.find(
        (t) => String(t.template_id) === defaultActiveTemplateId,
      );
      console.log('🐸 Pepe said >> TemplateFilterGrid >> defaultTemplate:', defaultTemplate);

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
    if (gridApi && selectedTemplate) {
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

      // Применяем фильтры к глобальной AG Grid так же, как в TemplatesFilter
      if (selectedTemplate.filterModel) {
        setFilterModel(selectedTemplate.filterModel);
      }

      // Применяем активные фильтры из шаблона к rowData
      setRowData((currentRowData) =>
        currentRowData.map((row) => {
          const isActiveInTemplate = selectedTemplate.filterModel
            ? Object.keys(selectedTemplate.filterModel).some((filterKey) => {
                // Находим соответствующую колонку в initialColumns по имени фильтра
                const matchingColumn = initialColumns.find((col) => col.name === filterKey);
                if (!matchingColumn) return false;

                // Проверяем соответствие имени фильтра с именем строки (row.name)
                return matchingColumn.title === row.name;
              })
            : false;
          return { ...row, active: isActiveInTemplate };
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
        width: 100,
        filter: 'agSetColumnFilter',
        sortable: false,
        cellRenderer: CheckboxRenderer,
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
        setActiveTemplate(null);
        setIsInitialized(false);
        setIsCustomTemplate(false);
        // Сбрасываем фильтры при очистке шаблона
        setFilterModel({});
        // Сбрасываем все чекбоксы при очистке шаблона
        setRowData((currentRowData) => currentRowData.map((row) => ({ ...row, active: false })));
        return;
      }

      const template = templates.find((t) => String(t.template_id) === value);
      if (template) {
        setSelectedTemplate(template);
        setActiveTemplate(template);
        setIsInitialized(false);
        setIsCustomTemplate(false);
        // Применяем фильтры шаблона сразу при выборе
        if (template.filterModel) {
          setFilterModel(template.filterModel);
        }
      }
    },
    [templates, setActiveTemplate, setFilterModel],
  );

  const handleFilterChange = useCallback(() => {
    if (selectedTemplate && !isCustomTemplate) {
      setSelectedTemplate(null);
      setIsCustomTemplate(true);
    }
  }, [selectedTemplate, isCustomTemplate]);

  const handleRowDragEnd = useCallback(() => {
    const newRowData: any[] = [];
    gridApi?.forEachNode((node) => {
      if (node.data) {
        newRowData.push(node.data);
      }
    });
    setRowData(newRowData);
    handleFilterChange();
    console.log('Новый порядок строк:', newRowData);
  }, [gridApi, handleFilterChange]);

  const handleSave = useCallback(() => {
    if (gridApi) {
      const activeFilters = rowData.filter((row) => row.active);

      const filterModel: FilterModel = {};
      activeFilters.forEach((filter) => {
        // Находим соответствующую колонку в initialColumns по имени фильтра
        const matchingColumn = initialColumns.find((col) => col.title === filter.name);
        if (!matchingColumn) return;

        const columnId = matchingColumn.name;

        if (filter.type === 'Дата') {
          const dates = filter.value.split(' - ');
          filterModel[columnId] = {
            dateFrom: dates[0],
            dateTo: dates[1],
            filterType: 'date',
            type: 'inRange',
          };
        } else {
          // Все остальные типы используют set фильтр
          filterModel[columnId] = {
            values: filter.value.split(', '),
            filterType: 'set',
          };
        }
      });

      const sortState: SortState = [];
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
          }
        }
      });

      let templateToSave;
      if (selectedTemplate) {
        templateToSave = {
          ...selectedTemplate,
          filterModel,
          sortState,
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
        };
        setTemplates((prev) => [...prev, templateToSave]);
      }

      // Применяем фильтры и сортировку к глобальной AG Grid через agGridApi
      if (agGridApiGlobal) {
        console.log('🐸 Pepe said >> TemplateFilterGrid >> filterModel:', filterModel);
        agGridApiGlobal.setFilterModel(filterModel);

        if (sortState.length > 0) {
          agGridApiGlobal.applyColumnState({ state: sortState, defaultState: { sort: null } });
        }
      }

      // Обновляем состояние в filtersStore
      setFilterModel(filterModel);
      setSortState(sortState);

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
    setTemplates,
    setActiveTemplate,
    setIsCustomTemplate,
    onSave,
    onClose,
    agGridApiGlobal,
    setFilterModel,
    setSortState,
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
    setRowData(defaultFilters);
  }, [gridApi, setFilterModel]);

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
            value={selectedTemplate ? String(selectedTemplate.template_id) : ''}
            onChange={(e) => handleTemplateChange(e.target.value)}
            placeholder=""
          >
            <Option value="">Новый шаблон</Option>
            {templates.map((template) => (
              <Option key={template.template_id} value={String(template.template_id)}>
                {template.template_name}
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
              localeText={AG_GRID_LOCALE_RU}
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
  const { topFilters, filterModel } = useFiltersStore();

  const { filters } = useTableModels();

  const filterTemplates = filters?.templates;

  const { isModifiedFilter } = useTemplateFilters(
    filterModel,
    filterTemplates,
    topFilters.templates,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = useCallback(() => {}, []);

  const activeFiltersCount = useMemo(
    () => getActiveFiltersCount(filterModel, filterTemplates, topFilters.templates[0]),
    [filterModel, filterTemplates, topFilters.templates],
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
      {isModalOpen && (
        <TemplateFilterGrid onClose={() => setIsModalOpen(false)} onSave={handleSave} />
      )}
    </div>
  );
};

