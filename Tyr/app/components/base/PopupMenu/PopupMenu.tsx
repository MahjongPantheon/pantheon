import { PropsWithChildren } from 'react';
import styles from './PopupMenu.module.css';
import clsx from 'classnames';

export const PopupMenu = ({
  children,
  isOpen,
  onClose,
}: { isOpen: boolean; onClose: () => void } & PropsWithChildren) => {
  return (
    <div className={clsx(styles.overlay, isOpen ? null : styles.overlayHidden)} onClick={onClose}>
      <div className={clsx(styles.menuWrapper, isOpen ? styles.menuOpen : null)}>{children}</div>
    </div>
  );
};
