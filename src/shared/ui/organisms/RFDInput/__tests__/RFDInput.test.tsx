import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RFDInput } from '../RFDInput';

describe('RFDInput', () => {
  const defaultProps = {
    id: 'test-rfd',
    label: 'RFD Field',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with empty value by default', () => {
    render(<RFDInput {...defaultProps} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('');
  });

  it('shows RFD- prefix when focused', () => {
    render(<RFDInput {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    expect(input).toHaveValue('RFD-');
  });

  it('handles existing RFD value correctly', () => {
    render(<RFDInput {...defaultProps} value="RFD-456" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('RFD-456');
  });

  it('handles "Нет" value correctly', () => {
    render(<RFDInput {...defaultProps} value="Нет" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('');
  });

  it('shows "Нет" placeholder when not focused and empty', () => {
    render(<RFDInput {...defaultProps} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Нет');
  });

  it('shows "RFD-" placeholder when focused', () => {
    render(<RFDInput {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    expect(input).toHaveAttribute('placeholder', 'RFD-');
  });

  it('returns to "Нет" placeholder when blurred with only prefix', () => {
    render(<RFDInput {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    // Focus to show prefix
    fireEvent.focus(input);
    expect(input).toHaveValue('RFD-');
    
    // Blur to clear and show "Нет" placeholder
    fireEvent.blur(input);
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('placeholder', 'Нет');
  });
}); 