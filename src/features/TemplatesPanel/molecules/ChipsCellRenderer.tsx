import { useMemo, useState } from 'react';
import { Tag, Button } from '@admiral-ds/react-ui';
import { format, isValid } from 'date-fns';
import styled from 'styled-components';
import { COLUMN_TYPE } from '../../../shared/types';
import { FilterValuesModal } from './FilterValuesModal';

const ChipsContainer = styled('div')`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 0;
  width: 100%;
  align-items: center;
`;

const EmptyState = styled('div')`
  color: #8a96a8;
  font-style: italic;
  padding: 8px 0;
`;

const EllipsisButton = styled(Button)`
  min-width: auto;
  padding: 4px 8px;
  height: 24px;
  font-size: 12px;
  border-radius: 12px;
  background-color: #f5f6f7;
  border: 1px solid #d5d8de;
  color: #717681;
  
  &:hover {
    background-color: #e8eaed;
    border-color: #c1c6cc;
  }
`;

interface ChipsCellRendererProps {
  data: any;
  value: any;
  node: any;
  api: any;
  columnApi: any;
  context: any;
  colDef: any;
  column: any;
  rowIndex: number;
  getValue: () => any;
  setValue: (value: any) => void;
  formatValue: (value: any) => any;
  refreshCell: () => void;
  eGridCell: HTMLElement;
  eParentOfValue: HTMLElement;
  addRenderedRowListener: (eventType: string, listener: () => void) => void;
}

const formatDateValue = (value: string | null): string => {
  if (!value) return '';
  
  try {
    const date = new Date(value);
    if (isValid(date)) {
      return format(date, 'dd.MM.yyyy');
    }
  } catch (error) {
    // If date parsing fails, return the original value
  }
  
  return value;
};

const formatDisplayValue = (value: any, type: string): string => {
  if (value === null || value === undefined) {
    return '(Пустые значения)';
  }
  
  if (type === COLUMN_TYPE.DATE) {
    return formatDateValue(String(value));
  }
  
  return String(value);
};

export const ChipsCellRenderer = (params: ChipsCellRendererProps) => {
  const { data } = params;
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const displayValues = useMemo(() => {
    if (!data.filterValues || data.filterValues.length === 0) {
      return [];
    }

    if (data.type === COLUMN_TYPE.DATE) {
      // Handle date ranges
      if (data.filterValues.length === 2) {
        const startDate = formatDateValue(data.filterValues[0]);
        const endDate = formatDateValue(data.filterValues[1]);
        return [`${startDate} - ${endDate}`];
      }
      
      // Handle single dates - make unique and sort (null values first)
      const formattedValues = data.filterValues.map((value: any) => formatDisplayValue(value, data.type));
      const uniqueValues = [...new Set(formattedValues)];
      return uniqueValues.sort((a, b) => {
        const isANull = a === '(Пустые значения)';
        const isBNull = b === '(Пустые значения)';
        if (isANull && !isBNull) return -1;
        if (!isANull && isBNull) return 1;
        return 0;
      });
    }

    // Handle other types (STRING, NUMBER, etc.) - make unique and sort (null values first)
    const formattedValues = data.filterValues.map((value: any) => formatDisplayValue(value, data.type));
    const uniqueValues = [...new Set(formattedValues)];
    return uniqueValues.sort((a, b) => {
      const isANull = a === '(Пустые значения)';
      const isBNull = b === '(Пустые значения)';
      if (isANull && !isBNull) return -1;
      if (!isANull && isBNull) return 1;
      return 0;
    });
  }, [data.filterValues, data.type]);

  const visibleValues = useMemo(() => {
    return displayValues.slice(0, 3);
  }, [displayValues]);

  const hasMoreValues = displayValues.length > 3;
  const remainingCount = displayValues.length - 3;

  const handleEllipsisClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  if (displayValues.length === 0) {
    return (
      <EmptyState>
        Фильтры не заданы
      </EmptyState>
    );
  }

  return (
    <>
      <ChipsContainer>
        {visibleValues.map((value, index) => (
          <Tag
            key={`${data.colId || 'col'}-${index}-${String(value)}`}
            kind="neutral"
            statusViaBackground
          >
            {String(value)}
          </Tag>
        ))}
        {hasMoreValues && (
          <EllipsisButton
            dimension="s"
            appearance="ghost"
            onClick={handleEllipsisClick}
          >
            +{remainingCount}
          </EllipsisButton>
        )}
      </ChipsContainer>
      
      <FilterValuesModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        values={data.filterValues || []}
        columnType={data.type}
        columnName={data.headerName || 'Значения фильтра'}
      />
    </>
  );
};