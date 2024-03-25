import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Column as AdmiralColumn, TableRow } from '@admiral-ds/react-ui';

import { FiltersContext } from 'src/modules/Home/FiltersContext';
import { DownloadReportContext } from 'src/Layout/DownloadReport/DownloadReportContext';

import {
  compare,
  getColumnFilterOptions,
  getFilteredRowsByColumnsFilter,
  getFilteredRowsBySearch,
  getPageRows,
} from './helpers';
import { COLUMN_TYPE, Column, Row } from './types';
import { CustomTable, CustomSearchSelect } from './styles';

import { SELECT_TYPE } from '../../../components/SearchSelect/types';
import { CustomCell } from './CustomCell';
import { TABLE_ACTION } from '../types';

interface TableModelsProps {
  rowList: Array<Partial<Row> & { id: string }>;
  columnList: Column[];
  page: number;
  pageSize: number;
  searchString: string;
  onActionCell: (
    action: TABLE_ACTION.EDIT | TABLE_ACTION.HISTORY_CHANGES,
    rowId: string,
    cellName: keyof Row,
  ) => void;
  updateRowsCount: (newRowsCount: number) => void;
  setCurrentPage: (newPage: number) => void;
}

export const TableModels = ({
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

  const { updateCVSReportContent } = useContext(DownloadReportContext);

  // Table data
  const [rows, setRows] = useState(rowList);
  const [cols, setCols] = useState<(AdmiralColumn & Column)[]>([]);

  const handleSort = ({ name, sort }: { name: string; sort: 'asc' | 'desc' | 'initial' }) => {
    setCurrentPage(1);

    const initialCols = cols.map((col) => ({ ...col, sort: undefined, sortOrder: undefined }));

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
      selected: Boolean(ids[row.id]),
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
    [columnsFilters, topFilters, onChangeColumnsFilters, onChangeTopFilters, setCurrentPage],
  );

  // Check for downloading CVS report
  useEffect(() => {
    const newCSVReportHeader = cols.map((col) => ({ label: col.title, key: col.name }));

    updateCVSReportContent({ type: 'header', header: newCSVReportHeader });
  }, [cols]);

  // Update rows, cols and filters if initial data changed
  useEffect(() => {
    if (rowList.length) {
      setRows(rowList);
      updateRowsCount(rowList.length);

      const newCols: Array<AdmiralColumn & Column> = columnList.map((column) => ({
        ...column,
        width: '200px',
        sortable: true,
        cellAlign: column.type === COLUMN_TYPE.NUMBER ? 'right' : 'left',
        renderCell: (value: string, row: Row) => (
          <CustomCell
            name={column.name}
            value={value}
            row={row}
            type={column.type}
            editable={row?.model_source !== 'sum'}
            onAction={(action) => {
              onActionCell(action, row.system_model_id, column.name);
            }}
          />
        ),
        extraText: (
          <CustomSearchSelect
            name={column.name}
            selectedValues={columnsFilters?.[column.name]}
            onChange={handleChangeColumnsFilter}
            selectNotNullEnabled
            options={{
              type: SELECT_TYPE.STRING,
              options: getColumnFilterOptions(rowList, column.name),
            }}
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

      updateCVSReportContent({ type: 'body', body: newFilteredRows });

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
      rowList={rows}
      columnList={cols}
      onSortChange={handleSort}
      onColumnResize={handleResize}
      onRowSelectionChange={handleSelectionChange}
    />
  );
};
