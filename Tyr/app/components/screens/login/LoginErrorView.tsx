import * as React from "react";
import './page-login-error.css';
import { environment } from '#config';
import {useContext} from "react";
import {i18n} from "#/components/i18n";

type IProps = {
  onOkClick: () => void
}

export const LoginErrorView: React.FC<IProps> = ({onOkClick}) => {
  const loc = useContext(i18n);
  const regLink = `<a href=${environment.guiUrl + 'signup'} target='_blank'>${loc._pt('Name of registration link', 'register')}</a>`;

  return (
    <div className="page-login-error">
      <div className="page-login-error__title">
        {loc._t('Pantheon')}
      </div>
      <div className="page-login-error__message">
        <div>
          {loc._t('Login attempt has failed. Possible reasons are:')}
        </div>
        <ul>
          <li dangerouslySetInnerHTML={{__html: loc._t('E-mail is not registered in Pantheon database (%1)', [regLink])}}/>
          <li>{loc._t('Password check has failed')}</li>
          <li>{loc._t('Unexpected server error')}</li>
        </ul>
        <div>{loc._t('If in doubt, contact the tournament administrator for further instructions.')}</div>
      </div>
      <div className="page-login-error__button-container">
        <div className="flat-btn flat-btn--large" onClick={onOkClick}>
          {loc._t('OK')}
        </div>
      </div>
    </div>
  );
}
