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

import * as React from 'react';
import './page-login-error.css';
import { useContext } from 'react';
import { i18n } from '#/components/i18n';

type IProps = {
  onOkClick: () => void;
  recoveryLink: string;
};

export const LoginErrorView: React.FC<IProps> = ({ onOkClick, recoveryLink }) => {
  const loc = useContext(i18n);
  const regLink = `<a href='${window.__cfg.FORSETI_URL}/profile/signup' target='_blank'>${loc._pt(
    'Name of registration link',
    'register'
  )}</a>`;

  return (
    <div className='page-login-error'>
      <div className='page-login-error__title'>{loc._t('Pantheon')}</div>
      <div className='page-login-error__message'>
        <div>{loc._t('Login attempt has failed. Possible reasons are:')}</div>
        <ul>
          <li
            dangerouslySetInnerHTML={{
              __html: loc._t('E-mail is not registered in Pantheon database (%1)', [regLink]),
            }}
          />
          <li>
            {loc._t('Password check has failed')} -{' '}
            <a href={recoveryLink} target='_blank'>
              {loc._t('Forgot password?')}
            </a>
          </li>
          <li>{loc._t('Unexpected server error')}</li>
        </ul>
        <div>
          {loc._t('If in doubt, contact the tournament administrator for further instructions.')}
        </div>
      </div>
      <div className='page-login-error__button-container'>
        <div className='flat-btn flat-btn--large' onClick={onOkClick}>
          {loc._t('OK')}
        </div>
      </div>
    </div>
  );
};
