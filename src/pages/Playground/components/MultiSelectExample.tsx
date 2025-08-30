import * as React from 'react';

import { Option, Select, T } from '@admiral-ds/react-ui';
import type { SelectProps } from '@admiral-ds/react-ui';

export const SearchSelectCustomOptionMultiTemplate = (props: SelectProps) => {
  const [selectValue, setSelectValue] = React.useState<string[]>(
    Array.from({ length: 15 }).map((_, ind) => String(ind)),
  );

  const handleSelectedChange = (value: string | Array<string>) => {
    if (Array.isArray(value)) setSelectValue(value);
  };

  return (
      <Select
        {...props}
        value={selectValue}
        multiple
        onChange={handleSelectedChange as any}
        mode="searchSelect"
      >
        {Array.from({ length: 20 }).map((_option, ind) => (
          <Option key={ind} value={`${ind}0000`} renderChip={() => `${ind}0000`}>
            {`${ind}0000`}
          </Option>
        ))}
      </Select>
  );
};

