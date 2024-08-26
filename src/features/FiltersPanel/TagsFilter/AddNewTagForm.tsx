import React, { useState } from 'react';
import { InputField } from '@admiral-ds/react-ui';

import { ReactComponent as PersonSolid } from '@admiral-ds/icons/build/system/PersonSolid.svg';
import { ReactComponent as PeopleSolid } from '@admiral-ds/icons/build/system/PeopleSolid.svg';

const list = [
  {
    value: 'private',
    title: (
      <>
        <PersonSolid width={17} style={{ marginRight: 8 }} />
        Приватный
      </>
    ),
  },
  {
    value: 'public',
    title: (
      <>
        <PeopleSolid width={17} style={{ marginRight: 8 }} />
        Публичный
      </>
    ),
  },
];

interface AddNewTagFormProps {
  newTag: string;
  setNewTag: (newTag: string) => void;
  setActiveValue: (newValue: string) => void;
  activeValue: string;
}

export const AddNewTagForm = ({
  activeValue,
  newTag,
  setNewTag,
  setActiveValue,
}: AddNewTagFormProps) => {
  // const handleSubmit = () => {
  //   onSubmit(newTag);
  // }
  console.log('test');

  return (
    <div>
      <InputField
        label="Название тега"
        value={newTag}
        onChange={(e) => {
          setNewTag(e.target.value);
        }}
      />
      {/* <Field label="Видимость тега" style={{ marginTop: '20px' }}>
        <ContentSwitcher dimension="s">
          {list.map(({ value, title }) => (
            <ContentSwitcherItem
              key={value}
              active={value === activeValue}
              onClick={() => setActiveValue(value)}
            >
              {title}
            </ContentSwitcherItem>
          ))}
        </ContentSwitcher>
      </Field> */}
    </div>
  );
};
