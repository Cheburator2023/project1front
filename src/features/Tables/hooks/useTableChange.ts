import { useState, useEffect, useCallback } from 'react';
import { Column as AdmiralColumn } from '@admiral-ds/react-ui';

import { useFiltersStore } from '@shared/stores/filtersStore';
import { Column, Row } from '@shared/types';
import {
  compare,
  getFilteredRowsByColumnsFilter,
  getFilteredRowsBySearch,
  getPageRows,
  filterColumnsFiltersByColumns,
} from '@shared/helpers';

import { initialColumns } from '@src/shared/constants';
import { useDeleteRightModelPanelStore, useUserStore } from '@src/shared/stores';
import { useModelUserMatch } from '@src/shared/hooks';
import { useDeepEffect } from '@src/shared/hooks/useDeepEffect';
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
  const { columnsFilters, topFilters, setColumnsFilters, setTopFilters } = useFiltersStore();

  const { updateDeleteModelState } = useDeleteRightModelPanelStore();
  const { isModelCreator, isInBusinessCustomers } = useModelUserMatch();

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

    const selectedRows = rowsWithUpdatedSelectedStatus.filter((row) => row.selected);

    if (selectedRows.length === 1) {
      const selectedRow = selectedRows[0];

      const { model_source, status, id } = selectedRow;

      const userMatches = isModelCreator(selectedRow) || isInBusinessCustomers(selectedRow);

      updateDeleteModelState(1, model_source, status, id, userMatches);
    } else {
      updateDeleteModelState(selectedRows.length);
    }
  };

  const handleChangeColumnsFilter = useCallback(
    (rowFieldName: string, selectValue: string[]) => {
      setCurrentPage(1);

      if (columnsFilters) {
        const newColumnsFilters = {
          ...columnsFilters,
          [rowFieldName]: selectValue,
        };

        setColumnsFilters(newColumnsFilters);
      setTopFilters({ ...topFilters, templates: topFilters.templates || [] });
      }
    },
    [columnsFilters, topFilters, setColumnsFilters, setTopFilters],
  );

  const onChangeTopFilters = useCallback(
    (newTopFilters: typeof topFilters) => {
      setCurrentPage(1);
      setTopFilters(newTopFilters);
    },
    [setCurrentPage, setTopFilters],
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
    setColumnsFilters(newColumnsFilters);
      setTopFilters({ ...topFilters, templates: [] });
  };

  const handleUpdate = ({ withRows = false }) => {
    if (rowList?.length) {
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

      if (withRows) {
        setRows(newFilteredRows);
      }

      updateRowsCount(newFilteredRows.length);
    }
  };

  // Update filtered rows after searching or changing column filters
  useDeepEffect(() => {
    handleUpdate({
      withRows: false,
    });
  }, [columnsFilters, rowList, cols, pageSize, page, searchString, columnList]);

  useDeepEffect(() => {
    handleUpdate({
      withRows: true,
    });
  }, [rowList, cols, pageSize, page, searchString, columnList]);

  return {
    cols,
    rows,
    setRows,
    setCols,
    handleSort,
    handleResize,
    handleSelectionChange,
    handleChangeColumnsFilter,
    onChangeTopFilters,
    columnsFilters,
    topFilters,
    setColumnsFilters,
    setTopFilters,
    handleColumnDragEnd,
  };
};

