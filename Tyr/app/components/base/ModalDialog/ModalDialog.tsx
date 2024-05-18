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

import { PropsWithChildren } from 'react';
import styles from './ModalDialog.module.css';
import { Button } from '../Button/Button';

interface DialogProps {
  onClose?: () => void;
  actionPrimary?: () => void;
  actionPrimaryLabel?: string;
  actionSecondary?: () => void;
  actionSecondaryLabel?: string;
}

export const ModalDialog = ({
  children,
  onClose,
  actionPrimary,
  actionPrimaryLabel,
  actionSecondary,
  actionSecondaryLabel,
}: PropsWithChildren & DialogProps) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.wrapper}>
        <div className={styles.content}>{children}</div>
        <div className={styles.actions}>
          <div>
            {actionSecondary && (
              <Button size='md' variant='contained' onClick={actionSecondary}>
                {actionSecondaryLabel}
              </Button>
            )}
          </div>
          <div>
            {actionPrimary && (
              <Button size='md' variant='primary' onClick={actionPrimary}>
                {actionPrimaryLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
