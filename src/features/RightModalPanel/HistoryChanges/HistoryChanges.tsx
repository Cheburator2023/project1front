import React, { useEffect, useState } from 'react';
import { Avatar, T } from '@admiral-ds/react-ui';

import { RightPanel } from '@shared/ui/organisms';
import { API_ROUTES, useFetch, ModelHistoryChangesResponse } from '@shared/api';

import { HistoryChangeItem, Wrapper } from './styles';

export interface ModelFormProps {
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
        <Wrapper>
          {!artifactHistory?.length ? (
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
                      <T font="Body/Body 2 Short">
                        {artifact.editor.username || 'Автор неизвестен'}
                      </T>
                      <T font="Subtitle/Subtitle 3">
                        {artifact.effective_from.timestamp_formatted}
                      </T>
                    </div>
                  </div>
                  <T className="value" font="Body/Body 2 Short">
                    {artifact.artefact_value}
                  </T>
                </HistoryChangeItem>
              ))}
            </div>
          )}
        </Wrapper>
      }
    />
  );
};
