import { useNavigate } from 'react-router-dom';
import { T } from '@admiral-ds/react-ui';
import styled from 'styled-components';
import {
  useActiveQuarter,
  useModelsForConfirmation,
  useSaveQuarterlyConfirmation,
  useSeedPimUsage,
} from '@shared/api/hooks/useQuarterlyConfirmation';
import type { ConfirmationModelRow } from '@shared/api/hooks/useQuarterlyConfirmation';
import { AllocationConfirmationTemplate } from '../templates/AllocationConfirmationTemplate';
import { SeedPimPanel } from '../organisms/SeedPimPanel';
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

const isInnodev = typeof window !== 'undefined' && window.location.hostname.includes('innodev');

export const AllocationConfirmationPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { mutate: seedPim, isPending: isSeeding } = useSeedPimUsage();

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

  const handleCancel = () => {
    navigate('/');
  };

  const handleSave = (editableModels: EditableModel[]) => {
    const quarterInfo = quarterData?.data;
    if (!quarterInfo) return;

    const modelsToSave = editableModels
      .filter((m) => m.edited_is_used !== null && m.edited_is_used !== undefined)
      .map((m) => ({
        model_id: m.model_id,
        confirmation_date: m.edited_confirmation_date,
        is_used: m.edited_is_used,
      }));

    console.log('[ALLOC_DEBUG] Save payload:', {
      quarter: quarterInfo.quarter,
      year: quarterInfo.year,
      modelsCount: modelsToSave.length,
      models: modelsToSave,
    });

    saveConfirmation(
      {
        quarter: quarterInfo.quarter,
        year: quarterInfo.year,
        models: modelsToSave,
      },
      {
        onSuccess: () => {
          showToast({
            message: 'Подтверждение использования успешно сохранено',
            type: 'success',
            duration: 3000,
          });
          navigate('/');
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

  const handleSeedPim = (payload: Parameters<typeof seedPim>[0]) => {
    seedPim(payload, {
      onSuccess: (res) => {
        showToast({ message: `ПИМ засеян: ${res.data.seeded.length} моделей`, type: 'success', duration: 3000 });
      },
      onError: () => {
        showToast({ message: 'Ошибка при засеивании ПИМ данных', type: 'error', duration: 4000 });
      },
    });
  };

  console.log('[ALLOC_DEBUG] quarterInfo:', quarterInfo);
  console.log('[ALLOC_DEBUG] models count:', models.length);
  console.log('[ALLOC_DEBUG] prefill stats:', {
    pim: models.filter((m) => m.prefill_source === 'pim').length,
    previous_quarter: models.filter((m) => m.prefill_source === 'previous_quarter').length,
    no_data: models.filter((m) => m.prefill_source === null).length,
  });
  console.log('[ALLOC_DEBUG] sample models:', models.slice(0, 5).map((m) => ({
    model_id: m.model_id,
    prefill_source: m.prefill_source,
    is_used: m.is_used,
    confirmation_date: m.confirmation_date,
  })));

  const seedPanel = isInnodev && quarterInfo ? (
    <SeedPimPanel
      quarter={quarterInfo.quarter}
      year={quarterInfo.year}
      onSeed={handleSeedPim}
      isSeeding={isSeeding}
    />
  ) : null;

  if (!quarterInfo) {
    return (
      <AllocationConfirmationTemplate
        quarterInfo={null}
        models={[]}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
        seedPanel={seedPanel}
      />
    );
  }

  return (
    <AllocationConfirmationTemplate
      quarterInfo={quarterInfo}
      models={models}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
      seedPanel={seedPanel}
    />
  );
};

