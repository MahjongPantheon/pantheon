import * as React from 'react';
import './page-enter-credentials.css';
import { useContext, useState } from 'react';
import { i18n } from '#/components/i18n';

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
    <form className='page-enter-credentials' onSubmit={(e) => {
      onSubmit(email, password);
      e.preventDefault();
      return false;
    }}>
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
          style={{ width: '100%' }}
        >
          {loc._t('Sign up')}
        </a>
        <a
          className='flat-btn flat-btn--large'
          href={recoveryLink}
          target='_blank'
          style={{ width: '100%' }}
        >
          {loc._t('Forgot password?')}
        </a>
      </div>
    </form>
  );
};
