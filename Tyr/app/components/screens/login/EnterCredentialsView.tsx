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
import './page-enter-credentials.css';
import { useContext, useState } from 'react';
import { i18n } from '../../i18n';

type IProps = {
  onSubmit: (email: string, password: string) => void;
  signupLink: string;
  recoveryLink: string;
};

export const EnterCredentialsView: React.FC<IProps> = ({ onSubmit, signupLink, recoveryLink }) => {
  const loc = useContext(i18n);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <form
      className='page-enter-credentials'
      onSubmit={(e) => {
        onSubmit(email, password);
        e.preventDefault();
        return false;
      }}
    >
      <div className='page-enter-credentials__title'>{loc._t('Pantheon: log in')}</div>
      <div className='page-enter-credentials__form'>
        <input
          className='page-enter-credentials__input'
          type='text'
          placeholder={loc._t('Email')}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
        <input
          className='page-enter-credentials__input'
          type='password'
          placeholder={loc._t('Password')}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
      </div>
      <div className='page-enter-credentials__button-container'>
        <button
          className='flat-btn flat-btn--large'
          data-testid='button_login'
          style={{ justifySelf: 'end', width: '100%' }}
          type='submit'
        >
          {loc._t('Log in')}
        </button>
      </div>
      <div className='page-enter-credentials__links-container'>
        <a
          className='flat-btn flat-btn--large'
          href={signupLink}
          target='_blank'
          data-testid='button_signup'
          style={{ width: '100%' }}
        >
          {loc._t('Sign up')}
        </a>
        <a
          className='flat-btn flat-btn--large'
          href={recoveryLink}
          target='_blank'
          data-testid='button_forgot'
          style={{ width: '100%' }}
        >
          {loc._t('Forgot password?')}
        </a>
      </div>
    </form>
  );
};
