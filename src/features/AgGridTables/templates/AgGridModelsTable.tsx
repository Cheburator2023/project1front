import React from 'react';
import { Template } from '@src/shared/api';
import { Column, Row } from '@src/shared/types';
import { AgGridTable } from '../organisms/AgGridTable';
import { useTableModels } from '../../../pages/HomePage/hooks/useTableModels';

export const AgGridModelsTable = (props: {
  isCompared?: boolean;
  overrideColumnList?: Column[];
  overrideRowList?: Partial<Row>[];
  overlayNoRowsTemplate?: string;
}) => {
  const { modelsTable, filters } = useTableModels();
  const templates = filters?.templates;
  const { error, loading } = modelsTable;

  const { rowList, setPage, page, setTotalRows, pageSize, searchString, columnList } = modelsTable;

  return (
    <AgGridTable
      templates={templates}
      rowList={props.overrideRowList || rowList}
      columnList={props.overrideColumnList || columnList}
      setPage={setPage}
      page={page}
      setTotalRows={setTotalRows}
      pageSize={pageSize}
      searchString={searchString}
      isCompared={props.isCompared}
      handleClickOnActionCell={modelsTable.handleClickOnActionCell}
      error={error}
      loading={loading}
      overlayNoRowsTemplate={props.overlayNoRowsTemplate}
    />
  );
};

