import { createRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Country } from 'react-phone-number-input';
import { PhoneInput } from './phone-input';

function Harness({ initialValue = '', defaultCountry = 'CZ' }: { initialValue?: string; defaultCountry?: Country }) {
  const [value, setValue] = useState(initialValue);
  return (
    <>
      <PhoneInput aria-label="Phone number" value={value} onChange={setValue} defaultCountry={defaultCountry} />
      <output data-testid="phone-value">{value}</output>
    </>
  );
}

function input() {
  return screen.getByRole('textbox', { name: 'Phone number' }) as HTMLInputElement;
}

function chooseCountry(name: string) {
  fireEvent.click(screen.getByRole('button', { name: /^Phone number country:/ }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Search country' }), { target: { value: name } });
  fireEvent.click(screen.getByRole('button', { name: new RegExp(name) }));
}

describe('PhoneInput without a typing mask', () => {
  it('keeps every keystroke untouched and formats a valid number only on blur', () => {
    render(<Harness />);
    const field = input();
    fireEvent.focus(field);

    for (let length = 1; length <= 9; length++) {
      const text = '777123456'.slice(0, length);
      fireEvent.change(field, { target: { value: text } });
      expect(field).toHaveValue(text);
    }

    expect(screen.getByTestId('phone-value')).toHaveTextContent('+420777123456');
    fireEvent.blur(field);
    expect(field).toHaveValue('+420 777 123 456');
    fireEvent.focus(field);
    expect(field).toHaveValue('+420 777 123 456');
  });

  it('does not reposition the caret when a digit in the middle is edited', () => {
    render(<Harness />);
    const field = input();
    fireEvent.change(field, { target: { value: '777123456' } });
    fireEvent.change(field, { target: { value: '777923456', selectionStart: 4, selectionEnd: 4 } });

    expect(field).toHaveValue('777923456');
    expect(field.selectionStart).toBe(4);
    expect(field.selectionEnd).toBe(4);
    expect(screen.getByTestId('phone-value')).toHaveTextContent('+420777923456');
  });

  it('allows deleting a separator without the mask inserting it back', () => {
    render(<Harness initialValue="+420777123456" />);
    const field = input();
    fireEvent.change(field, { target: { value: '+420 777123 456', selectionStart: 8, selectionEnd: 8 } });

    expect(field).toHaveValue('+420 777123 456');
    expect(field.selectionStart).toBe(8);
    expect(screen.getByTestId('phone-value')).toHaveTextContent('+420777123456');
  });

  it.each([
    { text: '+1 (202) 555-0123', value: '+12025550123', country: 'United States', formatted: '+1 202 555 0123' },
    { text: '+380501234567', value: '+380501234567', country: 'Ukraine', formatted: '+380 50 123 4567' },
    { text: '+79991234567', value: '+79991234567', country: 'Russia', formatted: '+7 999 123 45 67' },
    { text: '00442079460018', value: '+442079460018', country: 'United Kingdom', formatted: '+44 20 7946 0018' },
  ])('normalizes pasted $country numbers without rewriting their display during input', ({ text, value, country, formatted }) => {
    render(<Harness />);
    fireEvent.change(input(), { target: { value: text } });

    expect(input()).toHaveValue(text);
    expect(screen.getByTestId('phone-value')).toHaveTextContent(value);
    expect(screen.getByRole('button', { name: `Phone number country: ${country}` })).toBeInTheDocument();

    fireEvent.blur(input());
    expect(input()).toHaveValue(formatted);
  });

  it('parses national numbers using the selected country, including trunk prefixes', () => {
    render(<Harness />);
    chooseCountry('United Kingdom');
    expect(input()).toHaveFocus();
    fireEvent.change(input(), { target: { value: '02079460018' } });

    expect(input()).toHaveValue('02079460018');
    expect(screen.getByTestId('phone-value')).toHaveTextContent('+442079460018');
    fireEvent.blur(input());
    expect(input()).toHaveValue('+44 20 7946 0018');
  });

  it('reinterprets existing digits when the country is changed instead of keeping the old dial code', () => {
    render(<Harness initialValue="+420777123456" />);
    chooseCountry('Slovakia');

    expect(input()).toHaveValue('777123456');
    expect(screen.getByTestId('phone-value')).toHaveTextContent('+421777123456');
  });

  it.each(['+4207', '004207'])('keeps partial national digits when changing country for %s', (text) => {
    render(<Harness />);
    fireEvent.change(input(), { target: { value: text } });
    chooseCountry('Slovakia');

    expect(input()).toHaveValue('7');
    fireEvent.change(input(), { target: { value: '777123456' } });
    expect(screen.getByTestId('phone-value')).toHaveTextContent('+421777123456');
  });

  it('keeps incomplete input editable even when the normalized value stays empty', () => {
    render(<Harness />);
    fireEvent.change(input(), { target: { value: '+' } });
    expect(input()).toHaveValue('+');
    expect(screen.getByTestId('phone-value')).toBeEmptyDOMElement();

    fireEvent.change(input(), { target: { value: '+4' } });
    fireEvent.blur(input());
    expect(input()).toHaveValue('+4');
  });

  it.each(['not a phone', '+420777123456 ext. 1'])('does not retain the previous valid number for unsupported input: %s', (text) => {
    render(<Harness initialValue="+420777123456" />);
    fireEvent.change(input(), { target: { value: text } });
    fireEvent.blur(input());

    expect(input()).toHaveValue(text);
    expect(screen.getByTestId('phone-value')).toBeEmptyDOMElement();
  });

  it('allows clearing the entire number without reinserting a dial code', () => {
    render(<Harness initialValue="+420777123456" />);
    fireEvent.change(input(), { target: { value: '' } });
    fireEvent.blur(input());

    expect(input()).toHaveValue('');
    expect(screen.getByTestId('phone-value')).toBeEmptyDOMElement();
  });

  it('accepts external restored values and resets without treating local draft edits as external updates', () => {
    const onChange = vi.fn();
    const { rerender } = render(<PhoneInput aria-label="Phone number" value="+420777123456" onChange={onChange} />);
    expect(input()).toHaveValue('+420 777 123 456');

    rerender(<PhoneInput aria-label="Phone number" value="+12025550123" onChange={onChange} />);
    expect(input()).toHaveValue('+1 202 555 0123');
    expect(screen.getByRole('button', { name: 'Phone number country: United States' })).toBeInTheDocument();

    rerender(<PhoneInput aria-label="Phone number" value="" onChange={onChange} />);
    expect(input()).toHaveValue('');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('forwards native input semantics, ref and blur handler', () => {
    const ref = createRef<HTMLInputElement>();
    const onBlur = vi.fn();
    render(<PhoneInput aria-label="Phone number" ref={ref} onBlur={onBlur} aria-invalid aria-describedby="phone-error" />);

    expect(ref.current).toBe(input());
    expect(input()).toHaveAttribute('type', 'tel');
    expect(input()).toHaveAttribute('inputmode', 'tel');
    expect(input()).toHaveAttribute('autocomplete', 'tel');
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input()).toHaveAttribute('aria-describedby', 'phone-error');
    fireEvent.blur(input());
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it.each(['disabled', 'readOnly'] as const)('prevents editing the number or country when %s', (prop) => {
    render(<PhoneInput aria-label="Phone number" {...{ [prop]: true }} />);
    expect(input()).toHaveAttribute(prop === 'readOnly' ? 'readonly' : 'disabled');
    expect(screen.getByRole('button', { name: /^Phone number country:/ })).toBeDisabled();
  });
});
