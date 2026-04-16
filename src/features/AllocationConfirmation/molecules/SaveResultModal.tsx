import { Modal, ModalTitle, Button, T } from '@admiral-ds/react-ui';
import styled from 'styled-components';
import type { SaveConfirmationResult } from '@shared/api/hooks/useQuarterlyConfirmation';

const ModalContent = styled('div')`
  padding: 0 24px 24px;
`;

type SaveResultModalProps = {
  result: SaveConfirmationResult;
  onClose: () => void;
};

const Section = styled.div`
  margin-bottom: 16px;
`;

const StatRow = styled('div')`
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled(T).attrs({ font: 'Body/Body 2 Long' })`
  color: #6b7280;
`;

const StatValue = styled(T).attrs({ font: 'Body/Body 2 Long' })`
  font-weight: 600;
`;

const ErrorBlock = styled('div')`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 10px 12px;
  margin-top: 8px;
`;

const ErrorItem = styled('div')`
  padding: 4px 0;
  font-size: 13px;
  color: #991b1b;
  word-break: break-all;
`;

const Badge = styled('span')<{ $variant: 'success' | 'warn' | 'neutral' }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  ${({ $variant }) =>
    $variant === 'success'
      ? 'background: #dcfce7; color: #166534;'
      : $variant === 'warn'
        ? 'background: #fef9c3; color: #854d0e;'
        : 'background: #f3f4f6; color: #6b7280;'}
`;

const ButtonRow = styled('div')`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const quarterLabel = (q: number) => `Q${q}`;

export const SaveResultModal = ({ result, onClose }: SaveResultModalProps) => {
  const hasSumSyncErrors = result.sumSyncErrors.length > 0;
  const sumModelsCount = result.models.filter((m) => m.sum === true).length;
  const mrmOnlyCount = result.models.filter((m) => m.sum === false).length;

  return (
    <Modal onClose={onClose} dimension="m" style={{ maxWidth: 520 }}>
      <ModalTitle>Результат сохранения</ModalTitle>
      <ModalContent>
        <Section>
          <T font="Subtitle/Subtitle 2" style={{ marginBottom: 8 }}>
            Общая информация
          </T>
          <StatRow>
            <StatLabel>Период</StatLabel>
            <StatValue>
              {quarterLabel(result.quarter)} {result.year}
            </StatValue>
          </StatRow>
          <StatRow>
            <StatLabel>Моделей в запросе</StatLabel>
            <StatValue>{result.totalInPayload}</StatValue>
          </StatRow>
          <StatRow>
            <StatLabel>Сохранено в СУМ-РМ</StatLabel>
            <StatValue>
              {result.savedToMrm}{' '}
              <Badge $variant="success">OK</Badge>
            </StatValue>
          </StatRow>
        </Section>

        <Section>
          <T font="Subtitle/Subtitle 2" style={{ marginBottom: 8 }}>
            Синхронизация с СУМ
          </T>
          <StatRow>
            <StatLabel>Синхронизировано в СУМ</StatLabel>
            <StatValue>
              {result.syncedToSum}{' '}
              {result.syncedToSum > 0 && <Badge $variant="success">OK</Badge>}
              {result.syncedToSum === 0 && <Badge $variant="neutral">нет моделей СУМ</Badge>}
            </StatValue>
          </StatRow>
          <StatRow>
            <StatLabel>Только в СУМ-РМ (не из СУМ)</StatLabel>
            <StatValue>{mrmOnlyCount}</StatValue>
          </StatRow>
          {sumModelsCount > 0 && (
            <StatRow>
              <StatLabel>Модели из СУМ (синхронизированы)</StatLabel>
              <StatValue>{sumModelsCount}</StatValue>
            </StatRow>
          )}
        </Section>

        {hasSumSyncErrors && (
          <Section>
            <T font="Subtitle/Subtitle 2" style={{ marginBottom: 4, color: '#dc2626' }}>
              Ошибки синхронизации СУМ ({result.sumSyncErrors.length})
            </T>
            <T font="Caption/Caption 1" style={{ color: '#6b7280', marginBottom: 8 }}>
              Данные сохранены в СУМ-РМ, но не синхронизированы в СУМ для этих моделей
            </T>
            <ErrorBlock>
              {result.sumSyncErrors.map((e) => (
                <ErrorItem key={e.model_id}>
                  <strong>{e.model_id}</strong>: {e.error}
                </ErrorItem>
              ))}
            </ErrorBlock>
          </Section>
        )}

        <Section>
          <T font="Subtitle/Subtitle 2" style={{ marginBottom: 8 }}>
            Детали по моделям
          </T>
          <div style={{ maxHeight: 200, overflow: 'auto' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                  <th style={{ padding: '4px 8px' }}>Модель</th>
                  <th style={{ padding: '4px 8px' }}>Используется</th>
                  <th style={{ padding: '4px 8px' }}>СУМ-РМ</th>
                  <th style={{ padding: '4px 8px' }}>СУМ</th>
                </tr>
              </thead>
              <tbody>
                {result.models.map((m) => (
                  <tr key={m.model_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '4px 8px', fontFamily: 'monospace', fontSize: 12 }}>
                      {m.model_id}
                    </td>
                    <td style={{ padding: '4px 8px' }}>
                      {m.is_used === true ? 'Да' : m.is_used === false ? 'Нет' : '—'}
                    </td>
                    <td style={{ padding: '4px 8px' }}>
                      {m.mrm ? <Badge $variant="success">OK</Badge> : '—'}
                    </td>
                    <td style={{ padding: '4px 8px' }}>
                      {m.sum === true && <Badge $variant="success">OK</Badge>}
                      {m.sum === false && <Badge $variant="neutral">—</Badge>}
                      {m.sum === null && <Badge $variant="warn">ошибка</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <ButtonRow>
          <Button dimension="m" appearance="primary" onClick={onClose}>
            ОК
          </Button>
        </ButtonRow>
      </ModalContent>
    </Modal>
  );
};
