import React, { useMemo } from 'react';

import { SELECT_TYPE, SelectStringProps } from '@shared/ui/organisms';

import { getParentModelOptions } from './helpers';
import { Row } from '../../TableModels/types';
import { CustomSearchSelect } from './styles';

export interface ParentModelSelectProps {
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
