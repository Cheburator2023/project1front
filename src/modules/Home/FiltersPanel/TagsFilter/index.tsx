import React, { useState } from 'react';

import { SelectTagsProps } from 'src/components/SearchSelect/types';
import { RightPanel } from 'src/components/RightPanel';

import { CustomSearchSelect } from '../styles';

interface TagsFilterProps {
  options: SelectTagsProps;
  initSelectValues: string[];
  onChange: (name: string, selectValue: string[]) => void;
}

export const TagsFilter = ({
  options: initOptions,
  initSelectValues,
  onChange,
}: TagsFilterProps) => {
  const [openedNewTagModal, setOpenedNewTagModal] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tagType, setTagType] = useState('private');

  const [options, setOptions] = useState(initOptions);

  // const handleSubmit = (newTag: SelectOption & { type: 'private' | 'public' }) => {
  //   setOptions((prevValue) => ({
  //     ...prevValue,
  //     options: [...prevValue.options, newTag],
  //   }));
  // };

  return (
    <>
      <CustomSearchSelect
        id="tags"
        maxRowCount={1}
        label="Теги:"
        name="Теги"
        options={options}
        addNewOptionEnabled
        selectAllEnabled={false}
        onChange={onChange}
        onAddNewOption={(value: string) => {
          setOpenedNewTagModal(true);
          setNewTag(value);
        }}
      />
      <RightPanel
        title="Тест"
        showPanel={openedNewTagModal}
        onClose={() => setOpenedNewTagModal(false)}
      />
      {/* {openedNewTagModal && (
        <Modal
          closeOnEscapeKeyDown
          onClose={() => {
            setOpenedNewTagModal(false);
          }}
          aria-labelledby="modal-title"
        >
          <ModalTitle id="modal-title">Добавление тега</ModalTitle>
          <ModalContent>
            <AddNewTagForm
              newTag={newTag}
              setNewTag={setNewTag}
              setActiveValue={setTagType}
              activeValue={tagType}
            />
          </ModalContent>
          <ModalButtonPanel>
            <Button appearance="primary" dimension="m" onClick={() => null}>
              Сохранить
            </Button>
          </ModalButtonPanel>
        </Modal>
      )} */}
    </>
  );
};
