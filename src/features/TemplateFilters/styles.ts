import { Badge, Chips } from '@admiral-ds/react-ui';
import styled from 'styled-components';

export const Wrapper = styled.div`
  padding: 24px;
  box-sizing: border-box;
`;

export const ActionPanelWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 40px;
`;

export const ActionPanelLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 440px;
`;

export const BadgeCustom = styled(Badge)`
  border: 2px solid #fff;
  position: relative;
  top: -15px;
  right: 10px;
  box-sizing: content-box;
  border-radius: 100%;
`;

export const ActionPanelRight = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

export const ActiveTemplate = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const ChipsCustom = styled(Chips)<{ isTemplate: boolean }>`
  background-color: ${({ theme, isTemplate }) =>
    isTemplate ? theme.color['Primary/Primary 60 Main'] : theme.color['Neutral/Neutral 10']};

  border: 1px solid
    ${({ theme, isTemplate }) =>
      isTemplate ? theme.color['Primary/Primary 60 Main'] : theme.color['Neutral/Neutral 40']};

  color: ${({ theme, isTemplate }) =>
    isTemplate ? theme.color['Special/Static White'] : theme.color['Neutral/Neutral 90']};

  &:hover {
    color: ${({ theme, isTemplate }) =>
      isTemplate ? theme.color['Special/Static White'] : theme.color['Neutral/Neutral 90']};
  }

  .close-button svg path {
    fill: ${({ theme, isTemplate }) =>
      isTemplate ? theme.color['Special/Static White'] : theme.color['Neutral/Neutral 90']};
  }
`;

