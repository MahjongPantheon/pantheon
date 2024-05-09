import styles from './TextField.module.css';
import clsx from 'classnames';
import { ChangeEvent, useCallback, useState } from 'react';

export const TextField = ({
  initialValue,
  placeholder,
  type,
  variant,
  size,
  onChange,
}: {
  initialValue?: string;
  placeholder?: string;
  type?: 'text' | 'password';
  variant?: 'underline' | 'contained';
  size?: 'sm' | 'md' | 'lg' | 'fullwidth';
  onChange?:
    | ((e: ChangeEvent<HTMLInputElement>) => boolean)
    | ((e: ChangeEvent<HTMLInputElement>) => void);
}) => {
  const [currentValue, setCurrentValue] = useState(initialValue ?? '');

  variant ??= 'contained';
  size ??= 'md';
  placeholder ??= '';

  const classes = [
    variant === 'underline' ? styles.textFieldUnderline : null,
    variant === 'contained' ? styles.textFieldContained : null,

    size === 'sm' ? styles.textFieldSmall : null,
    size === 'md' ? styles.textFieldMedium : null,
    size === 'lg' ? styles.textFieldLarge : null,
    size === 'fullwidth' ? styles.textFieldFullWidth : null,
  ];

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setCurrentValue(e.currentTarget.value);
      return onChange?.(e);
    },
    [setCurrentValue, onChange]
  );

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={currentValue}
      className={clsx(styles.textFieldBase, ...classes)}
      onChange={handleChange}
    />
  );
};
