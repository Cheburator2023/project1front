import { Column, Row } from '@shared/types';
import { RIGHT_PANEL_TYPE } from '@shared/constants';

export interface TableModelsProps {
  rowList: Array<Partial<Row>>;
  columnList: Column[];
  page: number;
  pageSize: number;
  searchString: string;
  onActionCell: (
    action: RIGHT_PANEL_TYPE.EDIT_MODEL | RIGHT_PANEL_TYPE.HISTORY_CHANGES,
    rowId: string,
    cellName: keyof Row,
  ) => void;
  updateRowsCount: (newRowsCount: number) => void;
  setCurrentPage: (newPage: number) => void;
}

export type TableChangeProps = Omit<TableModelsProps, 'onActionCell'>;
