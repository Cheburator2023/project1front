import { useState, useEffect } from 'react';
import { Button, MenuActionsPanel, Option, Select } from '@admiral-ds/react-ui';
import styled from 'styled-components';

import { useTemplateFiltersModalStore } from '../stores/templateFiltersModalStore';
import { useModelsStore } from '../../../shared/stores';
import { useDeepEffect } from '../../../shared/hooks/useDeepEffect';

const MSelectWrapper = styled('div')`
  & .close-button {
    display: none;
  }

  & .counter div div {
    pointer-events: none;
  }
  & .counter div {
    pointer-events: none;
  }
  & .chip {
    padding-right: 8px;
  }
`;

const initSelectedValues = (data: any) => {
  const values = data.filterValues || [];
  return values.map((value: any) => {
    if (value === null) {
      return '(Пустые значения)';
    }
    return value;
  });
};

export const MSelectCellRenderer = ({ data }: any) => {
  const { updateColumnFilter } = useTemplateFiltersModalStore();
  const { colOptionsMap, hasEmptyValues } = useModelsStore();
  const [selectedValues, setSelectedValues] = useState<string[]>(initSelectedValues(data));
  const [availableOptions, setAvailableOptions] = useState<string[]>([]);

  useEffect(() => {
    setSelectedValues(initSelectedValues(data));
  }, [initSelectedValues, data]);

  useDeepEffect(() => {
    const computedOptions = () => {
      if (!data?.colId) {
        return [];
      }

      const options = colOptionsMap[data.colId];

      return options;
    };

    setAvailableOptions(computedOptions());
  }, [data?.colId]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = e.target.selectedOptions;
    const newSelectedValues = Array.from(selectedOptions).map((option) => option.value);
    setSelectedValues(newSelectedValues);
  };

  const handleApplyButtonClick = () => {
    const processedValues: any[] = selectedValues.map((value) => {
      if (value === '(Пустые значения)') {
        return null;
      }
      return value;
    });

    updateColumnFilter(data.colId, {
      filterValues: processedValues,
    });
  };

  return (
    <MSelectWrapper style={{ width: '100%', padding: '8px 0' }}>
      <Select
        multiple
        dimension="s"
        // disabled={!data.isActive || !availableOptions.length}
        mode="searchSelect"
        placeholder="Выберите значения"
        value={selectedValues}
        onChange={handleChange}
        style={{ width: '100%' }}
        maxRowCount={1}
        minRowCount={1}
        renderDropDownBottomPanel={() => {
          return (
            <MenuActionsPanel dimension="s">
              <Button dimension="s" onClick={handleApplyButtonClick}>
                Применить
              </Button>
            </MenuActionsPanel>
          );
        }}
      >
        {availableOptions.map((option) => (
          <Option key={option} value={option}>
            {option}
          </Option>
        ))}
      </Select>
    </MSelectWrapper>
  );
};

