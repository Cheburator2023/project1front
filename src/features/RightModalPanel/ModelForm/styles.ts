import { SearchSelect } from '@shared/ui/organisms';
import styled from 'styled-components';

const CustomSearchSelect = styled(SearchSelect)`
  div {
    border: none;
  }

  div:empty {
    display: none;
  }

  width: 308px;
  margin-top: 8px;
  padding-right: 12px;
`;

const FormContainer = styled.form`
  padding: 16px 24px;
  box-sizing: border-box;

  > * {
    margin-bottom: 20px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;

  button {
    width: 152px;
  }
`;

export { CustomSearchSelect, FormContainer, ButtonContainer };
