import { useState, useEffect, memo, useMemo } from 'react';
import { Button, MenuActionsPanel } from '@admiral-ds/react-ui';
import styled from 'styled-components';

import { useTemplateFiltersModalStoreSelected } from '../stores/templateFiltersModalStore';
import { useModelsStore } from '../../../shared/stores';
import { MultiSearchSelect } from '../atoms/MultiSearchSelect';

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
    return String(value);
  });
};

export const MSelectCellRenderer = ({ data }: any) => {
  const updateColumnFilter = useTemplateFiltersModalStoreSelected.use.updateColumnFilter();

  const { colOptionsMap } = useModelsStore();
  const [selectedValues, setSelectedValues] = useState<string[]>(
    initSelectedValues(data.filterValues),
  );
  const [initialValues, setInitialValues] = useState<string[]>(
    initSelectedValues(data.filterValues),
  );
  const [shouldRenderOptions, setShouldRenderOptions] = useState(false);

  useEffect(() => {
    const newValues = initSelectedValues(data.filterValues);
    setSelectedValues(newValues);
    setInitialValues(newValues);
  }, [data]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRenderOptions(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (newSelectedValues: string[]) => {
    setSelectedValues(newSelectedValues);
  };

  const handleApplyButtonClick = () => {
    const processedValues: any[] = selectedValues.map((value) => {
      if (value === '(Пустые значения)') {
        return null;
      }
      const originalOption = (colOptionsMap[data.colId] || []).find((opt: any) =>
        String(opt) === value || (opt === null && value === '(Пустые значения)')
      );
      return originalOption !== undefined ? originalOption : value;
    });

    updateColumnFilter(data.colId, {
      filterValues: processedValues,
    });
    setInitialValues([...selectedValues]);
  };

  const handleCancelButtonClick = () => {
    setSelectedValues([...initialValues]);
  };

  const hasChanges = useMemo(() => {
    if (selectedValues.length !== initialValues.length) return true;
    return selectedValues.some((value, index) => value !== initialValues[index]);
  }, [selectedValues, initialValues]);

  const options = useMemo(() => {
    const rawOptions = colOptionsMap[data.colId] || [];
    return rawOptions.map((option: any) => ({
      value: option,
      label: option === null ? '(Пустые значения)' : String(option)
    }));
  }, [colOptionsMap, data.colId]);

  return (
    <MSelectWrapper style={{ width: '100%', padding: '8px 0' }}>
      <MultiSearchSelect
        options={options}
        value={selectedValues}
        onChange={handleChange}
        placeholder="Выберите значения"
        isDisabled={!data.isActive || !options.length}
        isLoading={!shouldRenderOptions}
        maxMenuHeight={200}
      />
      {hasChanges && (
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button dimension="s" appearance="secondary" onClick={handleCancelButtonClick}>
            Отменить
          </Button>
          <Button dimension="s" onClick={handleApplyButtonClick}>
            Применить
          </Button>
        </div>
      )}
    </MSelectWrapper>
  );
};
