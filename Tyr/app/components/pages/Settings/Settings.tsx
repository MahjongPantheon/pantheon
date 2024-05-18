import { Theme } from '../../../services/themes';

import { ReactElement, useContext } from 'react';
import { i18n } from '../../i18n';
import LinkIcon from '../../../img/icons/link.svg?react';
import BackIcon from '../../../img/icons/arrow-left.svg?react';
import LogoutIcon from '../../../img/icons/logout.svg?react';
import { Button } from '../../base/Button/Button';
import { ScrollableSwitch } from '../../base/ScrollableSwitch/ScrollableSwitch';
import { ThemeSelector } from '../../base/ThemeSelector/ThemeSelector';
import { Switch } from '../../base/Switch/Switch';
import { Player } from '../../base/Player/Player';
import styles from './Settings.module.css';
import { FlagCn, FlagDe, FlagEn, FlagJa, FlagKo, FlagRu } from '../../base/Flags';
import { supportedLanguages as langs } from '../../../services/i18n';
import { PlayerDescriptor } from '../../../helpers/interfaces';

interface IProps {
  player: PlayerDescriptor;
  supportedLanguages: typeof langs;
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
  onClickGotoPersonalArea: () => void;
}

const flags: Record<(typeof langs)[number], ReactElement> = {
  en: (
    <div className={styles.flagWithLabel}>
      <FlagEn width={32} />
    </div>
  ),
  ru: (
    <div className={styles.flagWithLabel}>
      <FlagRu width={32} />
    </div>
  ),
  de: (
    <div className={styles.flagWithLabel}>
      <FlagDe width={32} />
    </div>
  ),
  ko: (
    <div className={styles.flagWithLabel}>
      <FlagKo width={32} />
    </div>
  ),
  jp: (
    <div className={styles.flagWithLabel}>
      <FlagJa width={32} />
    </div>
  ),
  cn: (
    <div className={styles.flagWithLabel}>
      <FlagCn width={32} />
    </div>
  ),
  ema: (
    <div className={styles.flagWithLabel}>
      <FlagEn width={32} />
      EMA
    </div>
  ),
};

export const Settings = (props: IProps) => {
  const loc = useContext(i18n);
  const {
    player,
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
    onClickGotoPersonalArea,
  } = props;

  return (
    <div className={styles.wrapper}>
      <div className={styles.topPanel}>
        <Button variant='light' icon={<BackIcon />} size='lg' onClick={onBackClick} />
        {player.id && <Player {...player} size='md' />}
        <Button variant='light' icon={<LogoutIcon />} size='lg' onClick={onLogout} />
      </div>
      <Button
        variant='contained'
        size='fullwidth'
        rightIcon={<LinkIcon />}
        onClick={onClickGotoPersonalArea}
      >
        {loc._t('Go to personal area')}
      </Button>
      <Button variant='contained' size='fullwidth' onClick={() => onEventSelect()}>
        {loc._t('Select another event')}
      </Button>
      <hr className={styles.separator} />
      <div className={styles.sectionTitle}>{loc._t('Language')}</div>
      <ScrollableSwitch
        options={supportedLanguages.map((lang) => ({
          label: flags[lang],
          onSelect: () => onLangChange(lang),
          selected: lang === currentLanguage,
        }))}
      />
      <hr className={styles.separator} />
      <ThemeSelector
        supportedThemes={supportedThemes}
        currentTheme={currentTheme}
        onThemeSelect={onThemeSelect}
      />
      <hr className={styles.separator} />
      <Switch
        value={singleDeviceMode}
        onChange={onSingleDeviceModeChange}
        label={loc._t('Single device mode')}
        description={loc._t('Turn on if you use a single device for all players')}
      />
    </div>
  );
};
