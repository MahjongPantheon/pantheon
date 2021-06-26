import * as React from "react";
import './page-login-error.css'

type IProps = {
  onOkClick: () => void
}

export const LoginErrorView: React.FC<IProps> = ({onOkClick}) => {
  return (
    <div className="page-login-error">
      <div className="page-login-error__title">
        Pantheon
      </div>
      <div className="page-login-error__message">
        <div>
          Login attempt has failed. Possible reasons are:
        </div>
        <ul>
          <li>Tournament games already started and you wasn't registered</li>
          <li>Pin code was already used on another device</li>
          <li>Unexpected server error</li>
        </ul>
        <div>Contact to the tournament administrator for further instructions.</div>
      </div>
      <div className="page-login-error__button-container">
        <div className="flat-btn flat-btn--large" onClick={onOkClick}>
          OK
        </div>
      </div>
    </div>
  );
}
