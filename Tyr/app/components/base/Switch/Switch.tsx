import { ActionButton } from '../ActionButton/ActionButton';
/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import styles from './Switch.module.css';
import { useCallback, useId } from 'react';
import clsx from 'classnames';

type SwitchProps = {
  onChange: (value: boolean) => void;
  value: boolean;
  label: string;
  description: string;
  testId?: string;
};

export const Switch = (props: SwitchProps) => {
  const { onChange, value, label, description, testId } = props;

  const descriptionId = useId();
  const onClick = useCallback(() => {
    onChange(!value);
  }, [value, onChange]);

  return (
    <div className={styles.wrapper}>
      <ActionButton
        role='switch'
        aria-checked={value}
        aria-label={label}
        aria-describedby={descriptionId}
        className={styles.switch}
        onClick={onClick}
        data-testid={testId}
      >
        <div className={clsx(styles.switchBox, value ? styles.switchBoxOn : null)} />
        <div className={clsx(styles.switchButton, value ? styles.switchButtonOn : null)} />
      </ActionButton>
      <div className={styles.info}>
        <div className={styles.label}>{label}</div>
        <div id={descriptionId} className={styles.description}>
          {description}
        </div>
      </div>
    </div>
  );
};
