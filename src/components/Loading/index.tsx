import React from 'react';
import { T, Spinner, Dimension } from '@admiral-ds/react-ui';
import styled from 'styled-components';

interface LoadingProps {
  text: string;
  spinnerSize?: Dimension;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;

  span {
    margin-right: 10px;
  }
`;

export const Loading = ({ text, spinnerSize = 'm' }: LoadingProps) => (
  <Wrapper>
    <T font="Body/Body 1 Long">{text}</T>
    <Spinner dimension={spinnerSize} />
  </Wrapper>
);
