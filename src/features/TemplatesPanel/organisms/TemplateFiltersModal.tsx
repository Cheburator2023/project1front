import { ReactNode, useEffect, useMemo } from 'react';
import {
  Modal,
  ModalTitle,
  Button,
  Select,
  Option,
  OptionGroup,
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
import { useTemplateFiltersModalStoreSelected } from '../stores/templateFiltersModalStore';
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
  const isEditMode = useTemplateFiltersModalStoreSelected.use.isEditMode();
  const toggleEditMode = useTemplateFiltersModalStoreSelected.use.toggleEditMode();
  const resetInitialized = useTemplateFiltersModalStoreSelected.use.resetInitialized();

  const setResetInitialized = useTemplateFiltersModalStoreSelected.use.setResetInitialized();
  const hasColumnsChangedAfterReset =
    useTemplateFiltersModalStoreSelected.use.hasColumnsChangedAfterReset();
  const hasChanges = useTemplateFiltersModalStoreSelected.use.hasChanges();
  const setIsDirty = useTemplateFiltersModalStoreSelected.use.setIsDirty();

  const { templates, pendingTemplate, setPendingTemplate } = useTemplatesStore();
  const { topFilters, setTopFilters, resetFilters } = useFiltersStore();
  const { filtersResetCount, setFiltersResetCount, agGridApi: agGridApiGlobal } = useGlobalStore();

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
        template_id: 'Не активен',
        template_name: 'Новый шаблон',
        user_id: null,
        filterModel,
        isPending: true,
      });
    }
  }, [templates, topFilters, pendingTemplate, initializeFromTemplate]);

  const handleTemplateChange = (templateId: string) => {
    const id = templateId === 'new' ? null : parseInt(templateId);

    // Set dirty flag to indicate that user performed an action
    setIsDirty(true);

    if (templateId !== 'new' && resetInitialized) {
      setResetInitialized(false);
    }

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
    // Check if reset was initiated and apply reset logic
    if (resetInitialized && selectedTemplateId === null) {
      // Check if columns were modified after reset
      const hasColumnsChanged = hasColumnsChangedAfterReset();

      if (hasColumnsChanged) {
        // If columns were modified after reset, apply the modified column state instead of full reset
        if (agGridApiGlobal) {
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

          // Reset filters first (this will show all columns)
          resetFilters();

          // Then apply the modified column state to override the reset column visibility
          agGridApiGlobal.applyColumnState({
            state: columnState,
            defaultState: { sort: null },
            applyOrder: true,
          });

          setTopFilters({ ...topFilters, templates: [] });
          setFiltersResetCount();
          initializeFromTemplate(undefined);
          setPendingTemplate(undefined);
          console.log('🐸 AAA 1', setPendingTemplate);
        }
      } else {
        // Apply the same reset logic as in TemplatesFilterInput (full reset)
        resetFilters();
        setTopFilters({ ...topFilters, templates: [] });
        setFiltersResetCount();
        resetState();
        initializeFromTemplate(undefined);
        setPendingTemplate(undefined);
        console.log('🐸 AAA 2', setPendingTemplate);
      }

      // Reset the resetInitialized flag
      setResetInitialized(false);

      closeModal();
      return;
    }

    // Check if there are any changes before applying template logic
    if (!hasChanges()) {
      // No changes detected, just close the modal without applying anything
      console.log('🐸 Pepe said >> handleSave >> No changes detected');

      closeModal();
      return;
    }

    console.log('🐸 Pepe said >> handleSave >> agGridApiGlobal:', agGridApiGlobal);

    if (agGridApiGlobal) {
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
        if (column.filterValues.length > 0) {
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
        console.log('🐸 Pepe said >> handleSave >> selectedTemplateId 111:', selectedTemplateId);
        const template = templates.find((t) => t.template_id === selectedTemplateId);
        if (template) {
          savedTemplate = {
            ...template,
            filterModel: newFilterModel,
            columnState,
          };
          console.log('🐸 AAA 3', setPendingTemplate);

          setPendingTemplate(savedTemplate);
          agGridApiGlobal.setFilterModel(newFilterModel);
          agGridApiGlobal.applyColumnState({ state: columnState, applyOrder: true });
          setTopFilters({ ...topFilters, templates: [selectedTemplateId.toString()] });
        }
      } else {
        savedTemplate = {
          // @ts-ignore
          template_id: 'Не активен',
          template_name: 'Новый шаблон',
          user_id: null,
          filterModel: newFilterModel,
          columnState,
          isPending: true,
        };
        console.log('🐸 AAA 4', setPendingTemplate);
        setPendingTemplate(savedTemplate);
        agGridApiGlobal.setFilterModel(newFilterModel);
        console.log('🐸 Pepe said >> handleSave >> columnState 222:', columnState);
        agGridApiGlobal.applyColumnState({ state: columnState, applyOrder: true });

        setTopFilters({ ...topFilters, templates: [] });
      }

      setTimeout(() => {
        // setFilterModel(newFilterModel);
        agGridApiGlobal.setFilterModel(newFilterModel);
        console.log('🐸 Pepe said >> handleSave >> columnState 333:', columnState);
        agGridApiGlobal.applyColumnState({ state: columnState, applyOrder: true });
      }, 30);
    }

    closeModal();
  };

  const handleReset = () => {
    resetState();
  };

  const handleCancel = () => {
    resetState();
    closeModal();
  };

  const systemTemplateOptions = useMemo(() => {
    const normalize = (value: string) => value.toLocaleLowerCase().replace(/\s+/g, ' ').trim();

    const systemPriorityMatchers: Array<(name: string) => boolean> = [
      (name) =>
        name.includes('реестр рейтинговых систем') &&
        (name.includes('пурср') || name.includes('пурс')),
      (name) =>
        name.includes('реестр действующих моделей') &&
        (name.includes('пумр') || name.includes('пумрр')),
      (name) => name.includes('реестр моделей дадм'),
      (name) => name.includes('реестр моделей') && name.includes('rwa'),
    ];

    const getSystemPriorityIndex = (template: Template) => {
      const name = normalize(template.template_name);
      const idx = systemPriorityMatchers.findIndex((matcher) => matcher(name));
      return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
    };

    return templates
      .filter((t) => t.user_id === null)
      .filter((t) => typeof t.template_id === 'number' && t.template_id > 0)
      .sort((a, b) => {
        const pa = getSystemPriorityIndex(a);
        const pb = getSystemPriorityIndex(b);
        if (pa !== pb) return pa - pb;
        return a.template_name.localeCompare(b.template_name, 'ru');
      })
      .map((t) => ({ value: String(t.template_id), label: t.template_name }));
  }, [templates]);

  const userTemplateOptions = useMemo(() => {
    const all = templates
      .filter((t) => t.user_id !== null)
      .filter((t) => typeof t.template_id === 'number' && t.template_id > 0);

    const mine = all
      .filter((t) => !!t.isOwner)
      .sort((a, b) => a.template_name.localeCompare(b.template_name, 'ru'));

    const others = all
      .filter((t) => !t.isOwner)
      .sort((a, b) => a.template_name.localeCompare(b.template_name, 'ru'));

    return [...mine, ...others].map((t) => ({
      value: String(t.template_id),
      label: t.template_name,
    }));
  }, [templates]);

  return (
    <Modal
      onClose={handleCancel}
      dimension="xl"
      style={{
        width: '99%',
        maxWidth: '99%',
        height: '99%',
        maxHeight: '99%',
        padding: '10px 0 14px',
      }}
    >
      <ModalTitle style={{ padding: '0 14px 10px' }}>Управление шаблонами фильтрации</ModalTitle>
      <div
        style={{
          padding: '0 14px',
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
              <Option key="new" value="new">
                Не активен
              </Option>

              {!!systemTemplateOptions.length && (
                <OptionGroup style={{ fontSize: '12px', opacity: 0.5 }} label="Системные шаблоны">
                  {systemTemplateOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </OptionGroup>
              )}

              {!!userTemplateOptions.length && (
                <OptionGroup
                  style={{ fontSize: '12px', opacity: 0.5 }}
                  label="Пользовательские шаблоны"
                >
                  {userTemplateOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </OptionGroup>
              )}
            </Select>
          </Field>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            {/* <Button
              appearance={isEditMode ? 'primary' : 'secondary'}
              dimension="s"
              onClick={toggleEditMode}
              displayAsSquare
              icon={<EditOutline />}
              title={isEditMode ? 'Переключить в режим просмотра' : 'Переключить в режим редактирования'}
            /> */}

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
        </div>

        {children}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button appearance="secondary" dimension="s" onClick={handleReset}>
            Сбросить
          </Button>
          <Button appearance="secondary" dimension="s" onClick={handleCancel}>
            Отмена
          </Button>
          <Button appearance="primary" dimension="s" onClick={handleSave} disabled={!hasChanges()}>
            Применить
          </Button>
        </div>
      </div>
    </Modal>
  );
};

