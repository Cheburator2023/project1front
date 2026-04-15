import { useNavigate } from 'react-router-dom';
import { T, Button } from '@admiral-ds/react-ui';
import styled from 'styled-components';
import { useState } from 'react';
import {
  useActiveQuarter,
  useModelsForConfirmation,
  useSaveQuarterlyConfirmation,
  useSeedPimUsage,
} from '@shared/api/hooks/useQuarterlyConfirmation';
import type { ConfirmationModelRow } from '@shared/api/hooks/useQuarterlyConfirmation';
import { AllocationConfirmationTemplate } from '../templates/AllocationConfirmationTemplate';
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

const SeedPanel = styled('div')`
  background: #fef9c3;
  border: 1px dashed #ca8a04;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SeedRow = styled('div')`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const SeedInput = styled('input')`
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
  font-family: inherit;
  min-width: 220px;
`;

const SeedLabel = styled('label')`
  font-size: 12px;
  font-weight: 600;
  color: #92400e;
`;

const isInnodev = typeof window !== 'undefined' && window.location.hostname.includes('innodev');

export const AllocationConfirmationPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [seedModelIds, setSeedModelIds] = useState('');
  const [seedIsUsed, setSeedIsUsed] = useState(true);
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

  const handleSeedPim = () => {
    if (!quarterInfo || !seedModelIds.trim()) return;
    const modelIds = seedModelIds
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    console.log('[ALLOC_DEBUG] Seeding PIM usage:', { quarter: quarterInfo.quarter, year: quarterInfo.year, modelIds, is_used: seedIsUsed });
    seedPim(
      {
        quarter: quarterInfo.quarter,
        year: quarterInfo.year,
        models: modelIds.map((model_id) => ({ model_id, is_used: seedIsUsed })),
      },
      {
        onSuccess: (res) => {
          showToast({ message: `ПИМ засеян: ${res.data.seeded.length} моделей`, type: 'success', duration: 3000 });
          setSeedModelIds('');
        },
        onError: () => {
          showToast({ message: 'Ошибка при засеивании ПИМ данных', type: 'error', duration: 4000 });
        },
      },
    );
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
    <SeedPanel>
      <SeedLabel>🧪 [innodev] Засеять данные ПИМ для тестирования приоритетов</SeedLabel>
      <SeedRow>
        <SeedInput
          value={seedModelIds}
          onChange={(e) => setSeedModelIds(e.target.value)}
          placeholder="model_id через запятую или с новой строки"
          title="Введите model_id через запятую или с новой строки"
        />
        <SeedLabel style={{ fontWeight: 400 }}>
          <input
            type="checkbox"
            checked={seedIsUsed}
            onChange={(e) => setSeedIsUsed(e.target.checked)}
            style={{ marginRight: 4 }}
          />
          is_used = {seedIsUsed ? 'true' : 'false'}
        </SeedLabel>
        <Button
          dimension="s"
          appearance="secondary"
          onClick={handleSeedPim}
          disabled={isSeeding || !seedModelIds.trim()}
        >
          <T font="Button/Button 2">{isSeeding ? 'Засевается...' : 'Засеять ПИМ'}</T>
        </Button>
      </SeedRow>
    </SeedPanel>
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

