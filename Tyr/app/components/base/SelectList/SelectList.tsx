import styles from './SelectList.module.css';
import { ReactElement } from 'react';
import clsx from 'classnames';

type IProps = {
  items: Array<{
    id: number;
    label: string | ReactElement;
  }>;
  currentSelection: number;
  onSelect: (selection: number) => void;
  testIdPrefix?: string;
};

export const SelectList = ({ items, currentSelection, onSelect, testIdPrefix }: IProps) => {
  return (
    <div className={styles.wrapper}>
      {items.map((item, idx) => (
        <div
          key={`listItem_${idx}`}
          data-testid={testIdPrefix ? `${testIdPrefix}-${item.id}` : undefined}
          className={clsx(styles.listItem, currentSelection === item.id ? styles.selected : null)}
          onClick={() => onSelect(item.id)}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};
