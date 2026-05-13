import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '@admiral-ds/react-ui';
import styled from 'styled-components';
import {
  useActiveQuarter,
  useModelsForConfirmation,
  useSaveQuarterlyConfirmation,
} from '@shared/api/hooks/useQuarterlyConfirmation';
import type { ConfirmationModelRow, SaveConfirmationResult } from '@shared/api/hooks/useQuarterlyConfirmation';
import { ROUTES } from '@app/Routes';
import { AllocationConfirmationTemplate } from '../templates/AllocationConfirmationTemplate';
import { SaveResultModal } from '../molecules/SaveResultModal';
import { Loading, useToast } from '../../../shared/ui/atoms';

type EditableModel = ConfirmationModelRow & {
  edited_confirmation_date: string | null;
  edited_is_used: boolean | null;
};

const LoadingWrapper = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
`;

const ErrorWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  color: #dc2626;
`;

export const AllocationConfirmationPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [saveResult, setSaveResult] = useState<SaveConfirmationResult | null>(null);

  const {
    data: quarterData,
    isLoading: isQuarterLoading,
    error: quarterError,
  } = useActiveQuarter();
  const {
    data: modelsData,
    isLoading: isModelsLoading,
    error: modelsError,
  } = useModelsForConfirmation(!!quarterData?.data);

  const { mutate: saveConfirmation, isPending: isSaving } = useSaveQuarterlyConfirmation();

  const goHome = () => {
    navigate(ROUTES.HOME);
  };

  const handleCancel = () => {
    goHome();
  };

  const handleSave = (editableModels: EditableModel[]) => {
    const quarterInfo = quarterData?.data;
    if (!quarterInfo) return;

    const modelsToSave = editableModels
      .filter((m) => m.edited_is_used !== null && m.edited_is_used !== undefined)
      .map((m) => ({
        system_model_id: m.system_model_id,
        confirmation_date: m.edited_confirmation_date,
        is_used: m.edited_is_used,
      }));

    saveConfirmation(
      {
        quarter: quarterInfo.quarter,
        year: quarterInfo.year,
        models: modelsToSave,
      },
      {
        onSuccess: (res) => {
          setSaveResult(res.data);
        },
        onError: () => {
          showToast({
            message: 'Ошибка при сохранении подтверждения',
            type: 'error',
            duration: 5000,
          });
        },
      },
    );
  };

  if (isQuarterLoading || isModelsLoading) {
    return (
      <LoadingWrapper>
        <Loading text="Загрузка данных..." />
      </LoadingWrapper>
    );
  }

  if (quarterError || modelsError) {
    return (
      <ErrorWrapper>
        <T font="Header/H5">Ошибка загрузки данных</T>
        <T font="Body/Body 1 Long" style={{ marginTop: '8px' }}>
          {quarterError?.message || modelsError?.message || 'Попробуйте обновить страницу'}
        </T>
      </ErrorWrapper>
    );
  }

  const quarterInfo = quarterData?.data ?? null;
  const models = modelsData?.data?.models ?? [];

  if (!quarterInfo) {
    return (
      <AllocationConfirmationTemplate
        quarterInfo={null}
        models={[]}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />
    );
  }

  const handleResultClose = () => {
    setSaveResult(null);
    goHome();
  };

  return (
    <>
      <AllocationConfirmationTemplate
        quarterInfo={quarterInfo}
        models={models}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />
      {saveResult && (
        <SaveResultModal result={saveResult} onClose={handleResultClose} />
      )}
    </>
  );
};

