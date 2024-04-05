import { PropsWithChildren } from 'react';
import './modal-dialog.css';

interface DialogProps {
  onClose?: () => void;
  actionPrimary?: () => void;
  actionPrimaryLabel?: string;
  actionSecondary?: () => void;
  actionSecondaryLabel?: string;
}

export const ModalDialog = ({
  children,
  onClose,
  actionPrimary,
  actionPrimaryLabel,
  actionSecondary,
  actionSecondaryLabel,
}: PropsWithChildren & DialogProps) => {
  return (
    <div className='modalDialog__overlay' onClick={onClose}>
      <div className='modalDialog__wrapper'>
        <div className='modalDialog__content'>{children}</div>
        <div className='modalDialog__actions'>
          <div>
            {actionSecondary && (
              <button className='flat-btn flat-btn__responsive--medium' onClick={actionSecondary}>
                {actionSecondaryLabel}
              </button>
            )}
          </div>
          <div>
            {actionPrimary && (
              <button className='flat-btn flat-btn__responsive--medium' onClick={actionPrimary}>
                {actionPrimaryLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
