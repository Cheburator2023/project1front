import React, { useCallback, useState } from 'react';

import { ReactComponent as BrokerOutlineIcon } from '@admiral-ds/icons/build/finance/BrokerOutline.svg';
import { ReactComponent as MenuOutline } from '@admiral-ds/icons/build/service/MenuOutline.svg';
import { ReactComponent as PlusCircleSolid } from '@admiral-ds/icons/build/service/PlusCircleSolid.svg';
import { ReactComponent as SettingsOutline } from '@admiral-ds/icons/build/system/SettingsOutline.svg';

import { IconButton } from 'src/components/IconButton';

import { CustomSearchInput, Container } from './styles';

interface ActionsPanelProps {
  handleSearch: (newSearchString: string) => void;
  onAddNewModel: () => void;
}

export const ActionsPanel = ({ onAddNewModel, handleSearch }: ActionsPanelProps) => {
  const [searchValue, setSearchValue] = useState('');

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
          onClick={onAddNewModel}
        />
        <IconButton icon={<BrokerOutlineIcon />} tooltip="Графики" onClick={() => null} />
        <IconButton icon={<MenuOutline />} tooltip="Меню" onClick={() => null} />
        <IconButton icon={<SettingsOutline />} tooltip="Настройки" onClick={() => null} />
      </div>
    </Container>
  );
};
