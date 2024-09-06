import React from 'react';
import styled from 'styled-components';
import { Modal } from '@admiral-ds/react-ui';
import type { ModalProps } from '@admiral-ds/react-ui';

import { HierarchyOutline } from '@shared/ui/icons';
import { IconButton } from '@shared/ui/molecules';

import { RelationsBody } from './RelationsBody';

const RelationsModal = styled(Modal)`
  width: 1200px;
  height: 720px;
  padding: 0;
  border-radius: var(--Large, 8px);
  border: 1px solid var(--Neutral-Neutral-20, #d5d8de);
  background: #fff;
`;

const RelationsModalHeader = styled.div`
  width: 100%;
  height: 61px;
  flex-shrink: 0;
  background: var(--Primary-Primary-10, #edf5ff);
`;

export const ModelRelationsModal = ({ modelId, ...props }: ModalProps & { modelId: string }) => {
  const [opened, setOpened] = React.useState(false);

  return (
    <>
      <IconButton
        tooltip="Взаимосвязи"
        onClick={() => setOpened(true)}
        icon={<HierarchyOutline />}
      />
      {opened && (
        <RelationsModal
          {...props}
          id={`modal-${modelId}`}
          onClose={() => {
            setOpened(false);
          }}
          aria-labelledby="modal-title"
        >
          <RelationsModalHeader>
            <h4 id="modal-title" style={{ paddingLeft: '24px' }}>
              <strong>Взаимосвязи</strong>
            </h4>
          </RelationsModalHeader>
          <RelationsBody model={[]} modelId={modelId} />
        </RelationsModal>
      )}
    </>
  );
};
