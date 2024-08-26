import styled from 'styled-components';

import { Table } from '@shared/ui';

export const CompareTable = styled(Table)`
  .tbody {
    height: calc(100vh - 330px);
    div:nth-child(2) > div:nth-child(2) > div:nth-child(even) {
      div > .td {
        background: var(--Cyan-Cyan-10, #e5f6ff);
      }
    }
  }

  .tbody
    > div:nth-child(2)
    > div:nth-child(2)
    > div:nth-child(1)
    > div
    > div.sc-eeKVJR.sc-chbAZy.jSBkFG.crVMXV
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
