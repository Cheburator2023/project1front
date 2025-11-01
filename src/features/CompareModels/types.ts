import { Column, Row } from '@shared/types';

import { Template } from '@shared/api/types';

export interface TableModelsProps {
  rowList: Array<Partial<Row>>;
  columnList: Column[];
  page: number;
  pageSize: number;
  searchString: string;
  onActionCell: (
    action: 'edit' | 'history',
    rowId: string,
    cellName: keyof Row,
  ) => void;
  updateRowsCount: (newRowsCount: number) => void;
  setCurrentPage: (newPage: number) => void;
  templates?: Template[];
  loading?: boolean;
  error?: string | null;
}

export type TableChangeProps = Omit<TableModelsProps, 'onActionCell'>;
