import { useDialog } from '../../hooks/useDialog';
import { i18n } from '../../i18n';
import { PropsWithChildren, useContext } from 'react';
import styles from './PopupMenu.module.css';
import clsx from 'classnames';

export const PopupMenu = ({
  children,
  isOpen,
  onClose,
}: { isOpen: boolean; onClose: () => void } & PropsWithChildren) => {
  const loc = useContext(i18n);
  const dialogRef = useDialog(isOpen);
  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label={loc._t('Choose an option')}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className={clsx(styles.overlay, isOpen ? null : styles.overlayHidden)} onClick={onClose}>
        <div className={clsx(styles.menuWrapper, isOpen ? styles.menuOpen : null)}>{children}</div>
      </div>
    </dialog>
  );
};
