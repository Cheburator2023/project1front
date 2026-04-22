import styled from 'styled-components';

type ConfirmationDateCellProps = {
  value: string | null;
  min?: string;
  max?: string;
  onChange: (next: string | null) => void;
};

const DateInput = styled('input')`
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
  font-family: inherit;
  width: 100%;
  &:focus {
    outline: none;
    border-color: #0132b0;
    box-shadow: 0 0 0 2px rgba(1, 50, 176, 0.1);
  }
`;

export const ConfirmationDateCell = ({
  value,
  min,
  max,
  onChange,
}: ConfirmationDateCellProps) => {
  const titleParts = ['Дата подтверждения использования модели.'];
  if (min && max) {
    titleParts.push(`Допустимый диапазон: ${min} - ${max}.`);
  }
  if (value) {
    titleParts.push(`Текущее значение: ${value}.`);
  }

  return (
    <DateInput
      type="date"
      value={value ?? ''}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value || null)}
      title={titleParts.join(' ')}
    />
  );
};
