import { useState, useEffect } from 'react';
import { Button, MenuActionsPanel, Option, Select } from '@admiral-ds/react-ui';
import styled from 'styled-components';

import { useTemplateFiltersModalStoreSelected } from '../stores/templateFiltersModalStore';
import { useModelsStore } from '../../../shared/stores';

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

const initSelectedValues = (filterValues: any) => {
  const values = filterValues || [];
  return values.map((value: any) => {
    if (value === null) {
      return '(Пустые значения)';
    }
    return value;
  });
};

export const MSelectCellRenderer = ({ data }: any) => {
  console.log('🐸 Pepe said >> MSelectCellRenderer >> data:', data);

  const updateColumnFilter = useTemplateFiltersModalStoreSelected.use.updateColumnFilter();

  const { colOptionsMap } = useModelsStore();
  const [selectedValues, setSelectedValues] = useState<string[]>(initSelectedValues(data.filterValues));
  const [shouldRenderOptions, setShouldRenderOptions] = useState(false);

  useEffect(() => {
    setSelectedValues(initSelectedValues(data.filterValues));
  }, [data]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRenderOptions(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

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

  const options = colOptionsMap[data.colId];

  return (
    <MSelectWrapper style={{ width: '100%', padding: '8px 0' }}>
      <Select
        multiple
        dimension="s"
        disabled={!data.isActive || !options.length}
        mode="searchSelect"
        placeholder="Выберите значения"
        value={selectedValues}
        onChange={handleChange}
        style={{ width: '100%' }}
        virtualScroll={{ itemHeight: 'auto' }}
        maxRowCount={1}
        minRowCount={1}
        isLoading={!shouldRenderOptions}
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
        {shouldRenderOptions &&
          options?.map((option) => (
            <Option key={option} value={option}>
              {option}
            </Option>
          ))}
      </Select>
    </MSelectWrapper>
  );
};

