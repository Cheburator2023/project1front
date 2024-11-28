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
import { useRoles } from '@src/shared/hooks';

import { CustomSearchInput, Container } from './styles';
import { ROUTES } from '../../app/Routes';

export interface ActionsPanelProps {
  handleSearch: (newSearchString: string) => void;
  updateRightPanelType: (newRightPanelType: RIGHT_PANEL_TYPE | null) => void;
}

export const ActionsPanel = ({ updateRightPanelType, handleSearch }: ActionsPanelProps) => {
  const [searchValue, setSearchValue] = useState('');
  const { modelsCount, modelSource, isDeleteButtonEnabled, userMatches, modelStatus } =
    useDeleteRightModelPanelStore();
  const { isAdmin, isValidatorLead } = useRoles();

  let deleteTooltipMessage = '';

  if (modelsCount === 0) {
    deleteTooltipMessage = 'Выберите модель для удаления';
  } else if (modelsCount > 1) {
    deleteTooltipMessage = 'Нельзя удалить несколько моделей';
  } else if (modelSource !== 'sum-rm') {
    deleteTooltipMessage = 'Модель должна быть с исчтоником "sum-rm"';
  } else if (modelStatus === 'Ошибка заведения') {
    deleteTooltipMessage = 'Модель уже удалена и находится в статусе "Ошибка заведения"';
  } else if (isValidatorLead && modelStatus !== 'Ожидает удаления') {
    deleteTooltipMessage = 'Подтвердить удаление модели можно только в статусе "Ожидает удаления"';
  } else if (!userMatches && !isAdmin) {
    deleteTooltipMessage = 'Модель может-быть удалена только создателем или владельцем модели';
  } else {
    deleteTooltipMessage = 'Удалить модель';
  }

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
        <IconButton
          icon={<PlusCircleSolid />}
          tooltip="Добавить модель"
          color="#0062FF"
          onClick={() => updateRightPanelType(RIGHT_PANEL_TYPE.ADD_MODEL)}
        />
        <IconButton
          icon={<DeleteSolid />}
          tooltip={deleteTooltipMessage}
          color="#0062FF"
          onClick={() => updateRightPanelType(RIGHT_PANEL_TYPE.DELETE_MODEL)}
          disabled={!isDeleteButtonEnabled}
        />

        <IconButton
          icon={<BrokerOutlineIcon />}
          tooltip="Графики"
          onClick={() => navigate('charts')}
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

