import { Checkbox, T } from '@admiral-ds/react-ui';
import React, { useRef } from 'react';

import styled from 'styled-components';
import { Tooltip } from '@shared/ui/atoms';

export const Container = styled.label`
  display: flex;
  flex-direction: row;
  padding: 6px 0;
  height: 30px;
  box-sizing: border-box;
  align-items: center;
  cursor: pointer;
  user-select: none;
  overflow: hidden;
  text-wrap: nowrap;

  div {
    overflow: hidden;
    text-wrap: nowrap;
    text-overflow: ellipsis;
  }

  & > div:first-child {
    margin: 0 10px;
    padding: 8px;
  }
`;

const Label = styled(T)`
  overflow: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;
`;

interface OptionProps {
  text: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CustomOption = ({ text, checked, onChange }: OptionProps) => {
  const textRef = useRef(null);

  return (
    <Container key={text}>
      <Checkbox dimension="s" onChange={onChange} checked={checked} />

      <Label ref={textRef} font="Body/Body 2 Long" as="div">
        {text}
      </Label>
      <Tooltip showOnOverflowOnly targetRef={textRef} title={text} />
    </Container>
  );
};
