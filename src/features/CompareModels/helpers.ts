import { getISODateFormat } from '@shared/helpers';

import _ from 'lodash';
import { Column, Row } from '@shared/types';
import { CompareModelsResponseType } from '@shared/api';
import { COMPARE_COLOR } from './constants';

export const compareValues = (
  value1: string | null | undefined,
  value2: string | null | undefined,
) => {
  return value1 !== value2 ? COMPARE_COLOR : undefined;
};

export const prepareFetchParams = (firstDate: string, secondDate: string) => {
  return {
    firstDate: getISODateFormat(firstDate),
    secondDate: getISODateFormat(secondDate),
  };
};

export const processFetchData = async (
  res: CompareModelsResponseType,
  columnList: Column[],
  compareOnlyChanged: boolean,
) => {
  const { cards } = res.data;



  const rowNames = columnList.map((column) => {
    return column.name;
  });


  const formattedRows = Object.entries(cards).flatMap(([key, [row1, row2]]) => {
    const preparedRow1 = row1 || rowNames;
    const preparedRow2 = row2 || rowNames;

    if (
      compareOnlyChanged &&
      _.isEqual(
        Object.entries(preparedRow1).filter((row) => rowNames.includes(row[0] as keyof Row)),
        Object.entries(preparedRow2).filter((row) => rowNames.includes(row[0] as keyof Row)),
      )
    )
      return [];

    return [
      {
        ...preparedRow1,
        // TODO: fix types
        // @ts-ignore
        model_version: preparedRow1?.model_version?.toString(), // TODO: remove after fix on backend
        id: `${key}-1`,
        key: `${key}-1`,
        comparisonKey: key,
        hover: true,
      },
      {
        ...preparedRow2,
        // TODO: fix types
        // @ts-ignore
        model_version: preparedRow2?.model_version?.toString(), // TODO: remove after fix on backend
        id: `${key}-2`,
        key: `${key}-2`,
        comparisonKey: key,
        hover: true,
      },
    ];
  });

  return Promise.resolve(formattedRows);
};
