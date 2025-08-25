import { useState, useEffect, useCallback } from 'react';
import { Column as AdmiralColumn } from '@admiral-ds/react-ui';

import { useFiltersStore } from '@shared/stores/filtersStore';
import { Column, Row, COLUMN_TYPE } from '@shared/types';
import {
  getFilteredRowsBySearch,
  getPageRows,
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
  const { topFilters, setTopFilters, filterModel, setFilterModel, setSortState } = useFiltersStore();

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
      setSortState([]);
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
      setSortState([{ colId: name, sort, sortIndex: 0 }]);
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
      
      const columnType = columnList.find((col) => col.name === rowFieldName)?.type;
      
      const newFilterModel = { ...filterModel };
      if (selectValue.length > 0) {
        if (columnType === COLUMN_TYPE.DATE) {
          if (selectValue[0] === selectValue[1]) {
            newFilterModel[rowFieldName] = {
              dateFrom: selectValue[0],
              dateTo: null,
              type: 'equals',
            };
          } else {
            newFilterModel[rowFieldName] = {
              dateFrom: selectValue[0],
              dateTo: selectValue[1],
              type: 'inRange',
            };
          }
        } else {
          newFilterModel[rowFieldName] = {
            values: selectValue,
          };
        }
      } else {
        delete newFilterModel[rowFieldName];
      }
      
      setFilterModel(newFilterModel);
      setTopFilters({ ...topFilters, templates: topFilters.templates || [] });
    },
    [columnList, topFilters, filterModel, setFilterModel, setTopFilters],
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

    const newFilterModel = { ...filterModel };
    columns.forEach((col) => {
      const filterData = filterModel[col.name];
      if (filterData) {
        newFilterModel[col.name] = filterData;
      }
    });
    setFilterModel(newFilterModel);
    setTopFilters({ ...topFilters, templates: [] });
  };

  const handleUpdate = ({ withRows = false }) => {
    if (rowList?.length) {
      let newFilteredRows = rowList;

      if (searchString) {
        const colNames = columnList.map(({ name }) => name);
        newFilteredRows = getFilteredRowsBySearch(newFilteredRows, colNames, searchString);
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
  }, [filterModel, rowList, cols, pageSize, page, searchString, columnList]);

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
    filterModel,
    topFilters,
    setTopFilters,
    handleColumnDragEnd,
  };
};

