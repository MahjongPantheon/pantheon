import { useContext } from 'react';
import { i18n } from '../../i18n';
import { env } from '../../../helpers/env';
import styles from './LoginError.module.css';
import { Button } from '../../base/Button/Button';

type IProps = {
  onOkClick: () => void;
  recoveryLink: string;
};

export const LoginError = ({ onOkClick, recoveryLink }: IProps) => {
  const loc = useContext(i18n);
  const regLink = `<a href='${env.urls.forseti}/profile/signup' target='_blank' data-testid='tyr-login-error-signup'>${loc._pt(
    'Name of registration link',
    'register'
  )}</a>`;

  return (
    <div className={styles.wrapper} data-testid='tyr-login-error'>
      <div className={styles.title}>{loc._t('Pantheon')}</div>
      <div className={styles.message}>
        <div>{loc._t('Login attempt has failed. Possible reasons are:')}</div>
        <ul>
          <li
            dangerouslySetInnerHTML={{
              __html: loc._t('E-mail is not registered in Pantheon database (%1)', [regLink]),
            }}
          />
          <li>
            {loc._t('Password check has failed')} -{' '}
            <a href={recoveryLink} target='_blank' data-testid='tyr-login-error-recovery'>
              {loc._t('Forgot password?')}
            </a>
          </li>
          <li>{loc._t('Unexpected server error')}</li>
        </ul>
        <div>
          {loc._t('If in doubt, contact the tournament administrator for further instructions.')}
        </div>
      </div>
      <div className={styles.buttons}>
        <Button variant='primary' size='lg' onClick={onOkClick} testId='tyr-login-error-ok'>
          {loc._t('OK')}
        </Button>
      </div>
    </div>
  );
};
