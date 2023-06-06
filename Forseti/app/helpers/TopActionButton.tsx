/*  Forseti: personal area & event control panel
 *  Copyright (C) 2023  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Button, MantineColor } from '@mantine/core';
import { useContext } from 'react';
import { actionButtonCtx } from '../hooks/actionButton';

export type TopActionButtonProps = {
  title: string;
  loading: boolean;
  disabled: boolean;
  icon: React.ReactNode;
  onClick: () => void;
  color?: MantineColor;
};

// Button rendered at the top of the page, used to submit forms
export const TopActionButton: React.FC<TopActionButtonProps> = ({
  title,
  loading,
  disabled,
  icon,
  onClick,
  color,
}) => {
  const actionButtonRef = useContext(actionButtonCtx);
  return (
    <>
      {actionButtonRef.current &&
        createPortal(
          <Button
            color={color ?? 'blue'}
            size='xs'
            loading={loading}
            style={{ width: '230px' }}
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
