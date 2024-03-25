import { Checkbox, T } from '@admiral-ds/react-ui';
import React, { useRef } from 'react';

import styled from 'styled-components';
import { Tooltip } from '../Tooltip';

export const Container = styled.label`
  display: flex;
  flex-direction: row;
  padding: 6px 0;
  box-sizing: border-box;
  align-items: center;
  cursor: pointer;
  user-select: none;

  & > div:first-child {
    margin: 0 10px;
    padding: 8px;
  }

  & > div:last-child {
    overflow: hidden;
    text-wrap: nowrap;
    text-overflow: ellipsis;
  }
`;

interface OptionProps {
  text: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CustomOption = ({ text, checked, onChange }: OptionProps) => {
  const textRef = useRef(null);

  return (
    <Container>
      <Checkbox dimension="s" onChange={onChange} checked={checked} />

      <T ref={textRef} font="Body/Body 2 Long" as="div">
        {text}
      </T>
      <Tooltip showOnOverflowOnly targetRef={textRef} title={text} />
    </Container>
  );
};
