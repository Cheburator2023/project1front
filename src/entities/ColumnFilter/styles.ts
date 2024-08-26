import { DateField } from '@admiral-ds/react-ui';
import { SearchSelect } from '@shared/ui/organisms';
import styled from 'styled-components';

export const CustomDateField = styled(DateField)`
  /* margin-right: 12px;
  width: 230px; */
  margin-top: 15px;

  div {
    border: none;
    border-radius: 0;
  }
`;

export const CustomSearchSelect = styled(SearchSelect)`
  .searchSelect {
    min-width: 150px;
    margin-top: 15px;
    border-radius: 0;
    width: 100%;
    padding: 4px 8px;
    align-items: center;

    div {
      border-radius: 4px;
    }

    .chip {
      max-width: 93px;
      border-radius: 4px;
    }

    .counter {
      border-radius: 4px;
    }

    div {
      border: none;
    }

    #selectValueWrapper {
      padding-left: 0;
    }
  }
`;
