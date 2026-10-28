import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'classnames';
import styles from './ActionButton.module.css';

// Native control semantics with a low-specificity reset for existing styles.
export const ActionButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function ActionButton({ className, type = 'button', ...props }, ref) {
    return <button {...props} ref={ref} type={type} className={clsx(styles.button, className)} />;
  }
);
