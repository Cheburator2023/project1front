import { useState, useMemo } from 'react';
import { Modal, ModalTitle, TextField, Tag, InputField } from '@admiral-ds/react-ui';
import { ReactComponent as SearchOutline } from '@admiral-ds/icons/build/system/SearchOutline.svg';
import styled from 'styled-components';
import { format, isValid } from 'date-fns';
import { COLUMN_TYPE } from '../../../shared/types';

const ModalContent = styled('div')`
  padding: 24px;
  max-height: 500px;
  overflow-y: auto;
`;

const SearchContainer = styled('div')`
  margin-bottom: 16px;
`;

const ValuesContainer = styled('div')`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 350px;
  overflow-y: auto;
  padding: 8px 0;
`;

const EmptyState = styled('div')`
  color: #8a96a8;
  font-style: italic;
  text-align: center;
  padding: 32px 0;
`;

const ResultsCount = styled('div')`
  color: #717681;
  font-size: 14px;
  margin-bottom: 12px;
`;

const HighlightedText = styled('span')<{ isHighlighted: boolean }>`
  background-color: ${props => props.isHighlighted ? '#fff3cd' : 'transparent'};
  color: ${props => props.isHighlighted ? '#856404' : 'inherit'};
  font-weight: ${props => props.isHighlighted ? '600' : 'normal'};
`;

interface FilterValuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  values: any[];
  columnType: string;
  columnName?: string;
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

const renderHighlightedText = (text: string, searchTerm: string) => {
  if (!searchTerm.trim()) {
    return text;
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => (
    <HighlightedText
      key={index}
      isHighlighted={regex.test(part)}
    >
      {part}
    </HighlightedText>
  ));
};

export const FilterValuesModal = ({
  isOpen,
  onClose,
  values,
  columnType,
  columnName = 'Значения фильтра'
}: FilterValuesModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const processedValues = useMemo(() => {
    if (!values || values.length === 0) {
      return [];
    }

    if (columnType === COLUMN_TYPE.DATE && values.length === 2) {
      // Handle date ranges
      const startDate = formatDateValue(values[0]);
      const endDate = formatDateValue(values[1]);
      return [`${startDate} - ${endDate}`];
    }

    // Handle other types or single dates - make unique and sort (null values first)
    const formattedValues = values.map((value: any) => formatDisplayValue(value, columnType));
    const uniqueValues = [...new Set(formattedValues)];
    return uniqueValues.sort((a, b) => {
      const isANull = a === '(Пустые значения)';
      const isBNull = b === '(Пустые значения)';
      if (isANull && !isBNull) return -1;
      if (!isANull && isBNull) return 1;
      return 0;
    });
  }, [values, columnType]);

  const filteredValues = useMemo(() => {
    if (!searchTerm.trim()) {
      return processedValues;
    }

    return processedValues.filter((value: string) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [processedValues, searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      id="filter-values-modal"
      onClose={handleClose}
      aria-labelledby="modal-title"
    >
      <ModalTitle id="modal-title">{columnName}</ModalTitle>
      <ModalContent>
        <SearchContainer>
          <InputField
            value={searchTerm}
            onChange={handleSearchChange as any}
            placeholder="Поиск значений..."
            icons={<SearchOutline />}
          />
        </SearchContainer>

        <ResultsCount>
          Найдено: {filteredValues.length} из {processedValues.length}
        </ResultsCount>

        {filteredValues.length === 0 ? (
          <EmptyState>
            {searchTerm.trim() ? 'Ничего не найдено' : 'Нет значений для отображения'}
          </EmptyState>
        ) : (
          <ValuesContainer>
            {filteredValues.map((value, index) => (
              <Tag
                key={`modal-value-${index}-${value}`}
                kind="neutral"
                statusViaBackground
              >
                {renderHighlightedText(value, searchTerm)}
              </Tag>
            ))}
          </ValuesContainer>
        )}
      </ModalContent>
    </Modal>
  );
};
