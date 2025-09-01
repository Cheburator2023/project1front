import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as BrokerOutlineIcon } from '@admiral-ds/icons/build/finance/BrokerOutline.svg';
import { ReactComponent as MenuOutline } from '@admiral-ds/icons/build/service/MenuOutline.svg';
import { ReactComponent as PlusCircleSolid } from '@admiral-ds/icons/build/service/PlusCircleSolid.svg';
import { ReactComponent as SettingsOutline } from '@admiral-ds/icons/build/system/SettingsOutline.svg';
import { ReactComponent as DeleteSolid } from '@admiral-ds/icons/build/system/DeleteSolid.svg';
import { ReactComponent as ShowTableOutline } from '@admiral-ds/icons/build/category/ShowTableOutline.svg';

import { IconButton } from '@shared/ui/molecules';
import { RIGHT_PANEL_TYPE } from '@shared/constants';
import { useDebouncedCallback } from '@src/shared/hooks/useDebouncedCallback';
import { useDeleteRightModelPanelStore } from '@src/shared/stores';
import { usePermissions, useRoles } from '@src/shared/hooks';

import { CustomSearchInput, Container } from './styles';
import { ROUTES } from '../../app/Routes';

// constants.ts
export enum DELETE_TOOLTIP_MESSAGES {
  NO_MODEL_SELECTED = 'Выберите модель для удаления',
  MULTIPLE_MODELS_SELECTED = 'Нельзя удалить несколько моделей',
  INVALID_SOURCE = 'Модель должна быть с источником "sum-rm"',
  NOT_AUTHORIZED = 'Модель может быть удалена только создателем, владельцем модели или администратором',
  DELETE_MODEL = 'Удалить модель',
}

export interface ActionsPanelProps {
  handleSearch: (newSearchString: string) => void;
  updateRightPanelType: (newRightPanelType: RIGHT_PANEL_TYPE | null) => void;
}

export const ActionsPanel = ({ updateRightPanelType, handleSearch }: ActionsPanelProps) => {
  const [searchValue, setSearchValue] = useState('');
  const { modelsCount, modelSource, isDeleteButtonEnabled, userMatches } =
    useDeleteRightModelPanelStore();
  const { isAdmin, isValidatorLead } = useRoles();
  const { isAddModelEnabled } = usePermissions();

  const deleteTooltipMessage = (() => {
    if (modelsCount === 0) return DELETE_TOOLTIP_MESSAGES.NO_MODEL_SELECTED;
    if (modelsCount > 1) return DELETE_TOOLTIP_MESSAGES.MULTIPLE_MODELS_SELECTED;
    if (modelSource !== 'sum-rm') return DELETE_TOOLTIP_MESSAGES.INVALID_SOURCE;
    if (!userMatches && !isAdmin && !isValidatorLead) return DELETE_TOOLTIP_MESSAGES.NOT_AUTHORIZED;
    return DELETE_TOOLTIP_MESSAGES.DELETE_MODEL;
  })();

  const debouncedHandleChange = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
  }, 300);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    handleSearch(newValue);
  };

  return (
    <Container>
      <CustomSearchInput
        placeholder="Поиск"
        onSearchClick={() => handleSearch(searchValue)}
        onChange={(e) => {
          setSearchValue(e.target.value);
          debouncedHandleChange(e);
        }}
        value={searchValue}
      />
      <div>
        {isAddModelEnabled && (
          <IconButton
            icon={<PlusCircleSolid />}
            tooltip="Добавить модель"
            color="#0062FF"
            onClick={() => updateRightPanelType(RIGHT_PANEL_TYPE.ADD_MODEL)}
          />
        )}
        <IconButton
          icon={<DeleteSolid />}
          tooltip={deleteTooltipMessage}
          color="#0062FF"
          onClick={() => updateRightPanelType(RIGHT_PANEL_TYPE.DELETE_MODEL)}
          disabled={!isDeleteButtonEnabled}
        />

        <IconButton
          icon={<BrokerOutlineIcon />}
          tooltip="Графики (живые данные)"
          onClick={() => navigate('charts')}
        />

        <IconButton
          icon={<BrokerOutlineIcon />}
          tooltip="Графики (BI витрины)"
          onClick={() => navigate('charts_bi')}
        />

        <IconButton
          icon={<ShowTableOutline />}
          tooltip="Новый интерфейс таблиц"
          onClick={() => navigate(ROUTES.FUTURE_TABLE)}
        />
        <IconButton icon={<MenuOutline />} tooltip="Меню" onClick={() => null} />
        <IconButton icon={<SettingsOutline />} tooltip="Настройки" onClick={() => null} />
      </div>
    </Container>
  );
};

