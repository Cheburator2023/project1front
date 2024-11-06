import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { Button, Field } from '@admiral-ds/react-ui';

import styled from 'styled-components';
import { OptionsFactoryProps, SELECT_TYPE, SelectOption } from './types';
import { OptionsFactory } from './OptionsFactory';
import { SelectValue } from './SelectValue';
import {
  byMainOptions,
  checkForUniqueValue,
  findAllNestedOptionsRecursively,
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
import { INPUT_TYPE } from '../InputFactory';

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
  extraText?: string | React.ReactNode;
  multiple?: boolean;
  addNewOptionEnabled?: boolean;
  selectNotNullEnabled?: boolean;
  selectEmptyEnabled?: boolean;
  selectAllEnabled?: boolean;
  renderDropDownBottomPanel?: () => React.ReactNode;
  onAddNewOption?: (newOptionValue: string) => void;
  enableParents?: boolean;
  selectType?: INPUT_TYPE;
}

export const SearchSelect = ({
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
  selectType,
  renderDropDownBottomPanel,
  onAddNewOption,
}: SearchSelectProps) => {
  const optionsValues = useMemo(() => getOptionsValues(options), [options]);
  const { options: _options }: { options: SelectOption[] } = options as any;
  const isTree = _options?.some((option) => option.nestedValues || option.parentsValues);

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
    const currentId = e.target.value;
    const selectedOptions = e.target.selectedOptions;
    let newSelectedValues = Array.from(selectedOptions).map((option) => option.value);
    const { options: _options }: { options: SelectOption[] } = options as any;

    if (!isTree) {
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
    } else if (!currentId) {
      onChange(name, newSelectedValues);
    }
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

  const onClickItemHandler = (selectedOption: SelectOption, _selectedValues?: string[]) => {
    let newSelectedValues = _selectedValues || [];

    const currentId = selectedOption.value;
    const allCurrentlyNested = findAllNestedOptionsRecursively(_options, currentId);

    if (multiple) {
      if (selectType === INPUT_TYPE.SELECT) {
        // if type is SELECT and is nested/parented make single selection with all the parents
        const allCurrentParents = selectedOption.parentsValueIds || [];
        newSelectedValues = [...allCurrentParents, currentId].map(
          (value) => value.toString() || '',
        );
        onChange(name, newSelectedValues);
      } else if (newSelectedValues.includes(currentId)) {
        // if clicked option is off - find all nested options and remove them and remove self
        newSelectedValues = newSelectedValues
          .filter((value) => value !== currentId)
          .filter((value) => !allCurrentlyNested.includes(value));
        onChange(name, newSelectedValues);
      } else {
        // if clicked option is on - find all nested options and add them and self
        newSelectedValues = [...newSelectedValues, ...allCurrentlyNested, currentId].filter(
          (value) => value,
        );
        onChange(name, newSelectedValues);
      }
    } else {
      newSelectedValues = [...allCurrentlyNested, currentId].filter((value) => value);
      onChange(name, newSelectedValues);
    }
  };

  return (
    <div
      className={className}
      onClick={handlePreventEvent}
      onKeyDown={handlePreventEvent}
      role="presentation"
    >
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
            onClickItem={onClickItemHandler}
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

