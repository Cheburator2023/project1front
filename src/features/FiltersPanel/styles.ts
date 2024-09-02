import { Button, DateField, Toggle } from '@admiral-ds/react-ui';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 80px;
  background: var(--neutral-neutral-10, #e5e7eb);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  padding: 12px;
  box-sizing: border-box;
`;

const CustomToggle = styled(Toggle)`
  margin-top: 21px;
`;

const CustomDateField = styled(DateField)`
  margin-right: 12px;
  width: 230px;
`;

const FilterButton = styled(Button)`
  margin: 24px 12px 0 0;
`;

const FiltersBox = styled.div`
  display: flex;
  align-items: center;
`;

const FiltersDivider = styled.div`
  width: 2px;
  height: 32px;
  background: #000;
  box-shadow: 3px 0 4px 0 #fff inset;
`;

export { CustomToggle, Container, CustomDateField, FilterButton, FiltersDivider, FiltersBox };
