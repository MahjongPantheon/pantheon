import ArrowDown from '../../../img/icons/arrow-down.svg?react';
import ArrowUp from '../../../img/icons/arrow-up.svg?react';
import styles from './NumberSelect.module.css';
import { CSSProperties, useCallback, useState } from 'react';
import { PopupMenu } from '../PopupMenu/PopupMenu';
import { PopupMenuItem } from '../PopupMenu/PopupMenuItem';
import clsx from 'classnames';

export const NumberSelect = ({
  options,
  selectedIndex,
  onChange,
  style,
  disabled,
}: {
  options: Array<{ label: string; value: number }>;
  selectedIndex?: number;
  onChange?: (index: number) => void;
  style?: CSSProperties;
  disabled?: boolean;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const onLess = useCallback(() => {
    if (selectedIndex === undefined) {
      return;
    }
    onChange?.(selectedIndex > 0 ? selectedIndex - 1 : 0);
  }, [selectedIndex]);

  const onMore = useCallback(() => {
    if (selectedIndex === undefined) {
      return;
    }
    onChange?.(selectedIndex < options.length - 1 ? selectedIndex + 1 : options.length - 1);
  }, [selectedIndex]);

  return (
    <>
      <div className={clsx(styles.wrapper, disabled ? styles.disabled : null)} style={style}>
        <div
          className={styles.less}
          onClick={onLess}
          style={{ opacity: selectedIndex === 0 || disabled ? '30%' : '100%' }}
        >
          <ArrowDown />
        </div>
        <div className={styles.numberWrapper} onClick={() => (disabled ? null : setMenuOpen(true))}>
          {selectedIndex === undefined ? '--' : options[selectedIndex].label}
        </div>
        <div
          className={styles.more}
          onClick={onMore}
          style={{ opacity: selectedIndex === options.length - 1 || disabled ? '30%' : '100%' }}
        >
          <ArrowUp />
        </div>
      </div>

      <PopupMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
        {options.map((item, idx) => (
          <PopupMenuItem
            key={`pmi_${idx}`}
            label={item.label}
            onClick={() => {
              onChange?.(idx);
              setMenuOpen(false);
            }}
          />
        ))}
      </PopupMenu>
    </>
  );
};
