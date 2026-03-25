import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { InputField } from '@admiral-ds/react-ui';
import { ReactComponent as SearchOutline } from '@admiral-ds/icons/build/system/SearchOutline.svg';
import { debounce } from 'lodash';

type ConfirmationSearchBarProps = {
  onSearch: (value: string) => void;
};

const SearchWrapper = styled('div')`
  width: 320px;
`;

export const ConfirmationSearchBar = ({ onSearch }: ConfirmationSearchBarProps) => {
  const [value, setValue] = useState('');

  const debouncedSearch = useMemo(() => debounce(onSearch, 300), [onSearch]);

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    debouncedSearch(e.target.value);
  };

  return (
    <SearchWrapper>
      <InputField
        value={value}
        onChange={handleChange}
        placeholder="Поиск по моделям..."
        dimension="s"
        icons={<SearchOutline width={20} height={20} />}
      />
    </SearchWrapper>
  );
};
