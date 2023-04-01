import * as React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@mantine/core';
import { useContext } from 'react';
import { actionButtonCtx } from '#/hooks/actionButton';

export type TopActionButtonProps = {
  title: string;
  loading: boolean;
  disabled: boolean;
  icon: React.ReactNode;
  onClick: () => void;
};

// Button rendered at the top of the page, used to submit forms
export const TopActionButton: React.FC<TopActionButtonProps> = ({
  title,
  loading,
  disabled,
  icon,
  onClick,
}) => {
  const actionButtonRef = useContext(actionButtonCtx);
  return (
    <>
      {actionButtonRef.current &&
        createPortal(
          <Button
            size='xs'
            loading={loading}
            style={{ width: '150px' }}
            disabled={disabled}
            leftIcon={icon}
            onClick={onClick}
          >
            {title}
          </Button>,
          actionButtonRef.current
        )}
    </>
  );
};
