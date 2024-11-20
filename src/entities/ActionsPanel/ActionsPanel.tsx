import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as BrokerOutlineIcon } from '@admiral-ds/icons/build/finance/BrokerOutline.svg';
import { ReactComponent as MenuOutline } from '@admiral-ds/icons/build/service/MenuOutline.svg';
import { ReactComponent as PlusCircleSolid } from '@admiral-ds/icons/build/service/PlusCircleSolid.svg';
import { ReactComponent as SettingsOutline } from '@admiral-ds/icons/build/system/SettingsOutline.svg';
import { ReactComponent as DeleteSolid } from '@admiral-ds/icons/build/system/DeleteSolid.svg';

import { IconButton } from '@shared/ui/molecules';
import { RIGHT_PANEL_TYPE } from '@shared/constants';

import { useDebouncedCallback } from '@src/shared/hooks/useDebouncedCallback';
import { CustomSearchInput, Container } from './styles';
import { useDeleteRightModelPanelStore } from '@src/shared/stores';

export interface ActionsPanelProps {
  handleSearch: (newSearchString: string) => void;
  updateRightPanelType: (value: React.SetStateAction<RIGHT_PANEL_TYPE | null>) => void;
}

export const ActionsPanel = ({ updateRightPanelType, handleSearch }: ActionsPanelProps) => {
  const [searchValue, setSearchValue] = useState('');
  const { selectedModelsCount, selectedModelSource, isDeleteButtonEnabled } =
    useDeleteRightModelPanelStore();

  let deleteTooltipMessage = '';

  if (selectedModelsCount === 0) {
    deleteTooltipMessage = 'Выберите модель для удаления';
  } else if (selectedModelsCount > 1) {
    deleteTooltipMessage = 'Нельзя удалить несколько моделей';
  } else if (selectedModelSource !== 'sum-rm') {
    deleteTooltipMessage = 'Модель должна быть с исчтоником "sum-rm"';
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
        <IconButton icon={<MenuOutline />} tooltip="Меню" onClick={() => null} />
        <IconButton icon={<SettingsOutline />} tooltip="Настройки" onClick={() => null} />
      </div>
    </Container>
  );
};

