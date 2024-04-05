import classNames from 'classnames';
import './notification.css';
import { PropsWithChildren } from 'react';

export const Notification = ({ isShown, children }: PropsWithChildren & { isShown: boolean }) => {
  return (
    <div className={classNames('notificaton__wrapper', isShown ? 'notification__active' : null)}>
      <div className='notification__content'>{children}</div>
    </div>
  );
};
