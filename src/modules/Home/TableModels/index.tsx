import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Column as AdmiralColumn } from '@admiral-ds/react-ui';

import { FiltersContext } from 'src/modules/Home/FiltersContext';

import {
  compare,
  getFilteredRowsByColumnsFilter,
  getFilteredRowsBySearch,
  getPageRows,
} from './helpers';

import { COLUMN_TYPE, Column, Row } from './types';
import { CustomTable } from './styles';

import { CustomCell } from './CustomCell';
import { RIGHT_PANEL_TYPE } from '../types';
import { ColumnFilter } from './ColumnFilter';
import { filterColumnsFiltersByColumns } from '../helpers';

interface TableModelsProps {
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

export const TableModels = React.memo(
  ({
    rowList,
    columnList,
    page,
    pageSize,
    searchString,
    onActionCell,
    updateRowsCount,
    setCurrentPage,
  }: TableModelsProps) => {
    const { columnsFilters, topFilters, onChangeColumnsFilters, onChangeTopFilters } =
      useContext(FiltersContext);

    // Table data
    const [rows, setRows] = useState(rowList);
    const [cols, setCols] = useState<(AdmiralColumn & Column)[]>([]);

    const handleSort = ({ name, sort }: { name: string; sort: 'asc' | 'desc' | 'initial' }) => {
      setCurrentPage(1);

      const initialCols = cols.map((col) => ({
        ...col,
        sort: undefined,
        sortOrder: undefined,
      }));

      if (sort === 'initial') {
        setCols(initialCols);
      } else {
        const newSortCols = initialCols.map((col) => {
          if (col.name === name) {
            return {
              ...col,
              sort,
              sortOrder: 1,
            };
          }

          return col;
        });

        setCols(newSortCols);
      }
    };

    const handleResize = ({ name, width }: { name: string; width: string }) => {
      const colsWithNewWidth = cols.map((col) => (col.name === name ? { ...col, width } : col));

      setCols(colsWithNewWidth);
    };

    const handleSelectionChange = (ids: Record<string | number, boolean>): void => {
      const rowsWithUpdatedSelectedStatus = rows.map((row) => ({
        ...row,
        selected: row.id && Boolean(ids[row.id]),
      }));

      setRows(rowsWithUpdatedSelectedStatus);
    };

    const handleChangeColumnsFilter = useCallback(
      (rowFieldName: string, selectValue: string[]) => {
        setCurrentPage(1);

        if (columnsFilters) {
          const newColumnsFilters = {
            ...columnsFilters,
            [rowFieldName]: selectValue,
          };

          onChangeColumnsFilters(newColumnsFilters);
          onChangeTopFilters({ ...topFilters, templates: [] });
        }
      },
      [columnsFilters, topFilters, onChangeColumnsFilters, onChangeTopFilters],
    );

    const handleColumnDragEnd = (columnName: string, nextColumnName: string | null) => {
      const columns = [...cols];
      const movedIndex = columns.findIndex((col) => col.name === columnName);
      const movedColumn = columns.splice(movedIndex, 1)[0];
      const beforeIndex = nextColumnName
        ? columns.findIndex((col) => col.name === nextColumnName)
        : columns.length;
      columns.splice(beforeIndex, 0, movedColumn);

      const newColumnsFilters = filterColumnsFiltersByColumns(columns, columnsFilters);
      onChangeColumnsFilters(newColumnsFilters);
      onChangeTopFilters({ ...topFilters, templates: [] });
    };

    useEffect(() => {
      if (rowList.length) {
        setRows(rowList);
        updateRowsCount(rowList.length);

        const newCols: Array<AdmiralColumn & Column> = columnList.map((column) => ({
          ...column,
          width: '200px',
          sortable: true,
          draggable: true,
          cellAlign: column.type === COLUMN_TYPE.NUMBER ? 'right' : 'left',
          renderCell: (value: string, row: Row) => (
            <CustomCell
              column={column}
              value={value}
              row={row}
              editable={row?.model_source !== 'sum'}
              onAction={(action) => {
                onActionCell(action, row.system_model_id, column.name);
              }}
            />
          ),
          extraText: (
            <ColumnFilter
              column={column}
              rowList={rowList}
              columnsFilters={columnsFilters}
              onChangeColumnsFilter={handleChangeColumnsFilter}
            />
          ),
        }));

        setCols(newCols);
      }
    }, [
      rowList,
      columnList,
      columnsFilters,
      onChangeColumnsFilters,
      handleChangeColumnsFilter,
      updateRowsCount,
    ]);

    // Update filtered rows after searching or changing column filters
    useEffect(() => {
      if (rowList.length) {
        let newFilteredRows = rowList;

        if (searchString) {
          const colNames = columnList.map(({ name }) => name);

          newFilteredRows = getFilteredRowsBySearch(newFilteredRows, colNames, searchString);
        }

        if (columnsFilters) {
          newFilteredRows = getFilteredRowsByColumnsFilter(newFilteredRows, columnsFilters);
        }

        const sortedColumn = cols.find((col) => col.sort);

        if (sortedColumn && sortedColumn.sort) {
          const { name, type, sort } = sortedColumn;

          newFilteredRows = newFilteredRows.sort((a: Partial<Row>, b: Partial<Row>) =>
            compare(a, b, name, type, sort),
          );
        }

        const pageRows = getPageRows({ rows: newFilteredRows, page, pageSize });

        setRows(pageRows);
        updateRowsCount(newFilteredRows.length);
      }
    }, [
      columnsFilters,
      rowList,
      cols,
      pageSize,
      page,
      searchString,
      columnList,
      updateRowsCount,
      setCurrentPage,
    ]);

    return (
      <CustomTable
        displayRowSelectionColumn
        greyHeader
        headerLineClamp={1}
        rowList={rows as Array<Partial<Row> & { id: string }>} // fix types
        columnList={cols}
        virtualScroll={{ fixedRowHeight: 40 }}
        style={{ height: 'calc(100vh - 245px)' }}
        onSortChange={handleSort}
        onColumnResize={handleResize}
        onRowSelectionChange={handleSelectionChange}
        // onColumnDragEnd={handleColumnDragEnd}
      />
    );
  },
);

TableModels.displayName = 'TableModels';
