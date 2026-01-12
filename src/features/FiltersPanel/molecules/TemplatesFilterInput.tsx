import React, { useMemo } from 'react';
import { Button, Modal, ModalTitle } from '@admiral-ds/react-ui';

import { Template } from '@shared/api';
import { useFiltersStore } from '@shared/stores/filtersStore';
import { SELECT_TYPE, CustomSearchSelect } from '@shared/ui/organisms';
import { initialTopFilters } from '@shared/constants';
import styled from 'styled-components';

import { useGlobalStore } from '../../../shared/stores/globalStore';
import { useTemplatesStore, usePanelsStore } from '../../../shared/stores';
import { useTemplateFiltersModalStoreSelected } from '../../TemplatesPanel/stores/templateFiltersModalStore';
import { Flexbox } from '../../../shared/ui/atoms';
import { getGroupsOptions } from '../helpers';

export interface TemplatesFilterInputProps {
  templates: Template[];
  activeTemplate?: Template;
  loading?: boolean;
  error?: string;
  showLabel?: boolean;
}

export const TemplatesFilterInput = ({
  templates,
  showLabel = true,
  loading = false,
  error = '',
}: TemplatesFilterInputProps) => {
  const { topFilters, setTopFilters, setFilterModel, resetFilters } = useFiltersStore();

  const { openAddTemplatePanel } = usePanelsStore();

  const { getIsModifiedFilter } = useFiltersStore();
  const isModifiedFilter = getIsModifiedFilter();

  const [modalOpen, setModalOpen] = React.useState(false);

  const [selectedSystemTemplateId, setSelectedSystemTemplateId] = React.useState<string[]>([]);
  const [selectedUserTemplateId, setSelectedUserTemplateId] = React.useState<string[]>([]);

  const { setFiltersResetCount, agGridApi } = useGlobalStore();
  const { pendingTemplate, setPendingTemplate } = useTemplatesStore();
  const initializeFromTemplate = useTemplateFiltersModalStoreSelected.use.initializeFromTemplate();
  const resetState = useTemplateFiltersModalStoreSelected.use.resetState();
  const setResetInitialized = useTemplateFiltersModalStoreSelected.use.setResetInitialized();

  const normalize = (value: string) => value.toLocaleLowerCase().replace(/\s+/g, ' ').trim();

  const groupedOptions = useMemo(() => {
    if (templates) {
      return getGroupsOptions(templates);
    }

    return [];
  }, [templates]);

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

  const systemTemplates = useMemo(
    () =>
      [...templates]
        .filter((t) => t.user_id === null)
        .sort((a, b) => {
          const pa = getSystemPriorityIndex(a);
          const pb = getSystemPriorityIndex(b);
          if (pa !== pb) return pa - pb;
          return a.template_name.localeCompare(b.template_name, 'ru');
        }),
    [templates],
  );

  const userTemplates = useMemo(() => {
    const all = templates.filter((t) => t.user_id !== null);

    const mine = all
      .filter((t) => !!t.isOwner)
      .sort((a, b) => a.template_name.localeCompare(b.template_name, 'ru'));
    const others = all
      .filter((t) => !t.isOwner)
      .sort((a, b) => a.template_name.localeCompare(b.template_name, 'ru'));

    return [...mine, ...others];
  }, [templates]);

  const systemSelectOptions = useMemo(
    () =>
      systemTemplates.map((t) => ({
        value: String(t.template_id),
        text: t.template_name,
      })),
    [systemTemplates],
  );

  const userSelectOptions = useMemo(
    () =>
      userTemplates.map((t) => ({
        value: String(t.template_id),
        text: t.template_name,
      })),
    [userTemplates],
  );

  const selectedTemplateLabel = useMemo(() => {
    const id = topFilters.templates?.[0];
    if (!id) return '';
    return templates.find((t) => String(t.template_id) === id)?.template_name ?? '';
  }, [templates, topFilters.templates]);

  const applyTemplateById = (templateId?: string) => {
    if (!templateId) return;

    const newSelectedTemplate = templates.find(
      ({ template_id }) => String(template_id) === templateId,
    );

    if (newSelectedTemplate && newSelectedTemplate.filterModel) {
      setFilterModel(newSelectedTemplate.filterModel);
      setTopFilters({ ...initialTopFilters, templates: [templateId] });
    }
  };

  const handleChangeSystem = (_name: string, selectValue: string[]) => {
    setSelectedSystemTemplateId(selectValue);
    if (selectValue.length) {
      setSelectedUserTemplateId([]);
    }
  };

  const handleChangeUser = (_name: string, selectValue: string[]) => {
    setSelectedUserTemplateId(selectValue);
    if (selectValue.length) {
      setSelectedSystemTemplateId([]);
    }
  };

  const handleResetFilters = () => {
    resetFilters();
    setTopFilters({ ...topFilters, templates: [] });
    setFiltersResetCount();
    resetState();
    initializeFromTemplate(undefined);
    setPendingTemplate(undefined);
    setModalOpen(false);
    setSelectedSystemTemplateId([]);
    setSelectedUserTemplateId([]);
    // Reset column state (order, width, visibility, sort, pin)
    agGridApi?.resetColumnState();
    // Reset all filters
    agGridApi?.setFilterModel(null);
    // Optional: Reset column groups
    agGridApi?.resetColumnGroupState();
    // Reset the resetInitialized flag
    setResetInitialized(false);
  };

  const handleOpenAddTemplatePanel = () => {
    openAddTemplatePanel();
    setModalOpen(false);
  };

  React.useEffect(() => {
    if (!modalOpen) return;

    const activeTemplateId = topFilters.templates?.[0];
    if (!activeTemplateId) {
      setSelectedSystemTemplateId([]);
      setSelectedUserTemplateId([]);
      return;
    }

    const current = templates.find((t) => String(t.template_id) === activeTemplateId);

    if (current?.user_id === null) {
      setSelectedSystemTemplateId([activeTemplateId]);
      setSelectedUserTemplateId([]);
    } else {
      setSelectedUserTemplateId([activeTemplateId]);
      setSelectedSystemTemplateId([]);
    }
  }, [modalOpen, templates, topFilters.templates]);

  const handleApply = () => {
    const systemId = selectedSystemTemplateId?.[0];
    const userId = selectedUserTemplateId?.[0];
    const templateId = systemId || userId;

    applyTemplateById(templateId);
    setModalOpen(false);
  };

  return (
    <>
      <StyledButton
        onClick={(e) => {
          console.log('🐸 Pepe said >> TemplatesFilterInput >> e:', e);

          e.stopPropagation();
          e.preventDefault();
          setModalOpen(true);
        }}
        role="button" // Tells screen readers it acts like a button
        tabIndex={0}
        style={{
          padding: 0,
          cursor: 'pointer',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: 'inherit',
        }}
      >
        <CustomSearchSelect
          id="templates"
          fake
          multiple={false}
          maxRowCount={1}
          label={showLabel ? 'Шаблоны фильтрации:' : undefined}
          name="templates_fake"
          error={!!error}
          active={!!topFilters.templates.length || !!pendingTemplate}
          selectedValues={topFilters.templates.length ? topFilters.templates : []}
          options={{
            type: SELECT_TYPE.TEMPLATES,
            groups: groupedOptions,
          }}
          onChange={() => {}}
          modified={isModifiedFilter}
          pendingTemplate={pendingTemplate}
          // forcedOpen={dropdownOpen}
          // onChangeDropDownState={(isOpen) => setDropdownOpen(isOpen)}
        />
      </StyledButton>

      {modalOpen && (
        <Modal
          onClose={() => setModalOpen(false)}
          dimension="l"
          style={{
            // width: '720px',
            maxWidth: '90vw',
          }}
        >
          <ModalTitle>Шаблоны фильтрации</ModalTitle>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 24px' }}>
            <Flexbox>
              <CustomSearchSelect
                id="systemTemplates"
                multiple={false}
                maxRowCount={1}
                label="Системные шаблоны:"
                name="systemTemplates"
                loading={loading}
                error={!!error}
                active={!!selectedSystemTemplateId.length}
                selectedValues={selectedSystemTemplateId}
                options={{
                  type: SELECT_TYPE.STRING,
                  options: systemSelectOptions,
                }}
                onChange={handleChangeSystem}
                modified={isModifiedFilter}
                pendingTemplate={pendingTemplate}
              />

              <CustomSearchSelect
                id="userTemplates"
                multiple={false}
                maxRowCount={1}
                label="Пользовательские шаблоны:"
                name="userTemplates"
                loading={loading}
                error={!!error}
                active={!!selectedUserTemplateId.length}
                selectedValues={selectedUserTemplateId}
                options={{
                  type: SELECT_TYPE.STRING,
                  options: userSelectOptions,
                }}
                onChange={handleChangeUser}
                modified={isModifiedFilter}
                pendingTemplate={pendingTemplate}
              />
            </Flexbox>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button appearance="secondary" dimension="s" onClick={() => setModalOpen(false)}>
                Отмена
              </Button>
              {!!topFilters.templates.length && (
                <Button appearance="secondary" dimension="s" onClick={handleResetFilters}>
                  Сбросить
                </Button>
              )}
              <Button appearance="secondary" dimension="s" onClick={handleOpenAddTemplatePanel}>
                Сохранить
              </Button>
              <Button
                appearance="primary"
                dimension="s"
                onClick={handleApply}
                disabled={!selectedSystemTemplateId?.[0] && !selectedUserTemplateId?.[0]}
              >
                Применить
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

const StyledButton = styled('div')`
  pointer-events: all;

  & > * {
    pointer-events: none;
  }
`;

