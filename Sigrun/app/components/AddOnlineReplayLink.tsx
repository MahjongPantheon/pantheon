import { useContext } from 'react';
import { useI18n } from '../hooks/i18n';
import { IconNetwork } from '@tabler/icons-react';
import { NavLink } from '@mantine/core';
import * as React from 'react';
import { modalsCtx } from '../hooks/modals';

export const AddOnlineReplayLink = ({
  onClick,
  showLabel,
}: {
  onClick?: () => void;
  showLabel?: boolean;
}) => {
  const modals = useContext(modalsCtx);
  const i18n = useI18n();

  return (
    <NavLink
      style={{ borderLeft: '10px solid #7e95c4', marginBottom: '2px', textDecoration: 'none' }}
      styles={{ label: { fontSize: '18px' } }}
      icon={<IconNetwork size={24} />}
      label={showLabel ? i18n._pt('Event menu', 'Add online game') : ''}
      onClick={(e) => {
        modals.showOnlineModal();
        onClick?.();
        e.preventDefault();
      }}
    />
  );
};
