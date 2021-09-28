import * as React from "react";
import './page-enter-credentials.css'
import { useState } from 'react';

type IProps = {
  onSubmit: (email: string, password: string) => void
}

export const EnterCredentialsView: React.FC<IProps> = ({onSubmit}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="page-enter-credentials">
      <div className="page-enter-credentials__title">
        Pantheon: log in
      </div>
      <div className="page-enter-credentials__form">
        <input className={'page-enter-credentials__input'} type={'text'}
               onChange={(e) => setEmail(e.currentTarget.value)} />
        <label>Email</label>
        <br/><br/>
        <input className={'page-enter-credentials__input'} type={'password'}
               onChange={(e) => setPassword(e.currentTarget.value)} />
        <label>Password</label>
      </div>
      <div className="page-enter-credentials__button-container">
        <button className="flat-btn flat-btn--large" onClick={() => onSubmit(email, password)}>
          OK
        </button>
      </div>
    </div>
  );
}
