import styled from 'styled-components';
import { Tag } from '@admiral-ds/react-ui';

export type PrefillSource = 'pim' | 'previous_quarter' | null;

type RowStatusChipsProps = {
  prefillSource: PrefillSource;
  isEdited: boolean;
  editedIsUsed: boolean | null;
  prevQuarterLabel: string;
};

const ChipsRow = styled('div')`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  padding: 6px 0;
`;

export const rowStatusLabel = ({
  prefillSource,
  isEdited,
  editedIsUsed,
  prevQuarterLabel,
}: RowStatusChipsProps): string => {
  const parts: string[] = [];
  if (prefillSource === null) {
    parts.push(editedIsUsed === null ? 'Новая модель' : 'Заполнена');
  } else if (prefillSource === 'pim') {
    parts.push(isEdited ? 'ПИМ, изменено' : 'Перенесено из ПИМ');
  } else if (prefillSource === 'previous_quarter') {
    parts.push(
      isEdited
        ? `${prevQuarterLabel}, изменено`
        : `Перенесено из ${prevQuarterLabel}`,
    );
  }
  return parts.join(', ');
};

export const RowStatusChips = ({
  prefillSource,
  isEdited,
  editedIsUsed,
  prevQuarterLabel,
}: RowStatusChipsProps) => {
  const chips: { key: string; label: string; kind: 'neutral' | 'success' | 'primary' | 'warning' | 'danger' }[] = [];

  if (prefillSource === null) {
    if (editedIsUsed === null) {
      chips.push({ key: 'new', label: 'Новая модель', kind: 'warning' });
    } else {
      chips.push({ key: 'filled', label: 'Заполнена', kind: 'primary' });
    }
  } else {
    const sourceLabel =
      prefillSource === 'pim' ? 'ПИМ' : prevQuarterLabel;
    if (isEdited) {
      chips.push({
        key: 'edited',
        label: `Изменено (было: ${sourceLabel})`,
        kind: 'success',
      });
    } else {
      chips.push({
        key: 'carried',
        label: `Перенесено: ${sourceLabel}`,
        kind: 'neutral',
      });
    }
  }

  return (
    <ChipsRow>
      {chips.map((c) => (
        <Tag key={c.key} kind={c.kind} statusViaBackground dimension="s">
          {c.label}
        </Tag>
      ))}
    </ChipsRow>
  );
};
