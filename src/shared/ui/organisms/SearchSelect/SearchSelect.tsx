import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { Button, Field } from '@admiral-ds/react-ui';

import { OptionsFactoryProps, SELECT_TYPE } from './types';
import { OptionsFactory } from './OptionsFactory';
import { SelectValue } from './SelectValue';
import {
  byMainOptions,
  checkForUniqueValue,
  getFilteredOptionsBySearch,
  getOptionsValues,
  getPlaceholder,
} from './helpers';
import {
  CustomSearchInput,
  CustomSelect,
  DropContainerCssMixin,
  DropDownBottomPanelContainer,
} from './styles';
import { CustomOption } from './CustomOption';
import { EMPTY_OPTION, NOT_NULL_OPTION } from './constants';
import styled from 'styled-components';

export interface SearchSelectProps {
  name: string;
  options: OptionsFactoryProps;
  virtualScrollEnabled?: boolean;
  key?: string;
  selectedValues?: string[];
  autoFocus?: boolean;
  onChange: (name: string, selectValue: string[]) => void;
  required?: boolean;
  disabled?: boolean;
  active?: boolean;
  id?: string;
  maxRowCount?: number;
  label?: string;
  className?: string;
  displayClearIcon?: boolean;
  loading?: boolean;
  error?: boolean;
  extraText?: string;
  multiple?: boolean;
  addNewOptionEnabled?: boolean;
  selectNotNullEnabled?: boolean;
  selectEmptyEnabled?: boolean;
  selectAllEnabled?: boolean;
  renderDropDownBottomPanel?: () => React.ReactNode;
  onAddNewOption?: (newOptionValue: string) => void;
  modified?: boolean;
}

export const SearchSelect = ({
  key,
  name,
  onChange,
  options,
  autoFocus,
  className,
  label,
  maxRowCount = 10,
  id,
  loading,
  error,
  extraText,
  active,
  selectedValues,
  displayClearIcon = false,
  required = false,
  disabled = false,
  multiple = true,
  virtualScrollEnabled = false,
  addNewOptionEnabled = false,
  selectNotNullEnabled = false,
  selectEmptyEnabled = false,
  selectAllEnabled = true,
  modified = false,
  renderDropDownBottomPanel,
  onAddNewOption,
}: SearchSelectProps) => {
  const optionsValues = useMemo(() => getOptionsValues(options), [options]);

  const [selectOptions, setSelectOptions] = useState(options);

  const [selectedAllValues, setSelectedAllValues] = useState(false);

  const [searchValue, setSearchValue] = useState('');

  const [forcedOpen, setForcedOpen] = useState(false);

  useEffect(() => {
    let newOptions = options;

    if (searchValue) {
      newOptions = getFilteredOptionsBySearch(options, searchValue);
    }
    setSelectOptions(newOptions);
  }, [options]);

  useEffect(() => {
    if (selectedValues && selectedValues.length) {
      // Except additional options, like "not-null"
      const selectedMainOptions = selectedValues.filter(byMainOptions);

      const isSelectAll = optionsValues.length === selectedMainOptions.length;

      setSelectedAllValues(isSelectAll);
    }
  }, [optionsValues, selectedValues]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let newSelectedValues = Array.from(e.target.selectedOptions).map((option) => option.value);

    if (selectedAllValues && newSelectedValues.length !== optionsValues?.length) {
      setSelectedAllValues(false);
    } else if (!selectedAllValues && newSelectedValues.length === optionsValues?.length) {
      setSelectedAllValues(true);
    }

    // Unselect option for single select
    if (!multiple && selectedValues?.includes(newSelectedValues[0])) {
      newSelectedValues = [];
    }

    // Add selected options that are out of the scope of the search
    if (searchValue) {
      const selectOptionsValues = getOptionsValues(selectOptions);

      const prevSelectedValues =
        selectedValues?.filter((value) => !selectOptionsValues.includes(value)) ?? [];

      newSelectedValues = [...prevSelectedValues, ...newSelectedValues];
    }

    onChange(name, newSelectedValues);
  };

  const handleChangeSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newSelectedValues: string[] = [];

    if (e.target.checked && options.type === SELECT_TYPE.STRING) {
      newSelectedValues = [...optionsValues, NOT_NULL_OPTION.value, EMPTY_OPTION.value];

      setSelectedAllValues(true);
    } else {
      setSelectedAllValues(false);
    }

    onChange(name, newSelectedValues);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchValue = e.target.value;

    const filteredSelectOptions = getFilteredOptionsBySearch(options, newSearchValue);

    setSelectOptions(filteredSelectOptions);
    setSearchValue(newSearchValue);
  };

  const handleAddNewOption = () => {
    onAddNewOption?.(searchValue);
  };

  // This handle needed for preventing blob event
  const handlePreventEvent = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement>) => {
      e.stopPropagation();
    },
    [],
  );

  const disabledAddOptionBtn = useMemo(
    () => addNewOptionEnabled && checkForUniqueValue(options, searchValue),
    [options, searchValue, addNewOptionEnabled],
  );

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div key={key} className={className} onClick={handlePreventEvent}>
      <Field
        required={required}
        status={error ? 'error' : undefined}
        extraText={extraText}
        label={label}
        id={id}
      >
        <CustomSelect
          id={id}
          disabled={disabled}
          autoFocus={autoFocus}
          maxRowCount={maxRowCount}
          className="searchSelect"
          forcedOpen={forcedOpen}
          value={selectedValues || ''}
          multiple={multiple}
          onChange={handleChange}
          displayClearIcon={displayClearIcon}
          dimension="s"
          width="100%"
          isLoading={loading}
          status={error ? 'error' : undefined}
          readOnly={loading}
          onChangeDropDownState={setForcedOpen}
          placeholder={getPlaceholder(loading, error)}
          dropContainerCssMixin={DropContainerCssMixin}
          showCheckbox={false}
          virtualScroll={virtualScrollEnabled ? { itemHeight: 'auto' } : undefined}
          // showCheckbox={options.type !== SELECT_TYPE.TAGS}
          renderSelectValue={(value) =>
            !loading && (
              <SelectValue
                options={options}
                active={active}
                selectedAllValues={selectedAllValues}
                value={value}
                modified={modified}
              />
            )
          }
          renderDropDownTopPanel={() => (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div onKeyDown={handlePreventEvent}>
              <CustomSearchInput onChange={handleSearch} value={searchValue} placeholder="Поиск" />
              {multiple && selectAllEnabled && (
                <CustomOption
                  text="Выбрать все"
                  checked={selectedAllValues}
                  onChange={handleChangeSelectAll}
                />
              )}
            </div>
          )}
          renderDropDownBottomPanel={() => (
            <DropDownBottomPanelContainer>
              {addNewOptionEnabled && (
                <Button
                  onClick={handleAddNewOption}
                  disabled={disabledAddOptionBtn}
                  dimension="s"
                  appearance="secondary"
                >
                  Добавить
                </Button>
              )}
              {renderDropDownBottomPanel?.()}
            </DropDownBottomPanelContainer>
          )}
        >
          <OptionsFactory
            optionsProps={selectOptions}
            selectNotNullEnabled={selectNotNullEnabled}
            selectEmptyEnabled={selectEmptyEnabled}
            selectedValues={selectedValues}
          />
        </CustomSelect>
      </Field>
    </div>
  );
};

export const CustomSearchSelect = styled(SearchSelect)`
  .searchSelect {
    width: 230px;
    border-radius: 4px;
    padding: 4px 8px;
    box-sizing: border-box;
    margin-right: 12px;
    align-items: center;
  }
`;
