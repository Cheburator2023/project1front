import {
  Button,
  CheckboxField,
  DropdownContainer,
  Option,
  Select,
  IconButton,
} from '@admiral-ds/react-ui';
import React from 'react';
import { ReactComponent as ServiceDotsMenuSolid } from '@admiral-ds/icons/build/service/DotsMenuOutline.svg';
import styled from 'styled-components';
import { Spacer } from '@src/shared/ui/atoms';

export interface ModelFormDotMenuProps {
  expandedPanel: boolean;
  selectedColSize: string;
  setSelectedColSizeHandler: (e: any) => void;
  showAllFields: boolean;
  setShowAllFields: (value: boolean) => void;
}

export const ModelFormDotMenu: React.FC<ModelFormDotMenuProps> = ({
  expandedPanel,
  selectedColSize,
  setSelectedColSizeHandler,
  showAllFields,
  setShowAllFields,
}) => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);

  const clickOutside = (e: Event) => {
    if (e.target && buttonRef.current?.contains(e.target as Node)) {
      return;
    }
    setOpen(!open);
  };

  return (
    <div>
      <IconButton dimension="s" ref={buttonRef} onClick={() => setOpen(!open)}>
        <ServiceDotsMenuSolid />
      </IconButton>

      {open && (
        <DropdownContainer
          alignSelf="auto"
          targetElement={buttonRef.current as Element | undefined}
          onClickOutside={clickOutside}
          className="dropContainerClass"
          targetRef={buttonRef}
        >
          <PaperWrapper>
            {expandedPanel && (
              <Select
                value={selectedColSize}
                onChange={setSelectedColSizeHandler}
                placeholder="Количество колонок"
              >
                <Option value="1">1 колонка</Option>
                <Option value="2">2 колонки</Option>
                <Option value="3">3 колонки</Option>
                <Option value="4">4 колонки</Option>
              </Select>
            )}
            <Spacer />
            <CheckboxField
              id="activeModelByDefault_checkbox"
              dimension="s"
              checked={showAllFields}
              onChange={(e) => setShowAllFields(e.target.checked)}
            >
              Показать все возможные поля
            </CheckboxField>
          </PaperWrapper>
        </DropdownContainer>
      )}
    </div>
  );
};

const PaperWrapper = styled.div`
  padding: 20px;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  width: 300px;
`;

