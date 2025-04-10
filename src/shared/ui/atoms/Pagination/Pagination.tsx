import * as React from 'react';
import styled from 'styled-components';

import { PaginationOne } from '@admiral-ds/react-ui';

export interface PaginationProps {
  page: number;
  pageSize: number;
  totalElements: number;
  pageSizes?: number[];
  onChangePage: (result: { page: number; pageSize: number }) => void;
}

const CustomPagination = styled(PaginationOne)`
  box-sizing: border-box;
`;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--neutral-neutral-05, #f3f4f6);
  padding: 8px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  > *:not(:last-child) {
    margin-right: 6px;
  }
  > * {
    flex: 0 0 auto;
  }
`;

export const Pagination = ({
  page = 0,
  pageSize = 10,
  totalElements,
  pageSizes = [10, 20, 50, 100, 200],
  onChangePage,
}: PaginationProps) => {
  return (
    <Container>
      <CustomPagination
        page={page}
        pageSize={pageSize}
        totalItems={totalElements}
        pageSizes={pageSizes}
        onChange={onChangePage}
      />
    </Container>
  );
};
