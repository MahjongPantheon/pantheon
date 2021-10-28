import * as React from "react";
import './page-enter-credentials.css'
import {CSSProperties, useContext, useState} from 'react';
import {i18n} from "#/components/i18n";

type IProps = {
  onSubmit: (email: string, password: string) => void;
  signupLink: string;
}

export const EnterCredentialsView: React.FC<IProps> = ({onSubmit, signupLink}) => {
  const loc = useContext(i18n);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="page-enter-credentials">
      <div className="page-enter-credentials__title">
        {loc._t('Pantheon: log in')}
      </div>
      <div className="page-enter-credentials__form">
        <input className={'page-enter-credentials__input'} type={'text'}
               onChange={(e) => setEmail(e.currentTarget.value)} />
        <label>{loc._t('Email')}</label>
        <br/><br/>
        <input className={'page-enter-credentials__input'} type={'password'}
               onChange={(e) => setPassword(e.currentTarget.value)} />
        <label>{loc._t('Password')}</label>
      </div>
      <div className="page-enter-credentials__button-container">
        <a className="flat-btn flat-btn--large" href={signupLink} style={{ width: '100%' }}>
          {loc._t('Sign up')}
        </a>
        <button className="flat-btn flat-btn--large"
                style={{'justifySelf': 'end', width: '100%'}}
                onClick={() => onSubmit(email, password)}>
          {loc._t('Log in')}
        </button>
      </div>
    </div>
  );
}
