import { Button, DateField, Toggle } from '@admiral-ds/react-ui';
import { SearchSelect } from 'src/components';
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

const CustomSearchSelect = styled(SearchSelect)`
  .searchSelect {
    width: 230px;
    border-radius: 4px;
    padding: 4px 8px;
    box-sizing: border-box;
    margin-right: 12px;
    align-items: center;
  }
`;

const FilterButton = styled(Button)`
  margin: 24px 12px 0 0;
`;

export { CustomSearchSelect, CustomToggle, Container, CustomDateField, FilterButton };
