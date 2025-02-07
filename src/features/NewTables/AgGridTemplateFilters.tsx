import React from 'react';
import { Column, Row } from '@src/shared/types';
import { RowDragMoveEvent, RowSelectedEvent } from 'ag-grid-community';
import { AgGridTable } from './AgGridTable';

export const AgGridTemplateFilters = (props: {
  overrideColumnList?: Column[];
  overrideRowList?: Partial<Row>[];
  onRowSelected?: (event: RowSelectedEvent) => void;
  onRowDragMove?: (event: RowDragMoveEvent) => void;
}) => {
  return (
    <div style={{ maxHeight: 'calc(100vh - 185px)' }}>
      <AgGridTable
        rowList={props.overrideRowList || []}
        columnList={props.overrideColumnList || []}
        onRowSelected={props.onRowSelected}
        onRowDragMove={props.onRowDragMove}
        rowDragManaged
        pagination={false}
        actionPanel={false}
        sidePanel={false}
      />
    </div>
  );
};

