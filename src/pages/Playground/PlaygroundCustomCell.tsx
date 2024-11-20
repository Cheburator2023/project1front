import { IconButton } from '@shared/ui/molecules';
import { format } from 'date-fns';

import { RIGHT_PANEL_TYPE } from '@src/shared/constants';
import { CustomCellRendererProps } from 'ag-grid-react';
import React, { useCallback, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { ReactComponent as EditOutline } from '@admiral-ds/icons/build/system/EditOutline.svg';
import { ReactComponent as CalendarUpdateOutline } from '@admiral-ds/icons/build/system/CalendarUpdateOutline.svg';
import { getLink } from '@entities/CustomCell/helpers';
import { COLUMN_TYPE } from '@src/shared/types';
import { Tooltip } from '@src/shared/ui/atoms';

interface PlaygroundCustomCellParams extends CustomCellRendererProps {
  onAction: (action: any, row_system_model_id: any, columnName: any) => any;
  isCompare?: boolean;
}

interface CellContentFactoryProps {
  value: any;
  column: any;
  isCompare?: boolean;
}

const valueFactory = ({
  value,
  column: { type, name },
  isCompare = false,
}: CellContentFactoryProps) => {
  const emptyValue = isCompare ? '-' : '';

  switch (type) {
    case COLUMN_TYPE.LINK: {
      const href = getLink(name, value);

      return <a href={href}>{value ?? emptyValue}</a>;
    }
    case COLUMN_TYPE.QUARTERLY_DATE:
    case COLUMN_TYPE.DATE: {
      if (!value || value === 'invalid date') {
        return emptyValue;
      }

      const date = new Date(value);

      if (date.toString() === 'Invalid Date') {
        return emptyValue;
      }

      // return format(date, 'yyyy-MM-dd');
      return date.toLocaleDateString();
    }

    default:
      return value ?? emptyValue;
  }
};

export const PlaygroundCustomCell = (params: PlaygroundCustomCellParams) => {
  const wrapperRef = useRef<any>(null);
  const [visible, setVisible] = React.useState(false);

  const handleActionClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const { name } = e.target as HTMLButtonElement;

    if (name === 'edit') {
      params.onAction(
        RIGHT_PANEL_TYPE.EDIT_MODEL,
        params.data.system_model_id,
        params.colDef?.field,
      );
    } else {
      params.onAction(
        RIGHT_PANEL_TYPE.HISTORY_CHANGES,
        params.data.system_model_id,
        params.colDef?.field,
      );
    }
  };

  useEffect(() => {
    function show() {
      setVisible(true);
    }
    function hide() {
      setVisible(false);
    }
    const button = wrapperRef.current;
    if (button) {
      /** Рекомендуется использовать именно addEventListener, так как React SyntheticEvent onMouseEnter
       * отрабатывает некорректно в случае, если мышь была наведена на задизейбленный элемент,
       * а затем была наведена на target элемент
       * https://github.com/facebook/react/issues/19419 */
      button.addEventListener('mouseenter', show);
      button.addEventListener('focus', show);
      button.addEventListener('mouseleave', hide);
      button.addEventListener('blur', hide);
      return () => {
        button.removeEventListener('mouseenter', show);
        button.removeEventListener('focus', show);
        button.removeEventListener('mouseleave', hide);
        button.removeEventListener('blur', hide);
      };
    }
  }, [setVisible]);

  const value = valueFactory({
    value: params.value,
    column: params.colDef,
    isCompare: params?.isCompare,
  });

  return (
    <div>
      <Wrapper ref={wrapperRef}>
        {value}
        <div className="actionButtons">
          <ActionBtn
            name="historyChanges"
            dimension="s"
            color="#0062FF"
            icon={<CalendarUpdateOutline />}
            tooltip="История изменений"
            onClick={handleActionClick}
          />
          <ActionBtn
            name="edit"
            dimension="s"
            color="#0062FF"
            icon={<EditOutline />}
            tooltip="Редактировать"
            onClick={handleActionClick}
          />
        </div>
      </Wrapper>
      <Tooltip targetRef={wrapperRef} title={params.value} />
    </div>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;

  & .actionButtons {
    position: absolute;
    opacity: 0;
    right: 0%;
    top: 0%;
  }

  &:hover .actionButtons {
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

