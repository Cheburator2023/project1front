import React from 'react';
import { Tag } from '@admiral-ds/react-ui';

import { ReactComponent as CheckSolid } from '@admiral-ds/icons/build/service/CheckSolid.svg';
import { ReactComponent as InfoSolid } from '@admiral-ds/icons/build/service/InfoSolid.svg';

import { ReactComponent as PeopleSolid } from '@admiral-ds/icons/build/system/PeopleSolid.svg';

import { IconButton } from '@shared/ui/molecules';

import { OptionsFactoryProps, SELECT_TYPE } from '../types';

import { SingleSelectContainer, TagsContainer, CustomTags, MultiSelectContainer } from './styles';
import { getSelectedValuesString } from './helpers';

interface SelectValueProps {
  options: OptionsFactoryProps;
  selectedAllValues: boolean;
  active?: boolean;
  value?: string | string[];
}

export const SelectValue = React.memo(
  ({ value, selectedAllValues, active, options }: SelectValueProps) => {
    const isValueArray = Array.isArray(value);

    if (!isValueArray) {
      return null;
    }

    switch (options.type) {
      case SELECT_TYPE.TEMPLATES: {
        const selectedValueText = options.groups
          .flatMap((group) => group.options)
          .find((option) => option.value === value[0])?.text;

        return (
          <SingleSelectContainer>
            <div
              style={{
                display: 'block',
                width: '90%',
                overflow: 'hidden',
                flexDirection: 'row',
                textOverflow: 'ellipsis',
              }}
            >
              {active ? selectedValueText : 'Не активен'}
            </div>
            {active ? (
              <IconButton tooltip="Шаблон активен" color="#1BA049" icon={<CheckSolid />} />
            ) : (
              <IconButton tooltip="Шаблон не активен" color="#0062FF" icon={<InfoSolid />} />
            )}
          </SingleSelectContainer>
        );
      }
      case SELECT_TYPE.TAGS: {
        return (
          <TagsContainer>
            <CustomTags dimension="s">
              {/* <Tag style={{ width: '100px' }}>test</Tag> */}

              {value.map((item) => (
                <Tag statusViaBackground kind="primary" icon={<PeopleSolid />} key={item}>
                  {item}
                </Tag>
              ))}
            </CustomTags>
          </TagsContainer>
        );
      }
      default: {
        const selectedValuesString = getSelectedValuesString(
          options.options,
          value,
          selectedAllValues,
        );

        return (
          <MultiSelectContainer>
            ({value.length}) {selectedValuesString}
          </MultiSelectContainer>
        );
      }
    }
  },
);

SelectValue.displayName = 'SelectValue';

