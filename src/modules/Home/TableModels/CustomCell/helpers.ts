import { isWithinInterval, addMonths, differenceInYears, addYears } from 'date-fns';
import { Row } from '../types';

const SumApp = '/sum';

const getModelAliasLink = (modelAlias: string) => {
  const [modelWithNumber, modelVersion] = modelAlias.split('-v');

  if (modelWithNumber.includes('model')) {
    const modelNumber = modelWithNumber.slice('model'.length);

    return [SumApp, '/model', `/${modelNumber}`, `/${modelVersion}`, '/main'].join('');
  }

  return '';
};

export const getLink = (columnName: keyof Row, value?: string) => {
  if (columnName === 'model_alias' && value) {
    return getModelAliasLink(value);
  }

  return '';
};

export const isDateInQuarter = (startDate: Date, dateToCheck: Date, quarter: number) =>
  isWithinInterval(dateToCheck, {
    start: quarter ? addMonths(startDate, quarter * 3) : startDate,
    end: addMonths(startDate, quarter * 3 + 3),
  });

export const getStartDateInCurrentYear = (startDate: Date) => {
  const yearsFromStartDate = differenceInYears(Date.now(), startDate);

  if (yearsFromStartDate) {
    return addYears(startDate, yearsFromStartDate);
  }

  return startDate;
};

/**
 * This is the get quarter function by title
 * @param title This is the column title (should be like 1Q)
 * @returns returns quarter that starts from 0 to 3
 */
export const getQuarterByTitle = (title: string) => {
  const titleArr = title.split('Q');

  if (titleArr[0]) {
    // Quarter should start from 0 to 3
    return Number(titleArr[0]) - 1;
  }

  return null;
};

export const getDatesFromString = (datesString?: string) => {
  return datesString?.split(',').reduce((dates, dateStr) => {
    const date = new Date(dateStr);

    if (date.toString() !== 'Invalid Date') {
      return [...dates, date];
    }

    return dates;
  }, [] as Date[]);
};
