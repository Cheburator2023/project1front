import React, { forwardRef } from 'react';
import { Column, Row } from '@src/shared/types';
import {
  FirstDataRenderedEvent,
  GridReadyEvent,
  RowDataUpdatedEvent,
  RowDragEndEvent,
  RowDragMoveEvent,
  RowSelectedEvent,
  SelectionChangedEvent,
  SortChangedEvent,
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
      onSortChanged?: (event: SortChangedEvent) => void;
      onGridReady?: (event: GridReadyEvent) => void;
      noCustomCells?: boolean;
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
          onSortChanged={props.onSortChanged}
          onGridReady={props.onGridReady}
          noCustomCells={props.noCustomCells}
        />
      </div>
    );
  },
);

