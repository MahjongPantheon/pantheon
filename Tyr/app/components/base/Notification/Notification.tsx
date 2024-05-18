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

import classNames from 'classnames';
import styles from './Notification.module.css';
import { PropsWithChildren } from 'react';

export const Notification = ({ isShown, children }: PropsWithChildren & { isShown: boolean }) => {
  return (
    <div className={classNames(styles.wrapper, isShown ? styles.active : null)}>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
