import React, { useEffect } from 'react';
import { Column as AdmiralColumn, T } from '@admiral-ds/react-ui';
import styled from 'styled-components';

import { COLUMN_TYPE, Column, Row } from '@shared/types';
import { ErrorStatus, Loading, Pagination } from '@shared/ui/atoms';
import { RIGHT_PANEL_TYPE } from '@shared/constants';
import { ActionsPanel, ColumnFilter } from '@entities';

import { CompareTable } from './styles';
import { useTableChange } from '../hooks';
import { PlaygroundTable } from '../../../pages/Playground/PlaygroundTable';
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

const StatusWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 50px 0;
  justify-content: center;
`;

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
      if (rowList.length) {
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

    if (error) {
      return (
        <StatusWrapper>
          <ErrorStatus text={error} />
        </StatusWrapper>
      );
    }

    if (loading) {
      return (
        <StatusWrapper>
          <Loading text="Загрузка данных ..." />
        </StatusWrapper>
      );
    }

    return (
      <>
        {totalRows > 0 && firstDate && secondDate && !loading ? (
          <>
            <ActionsPanel handleSearch={handleSearch} updateRightPanelType={updateRightPanelType} />
            test
            <PlaygroundTable
              display={display}
              modelsTable={modelsTable}
              filters={filters}
              templates={filters.templates}
            />
            <CompareTable
              // displayRowSelectionColumn
              // greyHeader
              headerLineClamp={1}
              rowList={rows as Array<Partial<Row> & { id: string }>} // fix types
              columnList={cols}
              // virtualScroll={{ fixedRowHeight: 40 }}
              // style={{ height: 'calc(100vh - 245px)' }}
              onSortChange={handleSort}
              onColumnResize={handleResize}
              onRowSelectionChange={handleSelectionChange}
              onColumnDragEnd={handleColumnDragEnd}
            />
            <Pagination
              page={page}
              pageSize={pageSize}
              onChangePage={onChangePage}
              totalElements={totalRows}
            />
          </>
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
