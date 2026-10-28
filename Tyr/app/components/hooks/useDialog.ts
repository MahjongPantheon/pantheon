import { useEffect, useRef } from 'react';

export function useDialog(open: boolean, modal = true) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const previous = document.activeElement;
    if (!dialog.open) {
      if (modal) dialog.showModal();
      else dialog.show();
    }
    return () => {
      if (dialog.open) dialog.close();
      // React can remove the dialog before passive cleanup runs.
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [open, modal]);
  return ref;
}
