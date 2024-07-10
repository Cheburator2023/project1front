import { EMPTY_OPTION, NOT_NULL_OPTION } from '../constants';
import { byMainOptions } from '../helpers';
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
  const optionsValues = options.map((option) => option.value);
  const selectedMainOptions = selectedValues.filter(byMainOptions);

  if (selectedAllValues && optionsValues.length === selectedMainOptions.length) {
    return 'Все';
  }

  const selectedMainOptionsString = getMainOptionsTexts(options, selectedValues).join(', ');

  if (
    selectedValues.includes(NOT_NULL_OPTION.value) &&
    selectedValues.includes(EMPTY_OPTION.value)
  ) {
    if (selectedMainOptionsString) {
      return `${NOT_NULL_OPTION.text}, ${EMPTY_OPTION.text}, ${selectedMainOptionsString}`;
    }

    return `${NOT_NULL_OPTION.text}, ${EMPTY_OPTION.text}`;
  }

  if (selectedValues.includes(NOT_NULL_OPTION.value)) {
    if (selectedMainOptionsString) {
      return `${NOT_NULL_OPTION.text}, ${selectedMainOptionsString}`;
    }

    return NOT_NULL_OPTION.text;
  }

  if (selectedValues.includes(EMPTY_OPTION.value)) {
    if (selectedMainOptionsString) {
      return `${EMPTY_OPTION.text}, ${selectedMainOptionsString}`;
    }

    return EMPTY_OPTION.text;
  }

  return selectedMainOptionsString;
};

export { getSelectedValuesString };
