import { useDialog } from '../../hooks/useDialog';
import { i18n } from '../../i18n';
import { PropsWithChildren, useContext, useLayoutEffect } from 'react';
import styles from './PopupMenu.module.css';

export const PopupMenu = ({
  children,
  isOpen,
  onClose,
  withinParent = false,
}: { isOpen: boolean; onClose: () => void; withinParent?: boolean } & PropsWithChildren) => {
  const loc = useContext(i18n);
  const dialogRef = useDialog(isOpen, !withinParent);
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const parent = dialog?.parentElement;
    if (!withinParent) dialog?.removeAttribute('style');
    if (!withinParent || !isOpen || !dialog || !parent) return;
    // Fixed dialogs use viewport coordinates. Match the table area so the
    // bottom bar stays clear and interactive.
    const updateBounds = () => {
      const { top, left, width, height } = parent.getBoundingClientRect();
      Object.assign(dialog.style, {
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
      });
    };
    updateBounds();
    const observer = new ResizeObserver(updateBounds);
    observer.observe(parent);
    window.addEventListener('resize', updateBounds);
    window.addEventListener('scroll', updateBounds, true);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateBounds);
      window.removeEventListener('scroll', updateBounds, true);
    };
  }, [withinParent, isOpen, dialogRef]);
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
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.menuWrapper}>{children}</div>
      </div>
    </dialog>
  );
};
