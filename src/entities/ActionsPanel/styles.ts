import { SearchInput } from '@shared/ui/organisms';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 40px;
  background: var(--neutral-neutral-05, #f3f4f6);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  box-sizing: border-box;
  border: 1px solid #eee;
`;

const CustomSearchInput = styled(SearchInput)`
  width: 300px;

  div {
    border: none;
  }

  input {
    background: inherit;
  }
`;

export { Container, CustomSearchInput };
