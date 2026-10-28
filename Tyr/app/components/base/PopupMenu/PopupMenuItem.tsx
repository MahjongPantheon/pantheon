import { ActionButton } from '../ActionButton/ActionButton';
import styles from './PopupMenuItem.module.css';
import { ReactElement } from 'react';
import clsx from 'classnames';

export const PopupMenuItem = ({
  variant,
  label,
  icon,
  rightIcon,
  onClick,
  testId,
}: {
  variant?: 'normal' | 'primary';
  label: string | ReactElement;
  icon?: ReactElement;
  rightIcon?: ReactElement;
  onClick?: () => void;
  testId?: string;
}) => {
  variant ??= 'normal';
  return (
    <ActionButton
      data-testid={testId}
      className={clsx(styles.menuItem, variant === 'primary' && styles.menuItemPrimary)}
      onClick={onClick}
    >
      {icon && <div className={styles.menuItemIcon}>{icon}</div>}
      {label}
      {rightIcon && <div className={styles.menuItemRightIcon}>{rightIcon}</div>}
    </ActionButton>
  );
};
