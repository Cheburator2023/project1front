import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as BrokerOutlineIcon } from '@admiral-ds/icons/build/finance/BrokerOutline.svg';
import { ReactComponent as MenuOutline } from '@admiral-ds/icons/build/service/MenuOutline.svg';
import { ReactComponent as PlusCircleSolid } from '@admiral-ds/icons/build/service/PlusCircleSolid.svg';
import { ReactComponent as SettingsOutline } from '@admiral-ds/icons/build/system/SettingsOutline.svg';
import { ReactComponent as ShowTableOutline } from '@admiral-ds/icons/build/category/ShowTableOutline.svg';

import { IconButton } from '@shared/ui/molecules';
import { RIGHT_PANEL_TYPE } from '@shared/constants';

import { useDebouncedCallback } from '@src/shared/hooks/useDebouncedCallback';
import { CustomSearchInput, Container } from './styles';
import { ROUTES } from '../../app/Routes';

export interface ActionsPanelProps {
  handleSearch: (newSearchString: string) => void;
  updateRightPanelType: (newRightPanelType: RIGHT_PANEL_TYPE | null) => void;
}

export const ActionsPanel = ({ updateRightPanelType, handleSearch }: ActionsPanelProps) => {
  const [searchValue, setSearchValue] = useState('');
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

