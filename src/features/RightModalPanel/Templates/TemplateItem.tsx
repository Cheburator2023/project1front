import {
  T,
  DropMenu,
  RenderOptionProps,
  MenuItem,
  TextInput,
  IconButton as AIconButton,
} from '@admiral-ds/react-ui';
import React, { useCallback, useMemo, useState } from 'react';

import { ReactComponent as LockOutline } from '@admiral-ds/icons/build/security/LockOutline.svg';
import { ReactComponent as UnlockOutline } from '@admiral-ds/icons/build/security/UnlockOutline.svg';
import { ReactComponent as MoreVerticalOutline } from '@admiral-ds/icons/build/system/MoreVerticalOutline.svg';
import { ReactComponent as SaveOutline } from '@admiral-ds/icons/build/system/SaveOutline.svg';
import { ReactComponent as CloseOutline } from '@admiral-ds/icons/build/service/CloseOutline.svg';

import { Template } from '@shared/api';
import styled from 'styled-components';
import { IconButton } from '@shared/ui/molecules';

const Wrapper = styled('div')`
  display: flex;
  flex-direction: row;
  margin-bottom: 15px;
`;
const Content = styled('div')`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
`;

const IconWrapper = styled('div')`
  width: 20px;
  height: 20px;
  margin-right: 8px;
  display: flex;
`;

const options = [
  {
    id: '1',
    label: 'Редактировать',
    value: 'edit',
  },
  {
    id: '2',
    label: 'Удалить',
    value: 'remove',
  },
];

interface TemplateItemProps {
  template: Template;
  editable?: boolean;
  onEdit?: (templateId: number, newValue: string, isPublic?: boolean) => void;
  onDelete?: (templateId: number) => void;
}

export const TemplateItem = ({
  template,
  editable = true,
  onEdit,
  onDelete,
}: TemplateItemProps) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const [editedTemplateIsPublic, setEditedTemplateIsPublic] = useState(template.public);
  const [editedTemplateValue, setEditedTemplateValue] = useState<string>('');

  const model = useMemo(() => {
    return options.map((item) => ({
      id: item.id,
      render: (options: RenderOptionProps) => (
        <MenuItem dimension="s" {...options} key={item.id}>
          {item.label}
        </MenuItem>
      ),
    }));
  }, []);

  const handleOnSelect = useCallback(
    (id: string) => {
      if (id === '1') {
        setIsEditMode(true);
        setEditedTemplateValue(template.template_name);
      } else {
        onDelete?.(template.template_id || 0);
      }
    },
    [onDelete, template.template_id, template.template_name],
  );

  const handleChangeEditedTemplateValue = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTemplateValue(e.target.value);
  }, []);

  const handleOnSave = useCallback(() => {
    onEdit?.(template.template_id || 0, editedTemplateValue, editedTemplateIsPublic);

    setIsEditMode(false);
  }, [onEdit, template, editedTemplateIsPublic, editedTemplateValue]);

  return (
    <Wrapper>
      {isEditMode ? (
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
          <IconButton
            icon={editedTemplateIsPublic ? <UnlockOutline /> : <LockOutline />}
            onClick={() => setEditedTemplateIsPublic(!editedTemplateIsPublic)}
          />
          <TextInput
            style={{ width: '100%', margin: '0 5px' }}
            dimension="s"
            value={editedTemplateValue}
            placeholder="Название шаблона"
            onChange={handleChangeEditedTemplateValue}
          />
          <IconButton icon={<CloseOutline />} onClick={() => setIsEditMode(false)} />
          <IconButton
            icon={<SaveOutline />}
            onClick={handleOnSave}
            disabled={!editedTemplateValue}
          />
        </div>
      ) : (
        <>
          <IconWrapper>{template.public ? <UnlockOutline /> : <LockOutline />}</IconWrapper>
          <Content>
            <T font="Body/Body 2 Short">{template.template_name}</T>
            <T font="Caption/Caption 1" color="Neutral/Neutral 50">
              Фильтров: {Object.values(template.filterModel ? template.filterModel : {}).length};
              Активных колонок:{' '}
              {template.columnState ? template.columnState.filter((col) => !col.hide).length : 0}
            </T>
          </Content>
          {editable && (
            <DropMenu
              items={model}
              onSelectItem={handleOnSelect}
              dropContainerClassName="dropContainerClass"
              renderContentProp={({
                buttonRef,
                handleKeyDown,
                handleClick,
                statusIcon,
                disabled,
              }) => {
                return (
                  <AIconButton
                    ref={buttonRef as React.Ref<HTMLButtonElement>}
                    disabled={disabled}
                    onKeyDown={handleKeyDown}
                    onClick={handleClick}
                    dimension="s"
                  >
                    <MoreVerticalOutline />
                  </AIconButton>
                );
              }}
            />
          )}
        </>
      )}
    </Wrapper>
  );
};

