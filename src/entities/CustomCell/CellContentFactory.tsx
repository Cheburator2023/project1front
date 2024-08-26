import React from 'react';
import { format } from 'date-fns';

import { COLUMN_TYPE, Column, Row } from '@shared/types';

import { getLink } from './helpers';

interface CellContentFactoryProps {
  column: Column;
  value: string;
  row: Row;
  isCompare?: boolean;
}

export const CellContentFactory = ({
  value,
  column: { type, name },
  isCompare = false,
}: CellContentFactoryProps) => {
  const emptyValue = isCompare ? '-' : '';

  switch (type) {
    case COLUMN_TYPE.LINK: {
      const href = getLink(name, value);

      return <a href={href}>{value ?? emptyValue}</a>;
    }
    case COLUMN_TYPE.QUARTERLY_DATE:
    case COLUMN_TYPE.DATE: {
      if (!value || value === 'invalid date') {
        return emptyValue;
      }

      const date = new Date(value);

      if (date.toString() === 'Invalid Date') {
        return emptyValue;
      }

      return format(date, 'yyyy-MM-dd k:mm');
    }

    default:
      return value ?? emptyValue;
  }
};
