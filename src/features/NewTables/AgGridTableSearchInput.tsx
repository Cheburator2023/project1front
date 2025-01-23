import * as React from 'react';
import type { ChangeEvent } from 'react';

import { SuggestInput } from '@admiral-ds/react-ui';
import type { SuggestInputProps } from '@admiral-ds/react-ui';
import { Row } from '@src/shared/types';

const initOptions = (rowData: Partial<Row>[]) => {
  const set = new Set<string>();
  rowData.forEach((item) =>
    Object.values(item).forEach((value) => {
      if (typeof value === 'string') {
        set.add(value);
      }
    }),
  );
  return Array.from(set);
};

export const AgGridTableSearchInput = React.memo(
  ({
    placeholder = 'Поиск',
    rowData,
    ...props
  }: SuggestInputProps & {
    rowData: Partial<Row>[];
  }) => {
    const [localValue, setLocalValue] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [options, setOptions] = React.useState<string[] | undefined>();

    const handleSelectOption = (option: any) => {
      setLocalValue(option);
      // eslint-disable-next-line no-console
      console.log(`Selected option - ${option}`);
      props.onChange?.(option);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.currentTarget.value;

      // Если в инпуте больше 3х символов производим запрос на поиск совпадений
      if (localValue?.length < 3 && inputValue?.length > 2) {
        setIsLoading(true);
        setOptions([]);
      }
      setLocalValue(inputValue);
      props.onChange?.(e);
    };

    // Имитация запросов на бакэнд
    React.useEffect(() => {
      if (isLoading) {
        const timeout = setTimeout(() => {
          setIsLoading(false);
          setOptions(initOptions(rowData));
        }, 300);
        return () => {
          clearTimeout(timeout);
        };
      }
    }, [isLoading, rowData]);

    return (
      <SuggestInput
        className="suggest"
        {...props}
        value={localValue}
        onInput={handleChange}
        onOptionSelect={handleSelectOption}
        options={options}
        isLoading={isLoading}
        onSearchButtonClick={handleSelectOption}
        displayClearIcon
        dropContainerClassName="dropContainerClass"
        placeholder={placeholder}
      />
    );
  },
);

