import { useState, useEffect, useCallback, useContext } from 'react';
import { Column as AdmiralColumn } from '@admiral-ds/react-ui';

import { FiltersContext } from '@shared/api';
import { Column, Row } from '@shared/types';
import {
  compare,
  getFilteredRowsByColumnsFilter,
  getFilteredRowsBySearch,
  getPageRows,
  filterColumnsFiltersByColumns,
} from '@shared/helpers';

import { initialColumns } from '@src/shared/constants';
import { TableChangeProps } from '../types';

export const useTableChange = ({
  rowList,
  setCurrentPage,
  page,
  updateRowsCount,
  pageSize,
  searchString,
  columnList,
}: TableChangeProps) => {
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
      draggable: true,
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
        onChangeTopFilters({ ...topFilters, templates: topFilters.templates || [] });
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

  // Update filtered rows after searching or changing column filters
  useEffect(() => {
    if (rowList.length) {
      let newFilteredRows = rowList;

      if (searchString) {
        const colNames = columnList.map(({ name }) => name);

        newFilteredRows = getFilteredRowsBySearch(newFilteredRows, colNames, searchString);
      }

      if (columnsFilters) {
        newFilteredRows = getFilteredRowsByColumnsFilter(
          newFilteredRows,
          columnsFilters,
          initialColumns,
        );
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

  return {
    cols,
    rows,
    setRows,
    setCols,
    handleSort,
    handleResize,
    handleSelectionChange,
    handleChangeColumnsFilter,
    columnsFilters,
    topFilters,
    onChangeColumnsFilters,
    onChangeTopFilters,
    handleColumnDragEnd,
  };
};
