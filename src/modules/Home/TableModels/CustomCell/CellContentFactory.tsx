import React from 'react';

import { COLUMN_TYPE, Column, Row } from '../types';
import { getLink } from './helpers';
import { format } from 'date-fns';

interface CellContentFactoryProps {
  column: Column;
  value: string;
  row: Row;
}

export const CellContentFactory = ({ value, column: { type, name } }: CellContentFactoryProps) => {
  switch (type) {
    case COLUMN_TYPE.LINK: {
      const href = getLink(name, value);

      return <a href={href}>{value}</a>;
    }
    case COLUMN_TYPE.QUARTERLY_DATE:
    case COLUMN_TYPE.DATE: {
      if (!value || value === 'invalid date') {
        return '';
      }

      const date = new Date(value);

      if (date.toString() === 'Invalid Date') {
        return '';
      }

      return format(date, 'yyyy-MM-dd k:mm');
    }

    default:
      return value;
  }
};
