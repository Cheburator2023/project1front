import styled, { css } from 'styled-components';
import {
  DateField,
  DefaultFontColorName,
  Select,
  smallGroupBorderRadius,
  T,
  TProps,
  TYPOGRAPHY,
  typography,
} from '@admiral-ds/react-ui';
import { SearchSelect } from '@src/shared/ui/organisms';
import { type FrameSizeType } from './types';

const TextProps = css<TProps>`
  font-variant-numeric: lining-nums tabular-nums;
  color: ${({ color, theme }) =>
    color ? (theme.color[color] ? theme.color[color] : color) : theme.color[DefaultFontColorName]};
  ${(p) => typography[p.font]};
`;

export const Row = styled('div')<{ css?: any }>`
  display: flex;
  // flex-flow: row wrap;
  ${(p) => p.css};
`;

export const GridRow = styled('div')<{ css?: any }>`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  ${(p) => p.css};
`;

export const Column = styled('div')<{ css?: any }>`
  display: flex;
  flex-flow: column nowrap;
  ${(p) => p.css};
`;

export const Frame = styled('div')<{
  size: FrameSizeType;
  withBorder?: boolean;
  css?: any;
  width?: string | number;
  height?: string | number;
}>`
  z-index: 7;
  box-sizing: border-box;
  background: ${({ theme }) => theme.color['Neutral/Neutral 00']};
  margin: 0 12px 12px 0;
  padding: ${({ size }) =>
    size.startsWith('chart') ? '11px 24px' : size === 'stat-md' ? '16px 15px' : '11px 15px'};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: ${({ width, size }) =>
    width
      ? typeof width === 'string' || typeof width === 'number'
        ? width
        : `${width}px`
      : size === 'chart-lg'
      ? '618px'
      : size === 'chart-md'
      ? '408px'
      : size === 'chart-sm'
      ? '308px'
      : size === 'stat-lg'
      ? '308px'
      : '198px'};
  height: ${({ height, size }) =>
    height
      ? typeof height === 'string' || typeof height === 'number'
        ? height
        : `${height}px`
      : size === 'chart-lg' || size === 'chart-md'
      ? '238px'
      : size === 'chart-sm'
      ? '335px'
      : size === 'stat-lg'
      ? '112px'
      : size === 'stat-md'
      ? '238px'
      : '85px'};
  flex: 0 0 auto;
  border-radius: ${(p) => smallGroupBorderRadius(p.theme.shape)};
  align-content: flex-start;
  flex-wrap: nowrap;

  ${({ withBorder }) =>
    withBorder &&
    css`
      border: 1px solid ${({ theme }) => theme.color['Neutral/Neutral 20']};
      background: ${({ theme }) => theme.color['Neutral/Neutral 00']};
    `}
  ${(p) => p.css};
`;

export const Title = styled(T)`
  flex: 0 0 100%;
  width: 156px;
  ${TextProps};
  font-weight: ${() => `${TYPOGRAPHY.fontWeight.bold}`};
  font-size: 15px;
`;

export const Value = styled(T)`
  display: inline-flex;
  width: auto;
  ${TextProps};
`;

export const Delta = styled(T)`
  display: inline-flex;
  width: auto;
  ${TextProps};
  line-height: 18px;
`;

export const StatusWrapper = styled('div')`
  display: flex;
  width: 100%;
  padding: 50px 0;
  justify-content: center;
`;

export const CustomDateField = styled(DateField)`
  min-width: 320px;
`;

export const CustomSelectField = styled(Select)`
  width: 320px;
`;

export const WrapperFilter = styled('div')`
  min-height: 80px;
  background: var(--neutral-neutral-10, #e5e7eb);
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  box-sizing: border-box;
  padding: 8px 0;
`;

export const WrapperTitle = styled('div')`
  height: 40px;
  background: var(--neutral-neutral-05, #f3f4f6);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  border: 1px solid #eee;
`;

export const Container = styled('div')`
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 16px;
`;

export const ButtonContainer = styled('div')`
  display: flex;
  gap: 10px;
`;

export const FlexContainerFilter = styled('div')`
  display: flex;
  align-items: end;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px 0;

  /* Улучшаем выравнивание для мобильных устройств */
  @media (max-width: 1200px) {
    gap: 12px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
`;

export const Cover = styled('div')`
  z-index: 5;
  background: ${({ theme }) => theme.color['Foundation/Blue/B50']};
  padding: 22px 0;
  display: flex;
  flex-flow: row nowrap;
`;

export const Back = styled('div')`
  z-index: 4;
  background: ${({ theme }) => theme.color['Foundation/Blue/B50']};
  display: flex;
  flex-flow: row nowrap;
  height: calc(100vh - 184px);
`;

export const FlexContainerExport = styled('div')`
  display: flex;
  align-items: center;
`;

export const CustomSearchSelect = styled(SearchSelect)`
  .searchSelect {
    width: 330px;
    border-radius: 4px;
    padding: 4px 8px;
    box-sizing: border-box;
    margin-right: 12px;
    align-items: center;
  }
`;

export const DisabledMetricWrapper = styled('div')`
  position: relative;
  opacity: 0.4;
  pointer-events: none;
  transition: all 0.3s ease;

  /* Полупрозрачный фон */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    border-radius: ${(p) => smallGroupBorderRadius(p.theme.shape)};
    z-index: 1;
  }

  /* Скрываем содержимое виджета */
  > * {
    opacity: 0.3;
  }
`;

