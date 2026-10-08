import { useContext, useState } from 'react';
import { i18n } from '../../i18n';
import styles from './Login.module.css';
import { TextField } from '../../base/TextField/TextField';
import { Button } from '../../base/Button/Button';
import { Logo } from '../../base/Logo/Logo';

type IProps = {
  onSubmit: (email: string, password: string) => void;
  onSignupClick: () => void;
  onRecoveryClick: () => void;
};

export const Login = ({ onSubmit, onSignupClick, onRecoveryClick }: IProps) => {
  const loc = useContext(i18n);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <form
      className={styles.loginForm}
      data-testid='tyr-login'
      onSubmit={(e) => {
        onSubmit(email, password);
        e.preventDefault();
        return false;
      }}
    >
      <div className={styles.loginFormTitle}>
        <Logo style={{ width: '100px', height: '100px' }} />
      </div>
      <div className={styles.loginFormFields}>
        <TextField
          testId='tyr-login-email'
          variant='underline'
          placeholder={loc._t('Email')}
          type='text'
          size='lg'
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
        <TextField
          testId='tyr-login-password'
          variant='underline'
          placeholder={loc._t('Password')}
          type='password'
          size='lg'
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
      </div>
      <div className={styles.loginFormButtons}>
        <Button variant='primary' size='fullwidth' testId='tyr-login-submit' type='submit'>
          {loc._t('Log in')}
        </Button>
      </div>
      <div className={styles.loginFormButtons}>
        <Button variant='contained' size='md' onClick={onSignupClick} testId='tyr-login-signup'>
          {loc._t('Sign up')}
        </Button>
        <Button variant='contained' size='md' onClick={onRecoveryClick} testId='tyr-login-recovery'>
          {loc._t('Forgot password?')}
        </Button>
      </div>
    </form>
  );
};
