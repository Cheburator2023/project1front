import { Select } from '@admiral-ds/react-ui';
import styled, { css } from 'styled-components';

import { SearchInput } from '../SearchInput';

export const CustomSelect = styled(Select)`
  #selectValueWrapper {
    padding-left: 0px;
    flex-wrap: nowrap;
    height: 24px;
    padding-left: 0;
  }
`;
export const DropDownBottomPanelContainer = styled.div`
  padding: 8px 10px 0 10px;

  button {
    width: 100%;
  }
`;

export const CustomSearchInput = styled(SearchInput)`
  margin-bottom: 5px;

  div {
    border: none;
    padding-left: 0;
  }

  div:empty {
    display: none;
  }

  input {
    background: inherit;
  }
`;

export const DropContainerCssMixin = css`
  & > div {
    max-height: 300px;
  }
`;

