import { Badge, Button } from '@admiral-ds/react-ui';
import styled, { css } from 'styled-components';

import { ReactComponent as FilterOutline } from '@admiral-ds/icons/build/system/FilterOutline.svg';

const BadgeCount = styled(Badge)<{ appearance: string }>`
  position: absolute;
  top: -9px;
  right: -11px;
  box-sizing: content-box;
  border-radius: 100%;
  ${({ appearance }) =>
    appearance === 'white' &&
    css`
      border: 1px solid ${({ theme }) => theme.color['Neutral/Neutral 40']};
      background-color: ${({ theme }) => theme.color['Neutral/Neutral 00']};

      &:hover {
        background-color: ${({ theme }) => theme.color['Neutral/Neutral 00']};
      }
    `}

  ${({ appearance }) =>
    appearance === 'info' &&
    css`
      border: 2px solid ${({ theme }) => theme.color['Neutral/Neutral 00']};
    `}
`;

const CheckSolidCustom = styled.div`
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid ${({ theme }) => theme.color['Neutral/Neutral 00']};
  border-radius: 50px;
  top: -9px;
  right: -11px;

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.color['Primary/Primary 60 Main']};
  }

  &::after {
    content: '';
    position: absolute;
    width: 3px;
    height: 7px;
    border: solid ${({ theme }) => theme.color['Neutral/Neutral 00']};
    border-width: 0 1.5px 1.5px 0;
    top: 1px;
    left: 4px;
    transform: rotate(45deg);
  }
`;

const ButtonCustom = styled(Button)<{ appearance: string }>`
  ${({ appearance }) =>
    appearance === 'white' &&
    css`
      && {
        background-color: ${({ theme }) => theme.color['Neutral/Neutral 00']};
        border-color: ${({ theme }) => theme.color['Neutral/Neutral 40']};
        color: ${({ theme }) => theme.color['Neutral/Neutral 90']};

        &&&:hover {
          background-color: ${({ theme }) => theme.color['Neutral/Neutral 00']};
          border-color: ${({ theme }) => theme.color['Neutral/Neutral 40']};
        }
      }
    `}
`;

const FilterOutlineCustom = styled(FilterOutline)<{ appearance: string }>`
  & path {
    stroke-width: 0.3;
    ${({ appearance }) =>
      appearance === 'white' &&
      css`
        fill: ${({ theme }) => theme.color['Neutral/Neutral 90']} !important;
        stroke: ${({ theme }) => theme.color['Neutral/Neutral 90']} !important;
      `}
  }
`;

export { BadgeCount, CheckSolidCustom, ButtonCustom, FilterOutlineCustom };

