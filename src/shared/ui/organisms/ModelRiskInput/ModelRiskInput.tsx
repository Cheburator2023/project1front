import {
  useState,
  useEffect,
  ChangeEvent,
  LabelHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  Dispatch,
  SetStateAction,
  JSX,
} from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const InputWrapper = styled.div`
  flex: 1;
`;

const SelectWrapper = styled.div`
  width: 120px;
`;

const HintText = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & { className?: string };
const BaseLabel = ({ className, ...props }: LabelProps) => (
  <label className={className} {...props} />
);

type InputProps = InputHTMLAttributes<HTMLInputElement> & { className?: string };
const BaseInput = ({ className, ...props }: InputProps) => (
  <input className={className} {...props} />
);

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { className?: string };
const BaseSelect = ({ className, ...props }: SelectProps) => (
  <select className={className} {...props} />
);

const StyledInput = styled(BaseInput)`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }

  &.error {
    border-color: #ff4d4f;
  }
`;

const StyledSelect = styled(BaseSelect)`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Label = styled(BaseLabel)`
  display: block;
  font-weight: 500;
  margin-bottom: 4px;
  font-size: 14px;

  &.required::after {
    content: ' *';
    color: #ff4d4f;
  }
`;

interface ModelRiskInputProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
  label?: string;
  id?: string;
}

/**
 * Custom component for Model Risk Coefficient (КМР) input
 *
 * Features:
 * - Input field accepts values from 0 to 100
 * - Special dropdown menu for selecting 200%
 * - Validation and user hints
 */
const createInputChangeHandler =
  (setInputValue: Dispatch<SetStateAction<string>>, onChange: (value: string | null) => void) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const cleaned = raw.replace(/\D+/g, '');

      setInputValue(cleaned);

      if (cleaned === '') {
        onChange(null);
        return;
      }

      let num = Number(cleaned);

      if (num < 0) num = 0;
      if (num > 100) num = 100;

      const result = String(num);
      setInputValue(result);
      onChange(result);
    };

const createSelectChangeHandler =
  (
    setSelectValue: Dispatch<SetStateAction<'standard' | 'special'>>,
    setInputValue: Dispatch<SetStateAction<string>>,
    onChange: (value: string | null) => void,
    getInputValue: () => string,
  ) =>
  (e: ChangeEvent<HTMLSelectElement>) => {
    const newSelectValue = e.target.value as 'standard' | 'special';
    setSelectValue(newSelectValue);

    if (newSelectValue === 'special') {
      setInputValue('');
      onChange('200');
    } else {
      const currentInputValue = getInputValue();
      onChange(currentInputValue || null);
    }
  };

export const ModelRiskInput = ({
  value,
  onChange,
  disabled = false,
  error = false,
  required = false,
  label = 'Коэффициент модельного риска (КМР)',
  id = 'model_risk_input',
}: ModelRiskInputProps): JSX.Element => {
  const [inputValue, setInputValue] = useState<string>('');
  const [selectValue, setSelectValue] = useState<'standard' | 'special'>('standard');

  // Initialize values on load
  useEffect(() => {
    if (value === '200') {
      setSelectValue('special');
      setInputValue('');
    } else if (value) {
      setSelectValue('standard');
      setInputValue(value);
    } else {
      setSelectValue('standard');
      setInputValue('');
    }
  }, [value]);

  const handleInputChange = createInputChangeHandler(setInputValue, onChange);
  const handleSelectChange = createSelectChangeHandler(
    setSelectValue,
    setInputValue,
    onChange,
    () => inputValue,
  );

  const isInputDisabled = disabled || selectValue === 'special';

  return (
    <div>
      <Label className={required ? 'required' : ''} htmlFor={id}>
        {label}
      </Label>
      <Container>
        <InputWrapper>
          <StyledInput
            id={id}
            type="number"
            value={selectValue === 'special' ? '' : inputValue}
            onChange={handleInputChange}
            disabled={isInputDisabled}
            placeholder={selectValue === 'special' ? '200%' : 'Введите значение от 0 до 100'}
            min={0}
            max={100}
            step={1}
            className={error ? 'error' : ''}
          />
          <HintText>
            Введите значение от 0 до 100 в поле ввода. Для выбора значения &quot;200&quot;
            используйте выпадающее меню.
          </HintText>
        </InputWrapper>

        <SelectWrapper>
          <StyledSelect value={selectValue} onChange={handleSelectChange} disabled={disabled}>
            <option value="standard">0-100%</option>
            <option value="special">200%</option>
          </StyledSelect>
        </SelectWrapper>
      </Container>
    </div>
  );
};

