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
  testId,
}: {
  options: Array<{ label: string; value: number }>;
  selectedIndex?: number;
  onChange?: (index: number) => void;
  style?: CSSProperties;
  disabled?: boolean;
  testId?: {
    arrowUp?: string;
    arrowDown?: string;
    dropdownSelector?: string;
  };
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const onLess = useCallback(() => {
    if (selectedIndex === undefined || selectedIndex === 0 || disabled) {
      return;
    }
    onChange?.(selectedIndex > 0 ? selectedIndex - 1 : 0);
  }, [selectedIndex, disabled]);

  const onMore = useCallback(() => {
    if (selectedIndex === undefined || selectedIndex === options.length - 1 || disabled) {
      return;
    }
    onChange?.(selectedIndex < options.length - 1 ? selectedIndex + 1 : options.length - 1);
  }, [selectedIndex, options, disabled]);

  const onOpenMenu = useCallback(() => {
    if (selectedIndex === undefined) {
      return;
    }
    setMenuOpen(true);
  }, [selectedIndex]);

  return (
    <>
      <div className={clsx(styles.wrapper, disabled ? styles.disabled : null)} style={style}>
        <div
          className={styles.less}
          onClick={onLess}
          style={{ opacity: selectedIndex === 0 || disabled ? '30%' : '100%' }}
          data-testid={testId?.arrowDown}
        >
          <ArrowDown />
        </div>
        <div
          className={styles.numberWrapper}
          onClick={onOpenMenu}
          data-testid={testId?.dropdownSelector}
        >
          {selectedIndex === undefined ? '--' : options[selectedIndex].label}
        </div>
        <div
          className={styles.more}
          onClick={onMore}
          style={{ opacity: selectedIndex === options.length - 1 || disabled ? '30%' : '100%' }}
          data-testid={testId?.arrowUp}
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
