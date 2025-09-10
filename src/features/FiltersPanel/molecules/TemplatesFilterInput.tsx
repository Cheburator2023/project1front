import React, { useMemo } from 'react';
import { Button } from '@admiral-ds/react-ui';

import { Template } from '@shared/api';
import { useFiltersStore } from '@shared/stores/filtersStore';
import { SELECT_TYPE, CustomSearchSelect } from '@shared/ui/organisms';
import { initialTopFilters, RIGHT_PANEL_TYPE } from '@shared/constants';

import { getGroupsOptions } from '../helpers';
import { useGlobalStore } from '../../../shared/stores/globalStore';
import { useTemplatesStore } from '../../../shared/stores';

export interface TemplatesFilterInputProps {
  templates: Template[];
  activeTemplate?: Template;
  loading?: boolean;
  error?: string;
  showLabel?: boolean;
  setRightPanelType: (newRightPanelType: RIGHT_PANEL_TYPE | null) => void;
}

export const TemplatesFilterInput = ({
  templates,
  activeTemplate,
  showLabel = true,
  loading = false,
  error = '',
  setRightPanelType,
}: TemplatesFilterInputProps) => {
  const { topFilters, setTopFilters, filterModel, setFilterModel, resetFilters } =
    useFiltersStore();

  const { getIsModifiedFilter } = useFiltersStore();
  const isModifiedFilter = getIsModifiedFilter();

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

  const { setFiltersResetCount } = useGlobalStore();
  const { pendingTemplate } = useTemplatesStore();

  const handleResetFilters = () => {
    resetFilters();
    setTopFilters({ ...topFilters, templates: [] });
    setFiltersResetCount();
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
      renderDropDownBottomPanel={() =>
        activeTemplate ? (
          <Button onClick={handleResetFilters} dimension="s" appearance="secondary">
            Сбросить
          </Button>
        ) : (
          <Button onClick={() => setRightPanelType(RIGHT_PANEL_TYPE.ADD_TEMPLATE)} dimension="s">
            Сохранить
          </Button>
        )
      }
    />
  );
};

