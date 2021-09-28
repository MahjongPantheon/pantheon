import * as React from "react";
import './page-login-error.css';
import { environment } from '#config';

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
          <li>E-mail is not registered in Pantheon database (<a href={environment.guiUrl + 'signup'} target={'_blank'}>register</a>)</li>
          <li>Password check has failed</li>
          <li>Unexpected server error</li>
        </ul>
        <div>If in doubt, contact the tournament administrator for further instructions.</div>
      </div>
      <div className="page-login-error__button-container">
        <div className="flat-btn flat-btn--large" onClick={onOkClick}>
          OK
        </div>
      </div>
    </div>
  );
}
