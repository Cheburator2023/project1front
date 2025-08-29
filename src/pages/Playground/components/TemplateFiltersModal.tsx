import { useEffect } from 'react';
import {
  Modal,
  ModalTitle,
  Button,
  Select,
  Option,
  TextField,
  InputField,
} from '@admiral-ds/react-ui';
import { Template } from '@shared/api/types';
import { initialColumns } from '@shared/constants/InitialCollumns';
import { useTemplatesStore } from '@shared/stores/templatesStore';
import { useFiltersStore } from '@shared/stores/filtersStore';
import { useGlobalStore } from '@shared/stores/globalStore';
import { ReactComponent as SearchOutline } from '@admiral-ds/icons/build/system/SearchOutline.svg';
import { useTemplateFiltersModalStore } from '../stores/templateFiltersModalStore';
import { TemplateFiltersGrid } from './TemplateFiltersGrid';
import { Spacer } from '../../../shared/ui/atoms';

export const TemplateFiltersModal = () => {
  const {
    isOpen,
    closeModal,
    selectedTemplateId,
    setSelectedTemplate,
    columnFilters,
    setColumnFilters,
    isDirty,
    resetState,
    initializeFromTemplate,
    hasChanges,
    quickFilterText,
    setQuickFilterText,
    localGridApi,
  } = useTemplateFiltersModalStore();

  const { templates, pendingTemplate, setPendingTemplate } = useTemplatesStore();
  const { filterModel, setFilterModel, resetFilters, topFilters, setTopFilters } =
    useFiltersStore();
  const { agGridApi: agGridApiGlobal } = useGlobalStore();

  useEffect(() => {
    if (isOpen && agGridApiGlobal) {
      const currentFilterModel = agGridApiGlobal.getFilterModel();

      // Получаем активный шаблон из topFilters
      const activeTemplateId = topFilters.templates?.[0];
      const activeTemplate = activeTemplateId
        ? templates.find((t) => t.template_id.toString() === activeTemplateId)
        : undefined;

      if (activeTemplate) {
        // Инициализируем модальное окно с активным шаблоном
        initializeFromTemplate(activeTemplate);
      } else {
        // Если нет активного шаблона, инициализируем с текущими фильтрами
        const mappedFilters = initialColumns.map((column, index) => {
          const filter = currentFilterModel[column.name];
          let filterValues: string[] = [];

          if (filter) {
            if ('values' in filter && filter.values) {
              filterValues = filter.values.filter((value): value is string => Boolean(value));
            } else if ('dateFrom' in filter || 'dateTo' in filter) {
              const dateRange: string[] = [];
              if ('dateFrom' in filter && filter.dateFrom) dateRange.push(`От: ${filter.dateFrom}`);
              if ('dateTo' in filter && filter.dateTo) dateRange.push(`До: ${filter.dateTo}`);
              filterValues = dateRange;
            }
          }

          return {
            colId: column.name,
            name: column.name,
            title: column.title,
            type: column.type,
            isActive: !!filter,
            filterValues,
            order: index,
          };
        });

        setColumnFilters(mappedFilters);
      }
    }
  }, [
    isOpen,
    agGridApiGlobal,
    setColumnFilters,
    topFilters.templates,
    templates,
    initializeFromTemplate,
  ]);

  const handleTemplateChange = (templateId: string) => {
    const id = templateId === 'new' ? null : parseInt(templateId);

    if (id) {
      const template = templates.find((t) => t.template_id === id);
      initializeFromTemplate(template);
    } else {
      initializeFromTemplate();
    }
  };

  const handleSave = () => {
    if (agGridApiGlobal && localGridApi) {
      const newFilterModel: any = {};
      const columnState: any[] = [];

      localGridApi.forEachNode((node, index) => {
        if (node.data) {
          const matchingColumn = initialColumns.find((col) => col.title === node.data.title);

          if (matchingColumn) {
            columnState.push({
              colId: matchingColumn.name,
              hide: !node.data.isActive,
              sort: null,
              sortIndex: null,
            });
          }
        }
      });

      columnFilters.forEach((column) => {
        if (column.isActive && column.filterValues.length > 0) {
          if (column.type === 'DATE') {
            const dateFrom = column.filterValues
              .find((v) => v.startsWith('От:'))
              ?.replace('От: ', '');
            const dateTo = column.filterValues
              .find((v) => v.startsWith('До:'))
              ?.replace('До: ', '');

            if (dateFrom || dateTo) {
              newFilterModel[column.colId] = {
                filterType: 'date',
                type: 'inRange',
                dateFrom: dateFrom || null,
                dateTo: dateTo || null,
              };
            }
          } else {
            newFilterModel[column.colId] = {
              filterType: 'set',
              values: column.filterValues,
            };
          }
        }
      });

      setTimeout(() => {
        agGridApiGlobal.setFilterModel(newFilterModel);
        setFilterModel(newFilterModel);
        agGridApiGlobal.applyColumnState({ state: columnState, applyOrder: true });
      }, 300);

      let savedTemplate: Template;
      if (selectedTemplateId) {
        const template = templates.find((t) => t.template_id === selectedTemplateId);
        if (template) {
          savedTemplate = {
            ...template,
            filterModel: newFilterModel,
          };
          setPendingTemplate(savedTemplate);
        }
      } else {
        savedTemplate = {
          template_id: Date.now(),
          template_name: 'Новый шаблон',
          user_id: null,
          filterModel: newFilterModel,
          isPending: true,
        };
        setPendingTemplate(savedTemplate);
      }

      // Сбрасываем активный шаблон в topFilters при сохранении нового
      if (!selectedTemplateId) {
        setTopFilters({ ...topFilters, templates: [] });
      }
    }

    closeModal();
  };

  const handleReset = () => {
    if (agGridApiGlobal) {
      agGridApiGlobal.setFilterModel({});
    }
    initializeFromTemplate();
  };

  const handleCancel = () => {
    resetState();
    closeModal();
  };

  const templateOptions = [
    { value: 'new', label: 'Создать новый шаблон' },
    ...templates.map((template) => ({
      value: template.template_id.toString(),
      label: template.template_name,
    })),
  ];

  return (
    isOpen && (
      <Modal onClose={handleCancel} dimension="xl" style={{ width: '90%', maxWidth: '90%' }}>
        <ModalTitle>Управление шаблонами фильтрации</ModalTitle>
        <Spacer />
        <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <label style={{ fontWeight: 500 }}>Шаблон:</label>
              <Select
                id="TemplateFiltersModal_select_template_input"
                placeholder="Выберите шаблон"
                value={selectedTemplateId?.toString() || 'new'}
                onChange={(e) => handleTemplateChange(e.target.value)}
                style={{ minWidth: '300px' }}
              >
                {templateOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>
            <div style={{ minWidth: '300px' }}>
              <InputField
                id="filter-text-box"
                value={quickFilterText}
                onChange={(e) => setQuickFilterText(e.target.value)}
                placeholder="Поиск"
                icons={<SearchOutline />}
              />
            </div>
          </div>

          <div style={{ height: '500px' }}>
            <TemplateFiltersGrid />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button appearance="secondary" dimension="s" onClick={handleReset}>
              Сбросить
            </Button>
            <Button appearance="secondary" dimension="s" onClick={handleCancel}>
              Отмена
            </Button>
            <Button
              appearance="primary"
              dimension="s"
              onClick={handleSave}
              disabled={!hasChanges()}
            >
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
    )
  );
};

