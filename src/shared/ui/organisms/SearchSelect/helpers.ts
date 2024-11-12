import { EMPTY_OPTION, NOT_NULL_OPTION } from './constants';
import { OptionsFactoryProps, SELECT_TYPE, SelectOption, SelectTemplatesOptions } from './types';

export function findAllNestedOptionsRecursively(__options: SelectOption[], __id: string): string[] {
  const nestedIds: string[] = [];

  function recursiveSearch(_id: string) {
    __options.forEach((option) => {
      if (option.value === _id) {
        if (option.nestedValueIds) {
          nestedIds.push(...option.nestedValueIds.map(String));
          option.nestedValueIds.forEach((nestedId) => recursiveSearch(String(nestedId)));
        }
      }
    });
  }

  recursiveSearch(__id);

  return nestedIds;
}

export const byMainOptions = (value: string) =>
  value !== NOT_NULL_OPTION.value && value !== EMPTY_OPTION.value;

export const getOptionsValues = (options: OptionsFactoryProps, mainOptionsOnly = false) => {
  if (options.type === SELECT_TYPE.STRING) {
    const optionsValues = options.options.map((option) => option.value);

    if (mainOptionsOnly) {
      return optionsValues.filter(byMainOptions);
    }

    return optionsValues;
  }

  return [];
};

const filterOptionValueBySearchString = (optionValue: string, searchString: string) =>
  optionValue.toLocaleLowerCase().split(searchString).length > 1;

export const checkForUniqueValue = (options: OptionsFactoryProps, searchString: string) => {
  if (options.type === SELECT_TYPE.TEMPLATES) {
    return options.groups.some((group) =>
      group.options.map(({ value }) => value).includes(searchString),
    );
  }

  return options.options.map(({ value }) => value).includes(searchString);
};

export const getFilteredOptionsBySearch = (
  options: OptionsFactoryProps,
  searchString: string,
): OptionsFactoryProps => {
  const loweCaseSearchString = searchString.toLocaleLowerCase();

  if (options.type === SELECT_TYPE.TEMPLATES) {
    const filteredOptions = options.groups.reduce((prevValue, groupOptions) => {
      const filteredGroupOptions = groupOptions.options.filter((option) =>
        filterOptionValueBySearchString(option.text, loweCaseSearchString),
      );

      if (filteredGroupOptions.length) {
        return [...prevValue, { ...groupOptions, items: filteredGroupOptions }];
      }

      return prevValue;
    }, [] as SelectTemplatesOptions);

    return {
      type: SELECT_TYPE.TEMPLATES,
      groups: filteredOptions,
    };
  }

  if (options.type === SELECT_TYPE.TAGS) {
    return {
      type: SELECT_TYPE.TAGS,
      options: options.options.filter((option) =>
        filterOptionValueBySearchString(option.text, loweCaseSearchString),
      ),
    };
  }

  return {
    type: SELECT_TYPE.STRING,
    options: options.options
      .filter((option) => filterOptionValueBySearchString(option.text, loweCaseSearchString))
      .sort(),
  };
};

export const getPlaceholder = (loading?: boolean, error?: boolean) => {
  if (error) {
    return 'Не выбрано';
  }

  if (loading) {
    return 'Загрузка...';
  }

  return 'Не выбрано';
};

