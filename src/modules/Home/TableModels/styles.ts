import { Table } from '@admiral-ds/react-ui';
import styled from 'styled-components';

import { SearchSelect } from '../../../components/SearchSelect';

const CustomTable = styled(Table)`
  .tbody {
    height: calc(100vh - 330px);
  }

  .tr:not(.tbody) {
    background: var(--neutral-neutral-10, #e5e7eb);
  }

  .th {
    padding: 10px 0 8px 8px;
    min-width: 200px !important;
  }

  .th > div > div > div:first-child {
    width: 100%;
  }

  .th > div > div {
    text-align: left;
    flex-direction: row;
  }

  .td {
    padding: 0;
    margin: 0;
    height: 70px;
  }

  .td div {
    overflow: hidden;
    text-overflow: ellipsis;
    height: 100%;
  }
`;

const CustomSearchSelect = styled(SearchSelect)`
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

export { CustomTable, CustomSearchSelect };
