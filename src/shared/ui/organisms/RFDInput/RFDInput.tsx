import React, { useState, useEffect, useRef } from 'react';
import { InputField, Field } from '@admiral-ds/react-ui';

interface RFDInputProps {
  id: string;
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  autoFocus?: boolean;
  extraText?: React.ReactNode;
}

const RFD_PREFIX = 'RFD-';
const DEFAULT_VALUE = 'Нет';

export const RFDInput: React.FC<RFDInputProps> = ({
  id,
  label,
  value = '',
  onChange,
  disabled = false,
  required = false,
  error = false,
  autoFocus = false,
  extraText,
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize display value
  useEffect(() => {
    if (!value || value === DEFAULT_VALUE) {
      setDisplayValue(DEFAULT_VALUE);
    } else if (value.startsWith(RFD_PREFIX)) {
      setDisplayValue(value);
    } else {
      // If value doesn't start with RFD-, treat it as a number and add prefix
      setDisplayValue(`${RFD_PREFIX}${value}`);
    }
  }, [value]);

  // Restore cursor position after state update
  useEffect(() => {
    if (inputRef.current && cursorPosition > 0) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [displayValue, cursorPosition]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    const wasEmptyOrDefault = displayValue === '' || displayValue === DEFAULT_VALUE;

    // If user clears the input completely, set to default value
    if (!inputValue.trim()) {
      setDisplayValue(DEFAULT_VALUE);
      onChange?.(DEFAULT_VALUE);
      return;
    }

    // If input is just the prefix or starts with prefix but has no numbers, treat as empty
    if (inputValue === RFD_PREFIX || (inputValue.startsWith(RFD_PREFIX) && inputValue.length === RFD_PREFIX.length)) {
      setDisplayValue(DEFAULT_VALUE);
      onChange?.(DEFAULT_VALUE);
      return;
    }

    // Ensure the input starts with RFD-
    let processedValue = inputValue;
    if (!inputValue.startsWith(RFD_PREFIX)) {
      processedValue = `${RFD_PREFIX}${inputValue}`;
    }

    // Remove any non-numeric characters after RFD-
    const prefixLength = RFD_PREFIX.length;
    const afterPrefix = processedValue.slice(prefixLength);
    const numericOnly = afterPrefix.replace(/[^0-9]/g, '');
    
    // If no numbers after prefix, show default value
    if (!numericOnly) {
      setDisplayValue(DEFAULT_VALUE);
      onChange?.(DEFAULT_VALUE);
      return;
    }
    
    const finalValue = `${RFD_PREFIX}${numericOnly}`;

    setDisplayValue(finalValue);
    setCursorPosition(wasEmptyOrDefault ? finalValue.length : cursorPos);

    // Call onChange with the processed value
    onChange?.(finalValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursorPos = input.selectionStart || 0;
    const prefixLength = RFD_PREFIX.length;

    // Allow navigation keys
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'].includes(e.key)) {
      return;
    }

    // Allow deletion keys
    if (['Backspace', 'Delete'].includes(e.key)) {
      // Prevent deleting the RFD- prefix when already present
      if (displayValue.startsWith(RFD_PREFIX)) {
        if (e.key === 'Backspace' && cursorPos <= prefixLength) {
          e.preventDefault();
        }
      }
      return;
    }

    // If field is empty or shows default text, allow typing digits to start fresh
    if (displayValue === '' || displayValue === DEFAULT_VALUE) {
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
      }
      return;
    }

    // Allow only numeric keys after the prefix
    if (cursorPos < prefixLength) {
      e.preventDefault();
      return;
    }

    // Allow only digits
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // If the field is empty or shows default, keep it as is
    if (!displayValue || displayValue === DEFAULT_VALUE) {
      setDisplayValue(DEFAULT_VALUE);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // If only the prefix is left, clear it and set default value
    if (displayValue === RFD_PREFIX) {
      setDisplayValue('');
      onChange?.(DEFAULT_VALUE);
    }
  };

  return (
    <Field
      required={required}
      status={error ? 'error' : undefined}
      extraText={extraText}
      label={label}
      id={id}
    >
      <InputField
        ref={inputRef}
        status={error ? 'error' : undefined}
        disabled={disabled}
        autoFocus={autoFocus}
        dimension="s"
        value={displayValue}
        placeholder={DEFAULT_VALUE}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </Field>
  );
}; 