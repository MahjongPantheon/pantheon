import { PropsWithChildren } from 'react';
import styles from './BottomPanel.module.css';

export const BottomPanel = ({ children }: PropsWithChildren) => {
  return (
    <div className={styles.bottomPanel}>
      <div className={styles.panelMain}>{children}</div>
    </div>
  );
};
