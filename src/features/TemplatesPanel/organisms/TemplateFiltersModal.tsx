import { ReactNode, useEffect } from 'react';
import {
  Modal,
  ModalTitle,
  Button,
  Select,
  Option,
  TextField,
  InputField,
  Field,
} from '@admiral-ds/react-ui';
import { Template } from '@shared/api/types';
import { initialColumns as _initialColumns } from '@shared/constants/InitialCollumns';
import { useTemplatesStore } from '@shared/stores/templatesStore';
import { useFiltersStore } from '@shared/stores/filtersStore';
import { useGlobalStore } from '@shared/stores/globalStore';
import { ReactComponent as SearchOutline } from '@admiral-ds/icons/build/system/SearchOutline.svg';
import {
  useTemplateFiltersModalStore,
  useTemplateFiltersModalStoreSelected,
} from '../stores/templateFiltersModalStore';
import { TemplateFiltersGrid } from './TemplateFiltersGrid';
import { Spacer } from '../../../shared/ui/atoms';
import { useDeepEffect } from '../../../shared/hooks/useDeepEffect';

const initialColumns = _initialColumns.filter((col) => col.name !== 'relations');

export const TemplateFiltersModal = ({ children }: { children: ReactNode }) => {
  const columnFilters = useTemplateFiltersModalStoreSelected.use.columnFilters();
  const setQuickFilterText = useTemplateFiltersModalStoreSelected.use.setQuickFilterText();
  const quickFilterText = useTemplateFiltersModalStoreSelected.use.quickFilterText();
  const initializeFromTemplate = useTemplateFiltersModalStoreSelected.use.initializeFromTemplate();
  const closeModal = useTemplateFiltersModalStoreSelected.use.closeModal();
  const selectedTemplateId = useTemplateFiltersModalStoreSelected.use.selectedTemplateId();
  const resetState = useTemplateFiltersModalStoreSelected.use.resetState();
  const localGridApi = useTemplateFiltersModalStoreSelected.use.localGridApi();

  const { templates, pendingTemplate, setPendingTemplate } = useTemplatesStore();
  const { topFilters, setTopFilters } = useFiltersStore();
  const { agGridApi: agGridApiGlobal } = useGlobalStore();

  useDeepEffect(() => {
    // Получаем активный шаблон из topFilters
    const activeTemplateId = topFilters.templates?.[0];

    const activeTemplate = activeTemplateId
      ? templates.find((t) => t.template_id.toString() === activeTemplateId)
      : undefined;

    if (activeTemplate) {
      initializeFromTemplate(activeTemplate);
    } else if (pendingTemplate) {
      const filterModel = agGridApiGlobal?.getFilterModel();
      initializeFromTemplate({ ...pendingTemplate, filterModel });
    } else {
      const filterModel = agGridApiGlobal?.getFilterModel();

      initializeFromTemplate({
        // @ts-ignore
        template_id: 'Новый шаблон для сохранения',
        template_name: 'Новый шаблон',
        user_id: null,
        filterModel,
        isPending: true,
      });
    }
  }, [templates, topFilters, pendingTemplate, initializeFromTemplate]);

  const handleTemplateChange = (templateId: string) => {
    const id = templateId === 'new' ? null : parseInt(templateId);

    if (id) {
      const template = templates.find((t) => t.template_id === id);
      if (template) {
        initializeFromTemplate(template);
      }
    } else {
      initializeFromTemplate(undefined);
    }
  };

  const handleSave = () => {
    if (agGridApiGlobal && localGridApi) {
      const newFilterModel: any = {};
      const columnState: any[] = [];

      columnFilters.forEach((column) => {
        const matchingColumn = initialColumns.find((col) => col.name === column.colId);

        if (matchingColumn) {
          columnState.push({
            colId: column.colId,
            hide: !column.isActive,
          });
        }
      });

      columnFilters.forEach((column) => {
        if (column.isActive && column.filterValues.length > 0) {
          if (column.type === 'DATE') {
            newFilterModel[column.colId] = {
              filterType: 'date',
              type: column.filterValues[0] && column.filterValues[1] ? 'inRange' : 'equals',
              dateFrom: column.filterValues[0] || null,
              dateTo: column.filterValues[1] || null,
            };
          } else {
            newFilterModel[column.colId] = {
              filterType: 'set',
              values: column.filterValues,
            };
          }
        }
      });

      let savedTemplate: Template;
      if (selectedTemplateId) {
        const template = templates.find((t) => t.template_id === selectedTemplateId);
        if (template) {
          savedTemplate = {
            ...template,
            filterModel: newFilterModel,
            columnState,
          };
          setPendingTemplate(savedTemplate);
          agGridApiGlobal.setFilterModel(newFilterModel);
          agGridApiGlobal.applyColumnState({ state: columnState, applyOrder: true });
          setTopFilters({ ...topFilters, templates: [selectedTemplateId.toString()] });
        }
      } else {
        savedTemplate = {
          // @ts-ignore
          template_id: 'Новый шаблон для сохранения',
          template_name: 'Новый шаблон',
          user_id: null,
          filterModel: newFilterModel,
          columnState,
          isPending: true,
        };
        setPendingTemplate(savedTemplate);
        agGridApiGlobal.setFilterModel(newFilterModel);
        agGridApiGlobal.applyColumnState({ state: columnState, applyOrder: true });
        setTopFilters({ ...topFilters, templates: [] });
      }

      setTimeout(() => {
        // setFilterModel(newFilterModel);
        agGridApiGlobal.setFilterModel(newFilterModel);
        agGridApiGlobal.applyColumnState({ state: columnState, applyOrder: true });
      }, 30);
    }

    closeModal();
  };

  const handleReset = () => {
    initializeFromTemplate(undefined);
  };

  const handleCancel = () => {
    resetState();
    closeModal();
  };

  const templateOptions = [
    { value: 'new', label: 'Новый шаблон для сохранения' },
    ...templates
      .filter((template) => template.template_id > 0)
      .map((template) => ({
        value: template.template_id.toString(),
        label: template.template_name,
      })),
  ];

  return (
    <Modal
      onClose={handleCancel}
      dimension="xl"
      style={{ width: '95%', maxWidth: '95%', height: '95%' }}
    >
      <ModalTitle>Управление шаблонами фильтрации</ModalTitle>
      <Spacer space={10} />
      <div
        style={{
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          height: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <Field label="Активный шаблон:">
            <Select
              id="TemplateFiltersModal_select_template_input"
              placeholder="Выберите шаблон"
              dimension="s"
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
          </Field>

          <div style={{ minWidth: '300px' }}>
            <InputField
              id="filter-text-box"
              value={quickFilterText}
              dimension="s"
              onChange={(e) => setQuickFilterText(e.target.value)}
              placeholder="Поиск"
              icons={<SearchOutline />}
            />
          </div>
        </div>

        {children}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button appearance="secondary" dimension="s" onClick={handleReset}>
            Сбросить
          </Button>
          <Button appearance="secondary" dimension="s" onClick={handleCancel}>
            Отмена
          </Button>
          <Button appearance="primary" dimension="s" onClick={handleSave}>
            Сохранить
          </Button>
        </div>
      </div>
    </Modal>
  );
};

