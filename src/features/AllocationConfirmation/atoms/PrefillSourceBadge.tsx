import styled from 'styled-components';
import { T } from '@admiral-ds/react-ui';

type PrefillSource = 'pim' | 'previous_quarter' | null;

type PrefillSourceBadgeProps = {
  source: PrefillSource;
};

const LABELS: Record<string, string> = {
  pim: 'ПИМ',
  previous_quarter: 'Предыдущий квартал',
};

const COLORS: Record<string, string> = {
  pim: '#e0f2fe',
  previous_quarter: '#fef3c7',
};

const BORDER_COLORS: Record<string, string> = {
  pim: '#7dd3fc',
  previous_quarter: '#fcd34d',
};

const Badge = styled('span')<{ $bg: string; $border: string }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  background: ${({ $bg }) => $bg};
  border: 1px solid ${({ $border }) => $border};
  white-space: nowrap;
`;

const NoBadge = styled('span')`
  color: #9ca3af;
  font-style: italic;
`;

export const PrefillSourceBadge = ({ source }: PrefillSourceBadgeProps) => {
  if (!source) {
    return (
      <NoBadge>
        <T font="Caption/Caption 1">Нет данных</T>
      </NoBadge>
    );
  }

  return (
    <Badge $bg={COLORS[source]} $border={BORDER_COLORS[source]}>
      <T font="Caption/Caption 1">{LABELS[source]}</T>
    </Badge>
  );
};
