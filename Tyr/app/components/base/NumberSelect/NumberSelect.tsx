import { i18n } from '../../i18n';
import { ActionButton } from '../ActionButton/ActionButton';
import ArrowDown from '../../../img/icons/arrow-down.svg?react';
import ArrowUp from '../../../img/icons/arrow-up.svg?react';
import styles from './NumberSelect.module.css';
import { CSSProperties, useCallback, useContext, useState } from 'react';
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
    optionPrefix?: string;
  };
}) => {
  const loc = useContext(i18n);
  const selectedOption = options[selectedIndex ?? -1];
  const unavailable = disabled === true || !selectedOption;
  const [menuOpen, setMenuOpen] = useState(false);

  const onLess = useCallback(() => {
    if (selectedIndex === undefined || !options[selectedIndex] || selectedIndex <= 0 || disabled) {
      return;
    }
    onChange?.(selectedIndex > 0 ? selectedIndex - 1 : 0);
  }, [selectedIndex, options, disabled, onChange]);

  const onMore = useCallback(() => {
    if (
      selectedIndex === undefined ||
      !options[selectedIndex] ||
      selectedIndex >= options.length - 1 ||
      disabled
    ) {
      return;
    }
    onChange?.(selectedIndex < options.length - 1 ? selectedIndex + 1 : options.length - 1);
  }, [selectedIndex, options, disabled, onChange]);

  const onOpenMenu = useCallback(() => {
    if (unavailable) {
      return;
    }
    setMenuOpen(true);
  }, [unavailable]);

  return (
    <>
      <div className={clsx(styles.wrapper, disabled ? styles.disabled : null)} style={style}>
        <ActionButton
          className={styles.less}
          aria-label={loc._t('Decrease')}
          disabled={unavailable || selectedIndex === 0}
          onClick={onLess}
          style={{ opacity: selectedIndex === 0 || disabled ? '30%' : '100%' }}
          data-testid={testId?.arrowDown}
        >
          <ArrowDown />
        </ActionButton>
        <ActionButton
          className={styles.numberWrapper}
          disabled={unavailable}
          aria-expanded={menuOpen && !unavailable}
          onClick={onOpenMenu}
          data-testid={testId?.dropdownSelector}
        >
          {selectedOption?.label ?? '--'}
        </ActionButton>
        <ActionButton
          className={styles.more}
          aria-label={loc._t('Increase')}
          disabled={unavailable || selectedIndex === options.length - 1}
          onClick={onMore}
          style={{ opacity: selectedIndex === options.length - 1 || disabled ? '30%' : '100%' }}
          data-testid={testId?.arrowUp}
        >
          <ArrowUp />
        </ActionButton>
      </div>

      <PopupMenu isOpen={menuOpen && !unavailable} onClose={() => setMenuOpen(false)}>
        {options.map((item, idx) => (
          <PopupMenuItem
            key={item.value}
            testId={testId?.optionPrefix ? `${testId.optionPrefix}-${item.value}` : undefined}
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
