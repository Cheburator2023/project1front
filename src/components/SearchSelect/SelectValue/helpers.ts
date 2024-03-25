import { NOT_NULL_OPTION } from '../constants';
import { SelectStringOptions } from '../types';

const getMainOptionsTexts = (options: SelectStringOptions, selectedValues: string[]) =>
  options.reduce((prevValue, option) => {
    if (selectedValues.includes(option.value)) {
      return [...prevValue, option.text];
    }

    return prevValue;
  }, [] as Array<string>);

const getSelectedValuesString = (
  options: SelectStringOptions,
  selectedValues: string[],
  selectedAllValues: boolean,
) => {
  if (selectedAllValues) {
    return 'Все';
  }

  const selectedMainOptionsString = getMainOptionsTexts(options, selectedValues).join(', ');

  if (selectedValues.includes(NOT_NULL_OPTION.value)) {
    if (selectedMainOptionsString) {
      return `${NOT_NULL_OPTION.text}, ${selectedMainOptionsString}`;
    }

    return NOT_NULL_OPTION.text;
  }

  return selectedMainOptionsString;
};

export { getSelectedValuesString };
