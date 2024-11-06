import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as BrokerOutlineIcon } from '@admiral-ds/icons/build/finance/BrokerOutline.svg';
import { ReactComponent as MenuOutline } from '@admiral-ds/icons/build/service/MenuOutline.svg';
import { ReactComponent as PlusCircleSolid } from '@admiral-ds/icons/build/service/PlusCircleSolid.svg';
import { ReactComponent as SettingsOutline } from '@admiral-ds/icons/build/system/SettingsOutline.svg';

import { IconButton } from '@shared/ui/molecules';
import { RIGHT_PANEL_TYPE } from '@shared/constants';

import { CustomSearchInput, Container } from './styles';

export interface ActionsPanelProps {
  handleSearch: (newSearchString: string) => void;
  updateRightPanelType: (value: React.SetStateAction<RIGHT_PANEL_TYPE | null>) => void;
}

export const ActionsPanel = ({ updateRightPanelType, handleSearch }: ActionsPanelProps) => {
  const [searchValue, setSearchValue] = useState('');

  const navigate = useNavigate();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.currentTarget.value;

      setSearchValue(newValue);

      if (!(newValue.length || e.isTrusted)) {
        handleSearch(newValue);
      }
    },
    [handleSearch],
  );

  return (
    <Container>
      <CustomSearchInput
        placeholder="Поиск"
        onSearchClick={() => handleSearch(searchValue)}
        onChange={handleChange}
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
        <IconButton icon={<MenuOutline />} tooltip="Меню" onClick={() => null} />
        <IconButton icon={<SettingsOutline />} tooltip="Настройки" onClick={() => null} />
      </div>
    </Container>
  );
};

