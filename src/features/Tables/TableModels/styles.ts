import styled from 'styled-components';

import { Table } from '@shared/ui';

const CustomTable = styled(Table)`
  .tbody {
    height: calc(100vh - 330px);
  }

  .tr:not(.tbody) {
    background: var(--neutral-neutral-10, #e5e7eb);
  }

  .th {
    padding: 10px 0 8px 8px;
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

export { CustomTable };
