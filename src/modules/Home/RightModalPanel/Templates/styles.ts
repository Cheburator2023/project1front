import { DropdownContainer, mediumGroupBorderRadius, MenuItem, T } from '@admiral-ds/react-ui';
import styled from 'styled-components';

export const StyledDropdownContainer = styled(DropdownContainer)`
  ${(p) => p.theme.shadow['Shadow 08']}
  border-radius: ${(p) => mediumGroupBorderRadius(p.theme.shape)};
  overflow: hidden;
  width: 100%;
`;

export const StyledMenuItem = styled(MenuItem)`
  justify-content: flex-start;
`;

export const IconWrapper = styled.div`
  width: 20px;
  height: 20px;
  margin-right: 8px;
`;

export const BodyWrapper = styled.div`
  height: 100%;
`;

export const TemplatesGroupWrapper = styled.div<{ $users?: boolean }>`
  height: ${(props) => (props.$users ? '60%' : '40%')};
  overflow: hidden;
  box-sizing: border-box;
`;

export const TemplatesGroup = styled.div`
  overflow-y: scroll;
  box-sizing: border-box;
  padding: 0 24px;
  height: calc(100% - 52px);
`;

export const TemplatesGroupLabel = styled(T)`
  display: flex;
  box-sizing: border-box;
  padding: 16px 24px;
`;
