import React from 'react';
import { Template } from '@src/shared/api';
import { Column, Row } from '@src/shared/types';
import { AgGridTable } from './AgGridTable';
import { ModelsListWidgetActions, ModelsListWidgetData } from './useModelsListWidget';

export const AgGridModelsListWidget = (props: {
  data: ModelsListWidgetData;
  templates: Template[];
  actions: ModelsListWidgetActions;
  isCompared?: boolean;
  columnList?: Column[];
  rowList?: Partial<Row>[];
}) => {
  const { rowList, page, pageSize, searchString, columnList } = props.data;

  return (
    <AgGridTable
      templates={props.templates}
      rowList={rowList}
      columnList={columnList}
      setPage={props.actions.setPage}
      page={page}
      setTotalRows={props.actions.setTotalRows}
      pageSize={pageSize}
      searchString={searchString}
      isCompared={props.isCompared}
      handleClickOnActionCell={props.actions.handleClickOnActionCell}
      error={props.data.error}
      loading={props.data.loading}
    />
  );
};

