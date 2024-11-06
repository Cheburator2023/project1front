import { Badge } from '@admiral-ds/react-ui';
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

