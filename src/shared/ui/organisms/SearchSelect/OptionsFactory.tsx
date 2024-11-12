import React from 'react';
import { Option, OptionGroup, Tags, Tag } from '@admiral-ds/react-ui';
import styled from 'styled-components';

import { ReactComponent as PersonSolid } from '@admiral-ds/icons/build/system/PersonSolid.svg';
import { ReactComponent as PeopleSolid } from '@admiral-ds/icons/build/system/PeopleSolid.svg';
// import { ReactComponent as ChevronRightOutline } from '@admiral-ds/icons/build/system/ChevronRightOutline.svg';

import { SELECT_TYPE, OptionsFactoryProps, SelectOption } from './types';
import { CustomOption } from './CustomOption';
import { NOT_NULL_OPTION, EMPTY_OPTION } from './constants';
import { Flexbox } from '../../atoms';

// const Chevron = styled(ChevronRightOutline)<{ $isOpened?: boolean; dimension?: Dimension }>`
//   transition: all 0.3s;
//   & path {
//     fill: ${(p) => p.theme.color['Neutral/Neutral 50']};
//   }
//   width: 100%;
//   height: 100%;
//   transform: ${(p) => {
//     console.log();

//     return p.$isOpened ? 'rotate(90deg)' : 'rotate(0deg)';
//   }};
// `;

// const StyledIconPlacement = styled(IconPlacement)`
//   flex-shrink: 0;
//   margin: 0 16px 0 0;
// `;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;

  span {
    color: #717681;
  }
`;

interface OptionsFactoryI {
  optionsProps: OptionsFactoryProps;
  selectNotNullEnabled: boolean;
  selectEmptyEnabled: boolean;
  selectedValues?: string[];
  onClickItem?: (v: SelectOption, selectedValues?: string[]) => void;
}

export const OptionsFactory = ({
  optionsProps,
  selectedValues,
  selectEmptyEnabled,
  selectNotNullEnabled,
  onClickItem,
}: OptionsFactoryI): JSX.Element => {
  const { type: selectType } = optionsProps;

  switch (selectType) {
    case SELECT_TYPE.TEMPLATES: {
      const { groups } = optionsProps;

      return (
        <>
          {groups.map((group, index) => (
            <OptionGroup key={`${group.text}-${index + 1}`} label={group.text}>
              {group.options.map(({ value, text, filtersCount }) => (
                <Option key={value} value={value}>
                  <TextWrapper>
                    {text}
                    <span>Фильтров: {filtersCount}</span>
                  </TextWrapper>
                </Option>
              ))}
            </OptionGroup>
          ))}
        </>
      );
    }
    case SELECT_TYPE.TAGS: {
      const { options } = optionsProps;

      return (
        <Tags dimension="s">
          {options.map(({ value, text, disabled, type }) => (
            <Option key={value} disabled={disabled} value={value}>
              <Tag
                style={{ cursor: 'pointer' }}
                // eslint-disable-next-line react/destructuring-assignment
                kind={selectedValues?.includes(value) ? 'primary' : 'neutral'}
                statusViaBackground
                icon={type === 'private' ? <PersonSolid /> : <PeopleSolid />}
              >
                {text}
              </Tag>
            </Option>
          ))}
        </Tags>
      );
    }

    default: {
      const { options } = optionsProps;

      return (
        <Flexbox flexDirection="column">
          {selectNotNullEnabled && (
            <Option
              value={NOT_NULL_OPTION.value}
              renderOption={(p) => (
                <CustomOption
                  text={NOT_NULL_OPTION.text}
                  checked={!!selectedValues?.includes(NOT_NULL_OPTION.value)}
                  onChange={() => p.onClickItem?.()}
                />
              )}
            />
          )}
          {selectEmptyEnabled && (
            <Option
              value={EMPTY_OPTION.value}
              renderOption={(p) => (
                <CustomOption
                  text={EMPTY_OPTION.text}
                  checked={!!selectedValues?.includes(EMPTY_OPTION.value)}
                  onChange={() => p.onClickItem?.()}
                />
              )}
            />
          )}
          {options
            .filter(({ visible = true }) => visible)
            .map((option) => {
              const { value, text, disabled, parentsValueIds } = option;
              return (
                <Option
                  key={value}
                  disabled={disabled}
                  value={value}
                  renderOption={(p) => {
                    const padding = parentsValueIds?.length
                      ? 20 * (Number(parentsValueIds?.length) + 1 || 1)
                      : 0;

                    return (
                      <CustomOption
                        text={text}
                        style={{ paddingLeft: padding }}
                        checked={!!selectedValues?.includes(value)}
                        onChange={() => {
                          onClickItem?.(option, selectedValues);
                          return p.onClickItem?.();
                        }}
                      />
                    );
                  }}
                />
              );
            })}
        </Flexbox>
      );
    }
  }
};

