import {
  NumberInput as MantineNumberInput,
  NumberInputProps as MantineNumberInputProps,
} from '@mantine/core';
import { forwardRef, useState } from 'react';

type NumericValue = number | '';
type NumberInputProps = Omit<MantineNumberInputProps, 'value' | 'defaultValue' | 'onChange'> & {
  value?: NumericValue;
  defaultValue?: NumericValue;
  onChange?: (value: NumericValue) => void;
};

function numericValue(value: number | string): NumericValue {
  if (value === '' || value === '-') {
    return '';
  }
  const number = Number(value);
  return Number.isFinite(number) ? Number(number.toFixed(0)) : '';
}

// Keep v6's numeric form values and integer precision while allowing an unfinished
// minus sign in the displayed input. Modern Mantine exposes these drafts as strings.
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, defaultValue, onChange, onBlur, ...props }, ref) => {
    const [draft, setDraft] = useState<number | string>(value ?? defaultValue ?? '');
    const [previousValue, setPreviousValue] = useState(value);

    if (value !== undefined && value !== previousValue) {
      setPreviousValue(value);
      if (value !== numericValue(draft)) {
        setDraft(value);
      }
    }

    return (
      <MantineNumberInput
        ref={ref}
        startValue={props.min ?? 0}
        {...props}
        value={draft}
        onChange={(next) => {
          const number = numericValue(next);
          setDraft(next);
          setPreviousValue(number);
          onChange?.(number);
        }}
        onBlur={(event) => {
          const number = numericValue(draft);
          const next =
            number === '' || props.clampBehavior === 'none'
              ? number
              : Math.min(props.max ?? Infinity, Math.max(props.min ?? -Infinity, number));
          setDraft(next);
          setPreviousValue(next);
          if (next !== number) {
            onChange?.(next);
          }
          onBlur?.(event);
        }}
      />
    );
  }
);
