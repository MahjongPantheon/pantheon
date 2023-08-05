/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
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
import './page-setting.css';
import { Switch } from '../../general/switch/Switch';
import { TopPanel } from '../../general/top-panel/TopPanel';
import classNames from 'classnames';
import { Theme } from '../../../services/themes';
import { useContext } from 'react';
import { i18n } from '../../i18n';
import { PlayerAvatar } from '../../general/avatar/Avatar';
import { env } from '../../../env';

interface IProps {
  playerName: string;
  playerId?: number;
  playerHasAvatar?: boolean;
  playerLastUpdate: string;
  supportedLanguages: string[];
  currentLanguage: string;
  supportedThemes: Theme[];
  currentTheme: string;
  singleDeviceMode: boolean;
  onLogout: () => void;
  onBackClick: () => void;
  onSingleDeviceModeChange: (value: boolean) => void;
  onLangChange: (lang: string) => void;
  onThemeSelect: (theme: string) => void;
  onEventSelect: () => void;
}

export const SettingsScreenView = React.memo(function (props: IProps) {
  const loc = useContext(i18n);
  const {
    playerName,
    playerId,
    playerHasAvatar,
    playerLastUpdate,
    supportedLanguages,
    currentLanguage,
    supportedThemes,
    currentTheme,
    singleDeviceMode,
    onLogout,
    onBackClick,
    onSingleDeviceModeChange,
    onLangChange,
    onThemeSelect,
    onEventSelect,
  } = props;

  return (
    <div className='flex-container page-setting'>
      <div className='flex-container__content'>
        <TopPanel onBackClick={onBackClick} />
        <div className='page-setting__name'>
          {playerId && (
            <PlayerAvatar
              size={48}
              p={{
                id: playerId,
                title: playerName,
                hasAvatar: playerHasAvatar,
                lastUpdate: playerLastUpdate,
              }}
            />
          )}
          {playerName}
        </div>
        <div className='page-setting__section'>
          <a
            className='flat-btn flat-btn--large'
            style={{ width: '100%' }}
            target='_blank'
            href={`${env.urls.forseti}/profile/manage`}
          >
            {loc._t('Go to personal area')}
          </a>
        </div>
        <div className='page-setting__section'>
          <div className='page-setting__section-title'>{loc._t('Language')}</div>
          <div className='page-setting__section-content'>
            {supportedLanguages.map((lang) => (
              <div
                key={lang}
                className={classNames('radio-btn radio-btn--small', {
                  'radio-btn--active': lang === currentLanguage,
                })}
                onClick={() => onLangChange(lang)}
              >
                {lang}
              </div>
            ))}
          </div>
        </div>
        <div className='page-setting__section'>
          <div className='page-setting__section-title'>{loc._t('Theme')}</div>
          <div className='page-setting__section-content'>
            {supportedThemes.map((theme) => (
              <div
                key={theme.name}
                className={classNames('theme', { 'theme--selected': theme.name === currentTheme })}
              >
                <div className='theme__visual' onClick={() => onThemeSelect(theme.name)}>
                  <div
                    className='theme__visual-inner'
                    style={{ backgroundColor: theme.backgroundColor }}
                  >
                    <div
                      className='theme__secondary-color'
                      style={{ backgroundColor: theme.secondaryColor }}
                    />
                    <div
                      className='theme__text-color'
                      style={{ backgroundColor: theme.textColor }}
                    />
                    <div
                      className='theme__primary-color'
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                  </div>
                </div>
                <div className='theme__name'>{theme.name}</div>
              </div>
            ))}
          </div>
        </div>
        <div className='page-setting__section'>
          <div className='page-setting__section-content'>
            <button
              className='flat-btn flat-btn--large'
              style={{ width: '100%' }}
              onClick={() => onEventSelect()}
            >
              {loc._t('Select another event')}
            </button>
          </div>
        </div>
        <div className='page-setting__section'>
          <div className='switch-setting'>
            <Switch value={singleDeviceMode} onChange={onSingleDeviceModeChange} />
            <div className='switch-setting__description'>
              <div className='switch-setting__caption'>{loc._t('Single device mode')}</div>
              <div className='switch-setting__info'>
                {loc._t('Turn on if you use a single device for all players')}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='flex-container__bottom page-setting__bottom' onClick={onLogout}>
        <div className='link'>{loc._t('Log out')}</div>
      </div>
    </div>
  );
});
