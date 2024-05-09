import styles from './PopupMenuItem.module.css';
import { ReactElement } from 'react';
import clsx from 'classnames';

export const PopupMenuItem = ({
  variant,
  label,
  icon,
  rightIcon,
  onClick,
}: {
  variant?: 'normal' | 'primary';
  label: string | ReactElement;
  icon?: ReactElement;
  rightIcon?: ReactElement;
  onClick?: () => void;
}) => {
  variant ??= 'normal';
  return (
    <div
      className={clsx(styles.menuItem, variant === 'primary' && styles.menuItemPrimary)}
      onClick={onClick}
    >
      {icon && <div className={styles.menuItemIcon}>{icon}</div>}
      {label}
      {rightIcon && <div className={styles.menuItemRightIcon}>{rightIcon}</div>}
    </div>
  );
};
