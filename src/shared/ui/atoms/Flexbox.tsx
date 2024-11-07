/* eslint-disable no-nested-ternary */
import { Theme } from '@admiral-ds/react-ui';
import React from 'react';
import styled, { StyledComponent } from 'styled-components';

export type TFlexboxProps = {
  fillChild?: boolean;
  height?: number | string;
  width?: number | string;
  flexDirection?:
    | 'row'
    | 'col'
    | 'column'
    | 'row-reverse'
    | 'column-reverse'
    | 'col-reverse'
    | 'inherit'
    | 'initial'
    | 'unset';
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  gap?: number;
  justifyContent?:
    | 'start'
    | 'end'
    | 'center'
    | 'left'
    | 'right'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
    | 'stretch'
    | 'baseline'
    | 'first baseline'
    | 'last baseline'
    | 'safe center'
    | 'unsafe center'
    | 'flex-start'
    | 'flex-end';
  alignContent?:
    | 'start'
    | 'end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
    | 'stretch'
    | 'baseline'
    | 'first baseline'
    | 'last baseline'
    | 'safe center'
    | 'unsafe center';
  alignItems?:
    | 'start'
    | 'end'
    | 'center'
    | 'stretch'
    | 'self-start'
    | 'self-end'
    | 'baseline'
    | 'first baseline'
    | 'last baseline'
    | 'safe center'
    | 'unsafe center'
    | 'flex-start'
    | 'flex-end';
  flexShrink?: number | string;
  flexGrow?: number | string;
  flexBasis?: number | string;
};

const FlexboxInner = styled('div')<TFlexboxProps>`
  display: flex;
  ${(props) => `
    ${
      props.height || typeof props.height === 'number'
        ? `height: ${typeof props.height === 'number' ? `${props.height}px` : props.height};`
        : ''
    }
    ${
      props.width || typeof props.width === 'number'
        ? `width: ${typeof props.width === 'number' ? `${props.width}px` : props.width};`
        : ''
    }
    flex-direction: ${
      props.flexDirection === 'col'
        ? 'column'
        : props.flexDirection === 'col-reverse'
        ? 'column-reverse'
        : props.flexDirection ?? 'row'
    };
    ${props.wrap ? `flex-wrap: ${props.wrap};` : ''}
    justify-content: ${props.justifyContent ?? 'stretch'};
    ${props.alignContent ? `align-content: ${props.alignContent};` : ''}
    align-items: ${props.alignItems ?? 'stretch'};
    ${props.gap ? `grid-gap: ${props.gap}px;` : ''}
    ${
      props.flexShrink || typeof props.flexShrink === 'number'
        ? `flex-shrink: ${
            typeof props.flexShrink === 'number' ? `${props.flexShrink}` : props.flexShrink
          };`
        : ''
    }
    ${
      props.flexGrow || typeof props.flexGrow === 'number'
        ? `flex-grow: ${typeof props.flexGrow === 'number' ? `${props.flexGrow}` : props.flexGrow};`
        : ''
    }
    ${props.flexBasis ? `flex-basis: ${props.flexBasis};` : ''}

    & > * {
    ${props.fillChild ? `width: 100%;` : ''}
    }
    
  `}
`;

export const Flexbox: StyledComponent<'div', Theme, TFlexboxProps, never> = React.forwardRef(
  (props, ref?: React.Ref<HTMLDivElement>) => <FlexboxInner {...props} ref={ref} />,
) as StyledComponent<'div', Theme, TFlexboxProps, never>;

