import React, { useEffect } from 'react';
import { Column as AdmiralColumn, T } from '@admiral-ds/react-ui';
import styled from 'styled-components';

import { COLUMN_TYPE, Column, Row } from '@shared/types';
import { RIGHT_PANEL_TYPE } from '@shared/constants';
import { ActionsPanel, ColumnFilter } from '@entities';

import { AgGridModelsTable } from '@src/features/NewTables/AgGridModelsTable';
import { useTableChange } from '../hooks';
import { useTableModels } from '../../../pages/Home/hooks';

interface TableModelsProps {
  rowList: Array<Partial<Row>>;
  columnList: Column[];
  page: number;
  pageSize: number;
  totalRows: number;
  error: string | null;
  loading: boolean;
  searchString: string;
  firstDate: string | null;
  secondDate: string | null;
  updateRowsCount: (newRowsCount: number) => void;
  setCurrentPage: (newPage: number) => void;
  onChangePage: (result: { page: number; pageSize: number }) => void;
  handleSearch: (newSearchString: string) => void;
  updateRightPanelType: (newRightPanelType: RIGHT_PANEL_TYPE | null) => void;
}

export const CompareModelsNewTable = React.memo(
  ({
    rowList,
    columnList,
    page,
    pageSize,
    searchString,
    updateRowsCount,
    setCurrentPage,
    error,
    loading,
    onChangePage,
    handleSearch,
    totalRows,
    updateRightPanelType,
    firstDate,
    secondDate,
  }: TableModelsProps) => {
    const {
      cols,
      rows,
      setCols,
      setRows,
      handleSelectionChange,
      handleResize,
      handleSort,
      handleChangeColumnsFilter,
      handleColumnDragEnd,
      columnsFilters,
      onChangeColumnsFilters,
    } = useTableChange({
      rowList,
      setCurrentPage,
      page,
      updateRowsCount,
      pageSize,
      searchString,
      columnList,
    });
    const { display, modelsTable, filters, context } = useTableModels();

    useEffect(() => {
      if (rowList?.length) {
        setRows(rowList);
        updateRowsCount(rowList.length);

        const newCols: Array<AdmiralColumn & Column> = columnList.map((column) => ({
          ...column,
          width: '200px',
          sortable: true,
          sticky: column.name === 'system_model_id',
          cellAlign: column.type === COLUMN_TYPE.NUMBER ? 'right' : 'left',
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

    return (
      <>
        {totalRows > 0 && firstDate && secondDate && !loading ? (
          <AgGridModelsTable
            display={display}
            modelsTable={modelsTable}
            templates={filters.templates}
            isCompared
            overrideColumnList={columnList}
            overrideRowList={rows}
            error={error}
            loading={loading}
          />
        ) : (
          <StatusWrapper>
            <T font="Subtitle/Subtitle 1">Для сравнения выберите две даты состояния реестра</T>
          </StatusWrapper>
        )}
      </>
    );
  },
);

CompareModelsNewTable.displayName = 'CompareModelsNewTable';

const StatusWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  padding: 50px 0;
  justify-content: center;
  position: absolute;
  align-items: center;
  z-index: 10;
  background-color: #fffffff0;
  pointer-events: none;
`;
