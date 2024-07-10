import React, { useContext, useMemo } from 'react';
import { Button } from '@admiral-ds/react-ui';
import { Template } from 'src/api/types';
import { SELECT_TYPE } from 'src/components/SearchSelect/types';

import { getGroupsOptions } from './helpers';

import { CustomSearchSelect } from '../styles';
import { FiltersContext } from '../../FiltersContext';
import { initialColumnsFilters } from '../../constants';
import { initialTopFilters } from '../constants';
import { RIGHT_PANEL_TYPE } from '../../types';

interface TemplatesFilterProps {
  templates: Template[];
  loading?: boolean;
  error?: string;
  showLabel?: boolean;
  updateRightPanelType: (value: React.SetStateAction<RIGHT_PANEL_TYPE | null>) => void;
}

export const TemplatesFilter = ({
  templates,
  showLabel = true,
  loading = false,
  error = '',
  updateRightPanelType,
}: TemplatesFilterProps) => {
  const { topFilters, columnsFilters, onChangeTopFilters, onChangeColumnsFilters } =
    useContext(FiltersContext);

  const groupedOptions = useMemo(() => {
    if (templates) {
      return getGroupsOptions(templates);
    }

    return [];
  }, [templates]);

  const handleChange = (name: string, selectValue: string[]) => {
    if (!templates) {
      return;
    }

    const newSelectedTemplate = templates.find(
      // eslint-disable-next-line camelcase
      ({ template_id }) => String(template_id) === selectValue[0],
    );

    if (newSelectedTemplate && newSelectedTemplate.template_value) {
      onChangeColumnsFilters({ ...newSelectedTemplate.template_value });
      onChangeTopFilters({ ...initialTopFilters, [name]: selectValue });
    }
  };

  const handleResetFilters = () => {
    onChangeColumnsFilters(initialColumnsFilters);
    onChangeTopFilters(initialTopFilters);
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
      active={!!topFilters.templates.length}
      selectedValues={topFilters.templates.length ? topFilters.templates : undefined}
      options={{
        type: SELECT_TYPE.TEMPLATES,
        groups: groupedOptions,
      }}
      onChange={handleChange}
      renderDropDownBottomPanel={() =>
        !!topFilters.templates.length ? (
          <Button onClick={handleResetFilters} dimension="s" appearance="secondary">
            Сбросить
          </Button>
        ) : (
          <Button onClick={() => updateRightPanelType(RIGHT_PANEL_TYPE.ADD_TEMPLATE)} dimension="s">
            Сохранить
          </Button>
        )
      }
    />
  );
};
