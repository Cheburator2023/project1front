import { InputField } from '@admiral-ds/react-ui';
import React from 'react';

import { ReactComponent as SearchIcon } from '@admiral-ds/icons/build/system/SearchOutline.svg';
import { IconButton } from '../IconButton';

interface SearchInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchClick?: () => void;
  value: string;
  placeholder: string;
  className?: string;
}

const SearchInput = ({
  onChange,
  onSearchClick,
  value,
  placeholder,
  className,
}: SearchInputProps) => (
  <InputField
    className={className}
    dimension="s"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    icons={
      <IconButton
        icon={<SearchIcon />}
        tooltip={onSearchClick ? 'Искать' : ''}
        onClick={onSearchClick}
      />
    }
    displayClearIcon
  />
);

export { SearchInput };
