import styled from 'styled-components';
import { Spinner, T } from '@admiral-ds/react-ui';
import type { QuarterInfo, ConfirmationModelRow } from '@shared/api/hooks/useQuarterlyConfirmation';
import { QuarterHeader } from '../atoms/QuarterHeader';
import { ConfirmationTable } from '../organisms/ConfirmationTable';

type EditableModel = ConfirmationModelRow & {
  edited_confirmation_date: string | null;
  edited_is_used: boolean | null;
};

type AllocationConfirmationTemplateProps = {
  quarterInfo: QuarterInfo | null;
  models: ConfirmationModelRow[];
  onSave: (models: EditableModel[]) => void;
  onCancel: () => void;
  isSaving: boolean;
};

const PageContainer = styled('div')`
  padding: 16px 24px;
  min-height: calc(100vh - 64px);
  background: #f9fafb;
`;

const NoQuarterMessage = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  color: #6b7280;
`;

const SavingBar = styled('div')`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  padding: 10px 12px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #eff6ff;
  color: #1d4ed8;
`;

export const AllocationConfirmationTemplate = ({
  quarterInfo,
  models,
  onSave,
  onCancel,
  isSaving,
}: AllocationConfirmationTemplateProps) => {
  if (!quarterInfo) {
    return (
      <PageContainer>
        <NoQuarterMessage>
          <T font="Header/H5">Нет активного квартала для подтверждения</T>
          <T font="Body/Body 1 Long" style={{ marginTop: '8px' }}>
            В данный момент нет доступных кварталов для заполнения
          </T>
        </NoQuarterMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <QuarterHeader quarter={quarterInfo.quarter} year={quarterInfo.year} />
      {isSaving && (
        <SavingBar>
          <Spinner dimension="s" />
          <T font="Body/Body 2 Long">Сохранение данных выполняется, дождитесь результата операции</T>
        </SavingBar>
      )}
      <ConfirmationTable
        models={models}
        quarter={quarterInfo.quarter}
        year={quarterInfo.year}
        minDate={quarterInfo.startDate}
        maxDate={quarterInfo.maxDate}
        onSave={onSave}
        onCancel={onCancel}
        isSaving={isSaving}
      />
    </PageContainer>
  );
};

