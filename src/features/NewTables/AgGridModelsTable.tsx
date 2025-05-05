import React from 'react';
import { TDisplayTableModels, TFilters, TModelsTable } from '@pages/Home/hooks';
import { Template } from '@src/shared/api';
import { Column, Row } from '@src/shared/types';
import { AgGridTable } from './AgGridTable';

export const AgGridModelsTable = (props: {
  display: TDisplayTableModels;
  modelsTable: TModelsTable;
  templates: Template[];
  isCompared?: boolean;
  overrideColumnList?: Column[];
  overrideRowList?: Partial<Row>[];
  error: string | null;
  loading: boolean;
  overlayNoRowsTemplate?: string;
}) => {
  const { rowList, setPage, page, setTotalRows, pageSize, searchString, columnList } =
    props.modelsTable;

  return (
    <AgGridTable
      display={props.display}
      templates={props.templates}
      rowList={props.overrideRowList || rowList}
      columnList={props.overrideColumnList || columnList}
      setPage={setPage}
      page={page}
      setTotalRows={setTotalRows}
      pageSize={pageSize}
      searchString={searchString}
      isCompared={props.isCompared}
      handleClickOnActionCell={props.modelsTable.handleClickOnActionCell}
      error={props.error}
      loading={props.loading}
      overlayNoRowsTemplate={props.overlayNoRowsTemplate}
    />
  );
};

