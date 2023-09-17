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

import { Menu, Group, ActionIcon, Container, Footer, useMantineTheme } from '@mantine/core';
import {
  IconLanguageHiragana,
  IconMoon,
  IconMoonStars,
  IconSun,
  IconSunLow,
} from '@tabler/icons-react';
import { FlagEn, FlagRu } from './helpers/flags';
import { useI18n } from './hooks/i18n';
import * as React from 'react';
import { actionButtonRef } from './hooks/actionButton';

interface AppFooterProps {
  dark: boolean;
  toggleColorScheme: () => void;
  toggleDimmed: () => void;
  saveLang: (lang: string) => void;
}

export function AppFooter({ dark, toggleColorScheme, toggleDimmed, saveLang }: AppFooterProps) {
  const i18n = useI18n();
  const theme = useMantineTheme();

  return (
    <Footer
      height={60}
      bg={dark ? '#784421' : '#DCA57F'}
      style={{ display: 'flex', alignItems: 'center' }}
    >
      <Container style={{ flex: 1 }}>
        <Group position='right' mt={0}>
          <div
            style={{
              marginTop: '5px',
            }}
            ref={actionButtonRef}
          />
        </Group>
      </Container>
    </Footer>
  );
}
