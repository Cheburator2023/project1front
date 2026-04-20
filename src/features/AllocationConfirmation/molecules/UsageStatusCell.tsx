import styled from 'styled-components';

type UsageStatus = boolean | null;

type UsageStatusCellProps = {
  value: UsageStatus;
  onChange: (next: UsageStatus) => void;
};

const Select = styled('select')`
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
  font-family: inherit;
  background: #fff;
  width: 100%;
  &:focus {
    outline: none;
    border-color: #0132b0;
    box-shadow: 0 0 0 2px rgba(1, 50, 176, 0.1);
  }
`;

const USAGE_OPTIONS: { value: 'unset' | 'true' | 'false'; label: string }[] = [
  { value: 'unset', label: 'Не выбрано' },
  { value: 'true', label: 'Да' },
  { value: 'false', label: 'Нет' },
];

export const usageToOption = (v: UsageStatus): 'unset' | 'true' | 'false' => {
  if (v === true) return 'true';
  if (v === false) return 'false';
  return 'unset';
};

export const optionToUsage = (o: string): UsageStatus => {
  if (o === 'true') return true;
  if (o === 'false') return false;
  return null;
};

export const usageLabel = (v: UsageStatus): string => {
  if (v === true) return 'Да';
  if (v === false) return 'Нет';
  return 'Не выбрано';
};

export const UsageStatusCell = ({ value, onChange }: UsageStatusCellProps) => {
  return (
    <Select
      value={usageToOption(value)}
      onChange={(e) => onChange(optionToUsage(e.target.value))}
      title={usageLabel(value)}
    >
      {USAGE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
};
