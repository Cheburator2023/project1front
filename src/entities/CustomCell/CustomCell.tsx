import React, { useCallback, useRef } from 'react';
import styled, { css } from 'styled-components';
import { ReactComponent as EditOutline } from '@admiral-ds/icons/build/system/EditOutline.svg';
import { ReactComponent as CalendarUpdateOutline } from '@admiral-ds/icons/build/system/CalendarUpdateOutline.svg';

import { Tooltip } from '@shared/ui/atoms';
import { IconButton } from '@shared/ui/molecules';
import { RIGHT_PANEL_TYPE } from '@shared/constants';
import { COLUMN_TYPE, Column, Row } from '@shared/types';

import { CellContentFactory } from './CellContentFactory';

export const CellWrapper = styled.div<{ type: COLUMN_TYPE }>`
  display: block;
  width: 100%;
  margin: 2px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  position: relative;
  ${({ type }) =>
    type === COLUMN_TYPE.NUMBER &&
    css`
      text-align: right;
    `}

  &:hover .actionsContainer {
    opacity: 1;
  }
`;

const ActionBtn = styled(IconButton)`
  background-color: #f3f4f6;
  display: block;
  border-radius: 100%;

  cursor: pointer;

  &:hover > div {
    width: 16px;
  }
`;

const ActionsContainer = styled.div`
  position: absolute;
  margin: 0;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: row;
  align-items: start;
  opacity: 0;
`;

export interface CustomCellProps {
  column: Column;
  value: string;
  row: Row;
  editable: boolean;
  onAction: (action: RIGHT_PANEL_TYPE.EDIT_MODEL | RIGHT_PANEL_TYPE.HISTORY_CHANGES) => void;
}

export const CustomCell = ({
  row,
  column,
  value,
  editable,
  onAction,
}: CustomCellProps): React.ReactElement => {
  const cellRef = useRef(null);

  const handleActionClick = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const { name } = e.target as HTMLButtonElement;

    if (name === 'edit') {
      onAction(RIGHT_PANEL_TYPE.EDIT_MODEL);
    } else {
      onAction(RIGHT_PANEL_TYPE.HISTORY_CHANGES);
    }
  }, []);

  return (
    <>
      <CellWrapper type={column.type}>
        <ActionsContainer className="actionsContainer">
          <ActionBtn
            name="historyChanges"
            dimension="s"
            color="#0062FF"
            icon={<CalendarUpdateOutline />}
            tooltip="История изменений"
            onClick={handleActionClick}
          />
          {editable && (
            <ActionBtn
              name="edit"
              dimension="s"
              color="#0062FF"
              icon={<EditOutline />}
              tooltip="Редактировать"
              onClick={handleActionClick}
            />
          )}
        </ActionsContainer>
        <div ref={cellRef}>{CellContentFactory({ value, column, row })}</div>
      </CellWrapper>
      <Tooltip targetRef={cellRef} showOnOverflowOnly title={value} />
    </>
  );
};
