import React from 'react';

import { COLUMN_TYPE, Row } from '../types';
import { getLink } from './helpers';

interface CellContentFactoryProps {
  value: string;
  name: keyof Row;
  type: COLUMN_TYPE;
}

export const CellContentFactory = ({ value, name, type }: CellContentFactoryProps) => {
  switch (type) {
    case COLUMN_TYPE.LINK: {
      const href = getLink(name, value);

      return <a href={href}>{value}</a>;
    }

    default:
      return value;
  }
};
