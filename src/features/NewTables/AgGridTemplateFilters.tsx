import React, { forwardRef } from 'react';
import { Column, Row } from '@src/shared/types';
import {
  FirstDataRenderedEvent,
  RowDataUpdatedEvent,
  RowDragEndEvent,
  RowDragMoveEvent,
  RowSelectedEvent,
  SelectionChangedEvent,
} from 'ag-grid-community';
import { AgGridTable } from './AgGridTable';

export const AgGridTemplateFilters = forwardRef(
  (
    props: {
      overrideColumnList?: Column[];
      overrideRowList?: Partial<Row>[];
      onRowSelected?: (event: RowSelectedEvent) => void;
      onRowDragMove?: (event: RowDragMoveEvent) => void;
      onFirstDataRendered?: (event: FirstDataRenderedEvent) => void;
      onRowDataUpdated?: (event: RowDataUpdatedEvent) => void;
      onSelectionChanged?: (event: SelectionChangedEvent) => void;
      onRowDragEnd?: (event: RowDragEndEvent) => void;
    },
    ref: any,
  ) => {
    // ...
    return (
      <div style={{ maxHeight: 'calc(100vh - 185px)' }}>
        <AgGridTable
          ref={ref}
          rowList={props.overrideRowList || []}
          columnList={props.overrideColumnList || []}
          onRowSelected={props.onRowSelected}
          onRowDragMove={props.onRowDragMove}
          rowDragManaged
          pagination={false}
          actionPanel={false}
          sidePanel={false}
          onFirstDataRendered={props.onFirstDataRendered}
          onRowDataUpdated={props.onRowDataUpdated}
          onSelectionChanged={props.onSelectionChanged}
          onRowDragEnd={props.onRowDragEnd}
        />
      </div>
    );
  },
);

