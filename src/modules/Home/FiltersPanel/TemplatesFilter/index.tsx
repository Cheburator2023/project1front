import React, { useContext, useMemo } from 'react';
import { Button } from '@admiral-ds/react-ui';
import { API_ROUTES, useFetch } from 'src/api';
import { TemplatesResponseType } from 'src/api/types';
import { SELECT_TYPE } from 'src/components/SearchSelect/types';

import { getGroupsOptions } from './helpers';

import { CustomSearchSelect } from '../styles';
import { FiltersContext } from '../../FiltersContext';
import { initialColumnsFilters } from '../../constants';
import { initialTopFilters } from '../constants';

export const TemplatesFilter = () => {
  const { responseData, loading, error } = useFetch<TemplatesResponseType>({
    apiRoute: API_ROUTES.TEMPLATES,
    // mockedResponse: mockedTemplatesResponse,
  });

  const { topFilters, columnsFilters, onChangeTopFilters, onChangeColumnsFilters } =
    useContext(FiltersContext);

  const groupedOptions = useMemo(() => {
    if (responseData?.data) {
      return getGroupsOptions(responseData.data);
    }

    return [];
  }, [responseData]);

  const handleChange = (name: string, selectValue: string[]) => {
    const templates = responseData?.data;

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

  const showResetFiltersButton =
    Object.keys(initialColumnsFilters).length !== Object.keys(columnsFilters).length;

  if (loading) {
    return null;
  }

  return (
    <CustomSearchSelect
      id="templates"
      multiple={false}
      maxRowCount={1}
      label="Шаблоны фильтрации:"
      name="templates"
      loading={loading}
      error={!!error}
      active={!!topFilters.templates.length}
      selectedValues={topFilters.templates}
      options={{
        type: SELECT_TYPE.TEMPLATES,
        groups: groupedOptions,
      }}
      onChange={handleChange}
      renderDropDownBottomPanel={() =>
        showResetFiltersButton && (
          <Button onClick={handleResetFilters} dimension="s" appearance="secondary">
            Сбросить
          </Button>
        )
      }
    />
  );
};
