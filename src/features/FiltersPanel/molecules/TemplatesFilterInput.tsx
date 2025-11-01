import React, { useMemo } from 'react';
import { Button } from '@admiral-ds/react-ui';

import { Template } from '@shared/api';
import { useFiltersStore } from '@shared/stores/filtersStore';
import { SELECT_TYPE, CustomSearchSelect } from '@shared/ui/organisms';
import { initialTopFilters } from '@shared/constants';

import { getGroupsOptions } from '../helpers';
import { useGlobalStore } from '../../../shared/stores/globalStore';
import { useTemplatesStore, usePanelsStore } from '../../../shared/stores';
import { useTemplateFiltersModalStoreSelected } from '../../TemplatesPanel/stores/templateFiltersModalStore';

export interface TemplatesFilterInputProps {
  templates: Template[];
  activeTemplate?: Template;
  loading?: boolean;
  error?: string;
  showLabel?: boolean;
}

export const TemplatesFilterInput = ({
  templates,
  activeTemplate,
  showLabel = true,
  loading = false,
  error = '',
}: TemplatesFilterInputProps) => {
  const { topFilters, setTopFilters, filterModel, setFilterModel, resetFilters } =
    useFiltersStore();

  const { openAddTemplatePanel } = usePanelsStore();

  const { getIsModifiedFilter } = useFiltersStore();
  const isModifiedFilter = getIsModifiedFilter();

  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const { setFiltersResetCount, agGridApi } = useGlobalStore();
  const { pendingTemplate, setPendingTemplate } = useTemplatesStore();
  const initializeFromTemplate = useTemplateFiltersModalStoreSelected.use.initializeFromTemplate();
  const resetState = useTemplateFiltersModalStoreSelected.use.resetState();
  const setResetInitialized = useTemplateFiltersModalStoreSelected.use.setResetInitialized();

  const groupedOptions = useMemo(() => {
    if (templates) {
      return getGroupsOptions(templates);
    }

    return [];
  }, [templates]);

  const handleChange = (name: string, selectValue: (string | null)[]) => {
    if (!templates) {
      return;
    }

    const newSelectedTemplate = templates.find(
      // eslint-disable-next-line camelcase
      ({ template_id }) => String(template_id) === selectValue[0],
    );

    if (newSelectedTemplate && newSelectedTemplate.filterModel) {
      setFilterModel(newSelectedTemplate.filterModel);
      setTopFilters({ ...initialTopFilters, [name]: selectValue });
    }
  };

  const handleResetFilters = () => {
    resetFilters();
    setTopFilters({ ...topFilters, templates: [] });
    setFiltersResetCount();
    resetState();
    initializeFromTemplate(undefined);
    setPendingTemplate(undefined);
    setDropdownOpen(false);
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
    setDropdownOpen(false);
  };

  const dynamicKeyForRenderSelect = templates[templates.length - 1]?.template_name;

  return (
    <CustomSearchSelect
      key={dynamicKeyForRenderSelect}
      id="templates"
      multiple={false}
      maxRowCount={1}
      label={showLabel ? 'Шаблоны фильтрации:' : undefined}
      name="templates"
      loading={loading}
      error={!!error}
      active={!!topFilters.templates.length || !!pendingTemplate}
      selectedValues={topFilters.templates.length ? topFilters.templates : []}
      options={{
        type: SELECT_TYPE.TEMPLATES,
        groups: groupedOptions,
      }}
      onChange={handleChange}
      modified={isModifiedFilter}
      pendingTemplate={pendingTemplate}
      forcedOpen={dropdownOpen}
      onChangeDropDownState={(isOpen) => setDropdownOpen(isOpen)}
      renderDropDownBottomPanel={() =>
        topFilters.templates.length ? (
          <Button onClick={handleResetFilters} dimension="s" appearance="secondary">
            Сбросить
          </Button>
        ) : (
          <Button onClick={handleOpenAddTemplatePanel} dimension="s">
            Сохранить
          </Button>
        )
      }
    />
  );
};

