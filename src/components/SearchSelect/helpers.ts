import { OptionsFactoryProps, SELECT_TYPE, SelectTemplatesOptions } from './types';

export const getOptionsValues = (options: OptionsFactoryProps) => {
  if (options.type !== SELECT_TYPE.TEMPLATES) {
    return options.options.map(({ value }) => value);
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
    options: options.options.filter((option) =>
      filterOptionValueBySearchString(option.text, loweCaseSearchString),
    ),
  };
};

export const getPlaceholder = (loading?: boolean, error?: boolean) => {
  if (error) {
    return 'Ошибка загрузки';
  }

  if (loading) {
    return 'Загрузка...';
  }

  return 'Не выбрано';
};
