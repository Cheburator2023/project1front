import React, { useMemo } from 'react';
import { getParentModelOptions } from './helpers';

import { Row } from '../../TableModels/types';
import { SELECT_TYPE, SelectStringProps } from 'src/components/SearchSelect/types';

import { CustomSearchSelect } from './styles';

interface ParentModelSelectProps {
  rows: Partial<Row>[];
  selectedModel?: string;
  onSelectParentModel: (name: string, selectedValue: string[]) => void;
}

export const ParentModelSelect = React.memo(
  ({ rows, selectedModel, onSelectParentModel }: ParentModelSelectProps) => {
    const parentModelOptions: SelectStringProps = useMemo(() => {
      const options = getParentModelOptions(rows);

      return { type: SELECT_TYPE.STRING, options };
    }, [rows, selectedModel]);

    return (
      <CustomSearchSelect
        name="parentModel"
        multiple={false}
        label="Модель родитель"
        options={parentModelOptions}
        selectedValues={selectedModel ? [selectedModel] : undefined}
        onChange={onSelectParentModel}
      />
    );
  },
);

ParentModelSelect.displayName = 'ParentModelSelect';
