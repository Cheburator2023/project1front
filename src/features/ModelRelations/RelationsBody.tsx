import React, { useEffect, useState } from 'react';
import {
  T,
  Tree,
  TreeNode,
  type TreeNodeRenderOptionProps,
  InputField,
} from '@admiral-ds/react-ui';
import type { TreeItemProps, TreeProps } from '@admiral-ds/react-ui';
import styled from 'styled-components';

import { ErrorStatus, Loading } from '@shared/ui/atoms';
import { mockedRelationsResponse } from '@shared/api';
import { Relations, RelationsModelResponseType } from '@shared/api/types';
import { useModelsControllerGetModelWithRelations } from '@shared/api/generated/endpoints';
import { initialColumns } from '@shared/constants';

const RelationsModalArtefacts = styled('div')`
  display: flex;
  min-width: 400px;
  height: 100%;
  flex-direction: column;
`;

const RelationsModalArtefactsTitle = styled('div')`
  height: 60px;
  background: var(--Neutral-Neutral-White, #fff);
`;

const RelationsModalArtefactsBody = styled('div')`
  width: 100%;
  height: 620px;
  overflow: auto;
  flex-shrink: 0;
  border-top: 1px solid #d5d8de;
  border-bottom: 1px solid #d5d8de;
  border-left: 1px solid #d5d8de;
  background: var(--Neutral-Neutral-White, #fff);
`;

const RelationsTree = styled(Tree)`
  display: flex;
  width: 100%;
  text-overflow: ellipsis;
  padding: 12px;
  height: 527px;
  flex-shrink: 0;
`;

const RelationsTreeNode = styled(TreeNode)`
  display: flex;
  width: 100%;
  text-overflow: ellipsis;
  flex-shrink: 0;
`;

const StatusWrapper = styled('div')`
  display: flex;
  width: 100%;
  padding: 50px 0;
  justify-content: center;
`;

const RelationsModalBody = styled('div')`
  width: 100%;
  display: flex;
`;

const RelationsModalTree = styled('div')`
  display: flex;
  min-width: 800px;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid #d5d8de;
  overflow-y: scroll;
`;

export const RelationsBody = (props: TreeProps & { modelId: string }) => {
  const [list, setList] = useState(props.model);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItemData, setSelectedItemData] = useState<Relations | null>(null);
  const [resData, setResData] = useState<RelationsModelResponseType | null>(null);

  const extractDataFromId = (id: string) => {
    if (!resData) return null;

    if (id.startsWith('module-')) {
      const index = parseInt(id.split('-')[1], 10);
      return resData?.data?.card?.modules?.[index];
    }

    if (id.startsWith('calibration-')) {
      const index = parseInt(id.split('-')[1], 10);
      return resData?.data?.card?.calibrations?.[index];
    }

    return null;
  };

  const handleSelect = (id: string | null) => {
    if (!id) {
      return;
    }

    const isItemUnselected = selectedId === id;

    const selectedData = !isItemUnselected && extractDataFromId(id);

    setSelectedItemData(selectedData || null);

    setSelectedId(id);

    setList((prevList) =>
      prevList.map((item) => ({
        ...item,
        checked: false,
        children:
          item.children?.map((child) => ({
            ...child,
            checked: false,
            children:
              child.children?.map((grandchild) => ({
                ...grandchild,
                checked: grandchild.id === id && !isItemUnselected,
              })) || [],
          })) || [],
      })),
    );
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const relationsMutation = useModelsControllerGetModelWithRelations({ model_id: props.modelId });

  const handleUpdateData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await relationsMutation.refetch();

      if (result.error) {
        setError('Ошибка загрузки');
        setLoading(false);
        return;
      }

      const resData = result.data as RelationsModelResponseType | null;
      setResData(resData);

      const treeRelations: Array<TreeItemProps> = [
        {
          render: (options: TreeNodeRenderOptionProps) => (
            <RelationsTreeNode key="1" label={resData?.data?.card.model_name} {...options} />
          ),
          id: '1',
          checked: false,
          children: [
            {
              render: (options: TreeNodeRenderOptionProps) => (
                <RelationsTreeNode key="1-1" label="Модули" {...options} />
              ),
              id: '1-1',
              checked: false,
              children: resData?.data?.card.modules?.map((module, index) => {
                return {
                  render: (options: TreeNodeRenderOptionProps) => (
                    <RelationsTreeNode
                      key={`module-${index}`}
                      label={module?.model_name}
                      {...options}
                    />
                  ),
                  id: `module-${index}-id`,
                  checked: false,
                };
              }),
            },
            {
              render: (options: TreeNodeRenderOptionProps) => (
                <RelationsTreeNode key="1-2" label="Калибровки" {...options} />
              ),
              id: '1-2',
              checked: false,
              children: resData?.data?.card.calibrations?.map((calibration, index) => {
                return {
                  render: (options: TreeNodeRenderOptionProps) => (
                    <RelationsTreeNode
                      key={`calibration-${index}`}
                      label={calibration?.model_name}
                      {...options}
                    />
                  ),
                  id: `calibration-${index}-id`,
                  checked: false,
                };
              }),
            },
          ],
        },
      ];
      setList(treeRelations);
      setLoading(false);
    } catch (error) {
      setError('Ошибка загрузки');
      setLoading(false);
    }
  };

  useEffect(() => {
    // TODO: проверить void
    // eslint-disable-next-line no-void
    void handleUpdateData();
  }, [props.modelId]);

  if (error) {
    return (
      <StatusWrapper>
        <ErrorStatus text={error} />
      </StatusWrapper>
    );
  }

  if (loading) {
    return (
      <StatusWrapper>
        <Loading text="Загрузка данных ..." />
      </StatusWrapper>
    );
  }

  return (
    <RelationsModalBody>
      <RelationsModalTree>
        <RelationsTree {...props} model={list} onSelectItem={handleSelect} width={780} />
      </RelationsModalTree>
      <RelationsModalArtefacts>
        <RelationsModalArtefactsTitle>
          <h4
            style={{
              paddingLeft: '16px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '368px',
            }}
          >
            <strong>{selectedItemData ? selectedItemData?.model_name : null}</strong>
          </h4>
        </RelationsModalArtefactsTitle>
        <RelationsModalArtefactsBody>
          <div style={{ margin: '16px' }}>
            {selectedItemData ? (
              <>
                {Object.entries(selectedItemData).map((item, idx) => (
                  <InputField
                    key={idx}
                    style={{ marginBottom: '15px' }}
                    width={368}
                    readOnly
                    label={
                      initialColumns.find((column) => column.name === item[0])?.title ?? item[0]
                    }
                    value={item?.[1]?.toString() ?? ''}
                  />
                ))}
              </>
            ) : (
              <StatusWrapper>
                <T font="Body/Body 2 Short">Ничего не выбрано</T>
              </StatusWrapper>
            )}
          </div>
        </RelationsModalArtefactsBody>
      </RelationsModalArtefacts>
    </RelationsModalBody>
  );
};

