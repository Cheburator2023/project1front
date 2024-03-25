import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { RightPanel } from 'src/components';
import { ModelHistoryChangesResponse } from 'src/api/types';
import { API_ROUTES, useFetch } from 'src/api';
import { Avatar, T } from '@admiral-ds/react-ui';

const HistoryChangeItem = styled.div`
  display: flex;
  align-items: start;
  flex-direction: column;
  margin-bottom: 24px;

  .titleContainer {
    display: flex;
    align-items: center;
    flex-direction: row;

    button {
      margin-right: 8px;
    }

    .title {
      display: flex;
      flex-direction: column;

      span {
        color: ${({ theme }) => theme.color['Neutral/Neutral 50']};
      }
    }
  }

  .value {
    margin-top: 8px;
    color: ${({ theme }) => theme.color['Neutral/Neutral 90']};
  }
`;

interface ModelFormProps {
  modelId: string;
  artifactName: string;
  modelSource?: string;
  onClose: () => void;
}

export const HistoryChanges = ({
  modelId,
  artifactName,
  modelSource = '',
  onClose,
}: ModelFormProps) => {
  const {
    responseData: artifactHistoryData,
    error,
    loading,
  } = useFetch<ModelHistoryChangesResponse>({
    apiRoute: API_ROUTES.MODEL_ARTIFACT_HISTORY,
    params: {
      model_id: modelId,
      artefact_tech_label: artifactName,
      model_source: modelSource,
    },
  });

  const [artifactHistory, setArtifactHistory] = useState<ModelHistoryChangesResponse>();

  useEffect(() => {
    if (!artifactHistoryData) {
      return;
    }

    setArtifactHistory(artifactHistoryData);
  }, [artifactHistoryData]);

  return (
    <RightPanel
      title="История изменений"
      showPanel
      onClose={onClose}
      error={error}
      loading={loading}
      body={
        !artifactHistory?.length ? (
          <T color="Neutral/Neutral 40" font="Subtitle/Subtitle 3">
            История отсутствует
          </T>
        ) : (
          <div>
            {artifactHistory?.map((artifact) => (
              <HistoryChangeItem key={artifact.artefact_id}>
                <div className="titleContainer">
                  <Avatar userName={artifact.editor.username || 'А'} dimension="s" />
                  <div className="title">
                    <T font="Body/Body 2 Short">{artifact.editor.username || 'Автор неизвестен'}</T>
                    <T font="Subtitle/Subtitle 3">{artifact.effective_from.timestamp_formatted}</T>
                  </div>
                </div>
                <T className="value" font="Body/Body 2 Short">
                  {artifact.artefact_value}
                </T>
              </HistoryChangeItem>
            ))}
          </div>
        )
      }
    />
  );
};
