import { useState, useCallback, useMemo } from 'react';
import Select, { MultiValue, ActionMeta, components } from 'react-select';
import styled from 'styled-components';

const MultiValueContainer = ({ children, ...props }) => {
  const maxToShow = 1; // Show only 2 chips
  const overflow = props.getValue().length - maxToShow;

  if (props.index < maxToShow) {
    return <components.MultiValue {...(props as any)}>{children}</components.MultiValue>;
  }

  if (props.index === maxToShow) {
    return (
      <div
        style={{
          backgroundColor: '#e0e0e0',
          borderRadius: '4px',
          padding: '2px 8px',
          margin: '2px',
          fontSize: '12px',
          color: '#666',
        }}
      >
        +{overflow} more
      </div>
    );
  }

  return null;
};

interface OptionType {
  value: string;
  label: string;
}

interface MultiSearchSelectProps {
  options: OptionType[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  maxMenuHeight?: number;
  className?: string;
}

const StyledSelect = styled(Select as any)`
  .react-select__control {
    min-height: 32px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    box-shadow: none;

    &:hover {
      border-color: #9ca3af;
    }

    &--is-focused {
      border-color: #3b82f6;
      box-shadow: 0 0 0 1px #3b82f6;
    }
  }

  .react-select__value-container {
    padding: 2px 8px;
  }

  .react-select__input-container {
    margin: 0;
    padding: 0;
  }

  .react-select__placeholder {
    color: #9ca3af;
    font-size: 14px;
  }

  .react-select__multi-value {
    background-color: #e5e7eb;
    border-radius: 4px;
    margin: 2px;
  }

  .react-select__multi-value__label {
    color: #374151;
    font-size: 12px;
    padding: 2px 6px;
  }

  .react-select__multi-value__remove {
    color: #6b7280;

    &:hover {
      background-color: #dc2626;
      color: white;
    }
  }

  .react-select__menu {
    border-radius: 6px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
  }

  .react-select__option {
    font-size: 14px;

    &--is-focused {
      background-color: #f3f4f6;
    }

    &--is-selected {
      background-color: #3b82f6;
    }
  }

  .react-select__loading-indicator {
    color: #3b82f6;
  }
`;

const customComponents = {
  DropdownIndicator: (props: any) => (
    <components.DropdownIndicator {...props}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4.5 6L8 9.5L11.5 6H4.5Z" />
      </svg>
    </components.DropdownIndicator>
  ),
  MultiValue: MultiValueContainer,
  ClearIndicator: (props: any) => (
    <components.ClearIndicator {...props}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path
          d="M12 4L4 12M4 4L12 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </components.ClearIndicator>
  ),
};

export const MultiSearchSelect = ({
  options,
  value,
  onChange,
  placeholder = 'Выберите значения...',
  isDisabled = false,
  isLoading = false,
  maxMenuHeight = 200,
  className,
}: MultiSearchSelectProps) => {
  const [inputValue, setInputValue] = useState('');

  const selectedOptions = useMemo(() => {
    return options.filter((option) => value.includes(option.value));
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!inputValue) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase()),
    );
  }, [options, inputValue]);

  const handleChange = useCallback(
    (newValue: MultiValue<OptionType>, actionMeta: ActionMeta<OptionType>) => {
      const values = newValue ? newValue.map((option) => option.value) : [];
      onChange(values);
    },
    [onChange],
  );

  const handleInputChange = useCallback((newValue: string) => {
    setInputValue(newValue);
  }, []);

  return (
    <StyledSelect
      isMulti
      menuPortalTarget={document.getElementById('portal-root')}
      menuPosition="fixed"
      styles={{
        menuPortal: (base) => ({
          ...base,
          zIndex: 9999,
        }),
      }}
      value={selectedOptions}
      onChange={handleChange}
      options={filteredOptions}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isLoading={isLoading}
      isClearable
      isSearchable
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      maxMenuHeight={maxMenuHeight}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      components={customComponents}
      className={className}
      classNamePrefix="react-select"
      noOptionsMessage={() => 'Нет доступных опций'}
      loadingMessage={() => 'Загрузка...'}
    />
  );
};

