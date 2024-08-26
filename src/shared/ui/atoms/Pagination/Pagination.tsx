import * as React from 'react';
import { PaginationOne } from '@admiral-ds/react-ui';
import styled from 'styled-components';

export interface PaginationProps {
  page: number;
  pageSize: number;
  totalElements: number;
  pageSizes?: number[];
  onChangePage: (result: { page: number; pageSize: number }) => void;
}

const CustomPagination = styled(PaginationOne)`
  background: var(--neutral-neutral-05, #f3f4f6);
  padding: 8px;
  box-sizing: bored-box;
`;

export const Pagination = ({
  page,
  pageSize = 10,
  totalElements,
  pageSizes = [10, 20, 50, 100, 200],
  onChangePage,
}: PaginationProps) => (
  <CustomPagination
    page={page}
    pageSize={pageSize}
    totalItems={totalElements}
    pageSizes={pageSizes}
    onChange={onChangePage}
  />
);
