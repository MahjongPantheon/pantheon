import classNames from 'classnames';

import { Theme } from '../../../services/themes';
import styles from './ThemeSelector.module.css';
import { useContext } from 'react';
import { i18n } from '../../i18n';

type IProps = {
  supportedThemes: Theme[];
  currentTheme: string;
  onThemeSelect: (theme: string) => void;
};

export const ThemeSelector = ({ supportedThemes, currentTheme, onThemeSelect }: IProps) => {
  const loc = useContext(i18n);
  return (
    <div className={styles.wrapper}>
      <div className={styles.sectionTitle}>{loc._t('Theme')}</div>
      <div className={styles.themesList}>
        {supportedThemes.map((theme) => (
          <div
            key={theme.name}
            className={classNames(
              styles.theme,
              theme.name === currentTheme ? styles.selected : null
            )}
          >
            <div className={styles.visual} onClick={() => onThemeSelect(theme.name)}>
              <div
                className={styles.visualInner}
                style={{ backgroundColor: theme.backgroundColor }}
              >
                <div
                  className={styles.secondaryColor}
                  style={{ backgroundColor: theme.secondaryColor }}
                />
                <div className={styles.textColor} style={{ backgroundColor: theme.textColor }} />
                <div
                  className={styles.primaryColor}
                  style={{ backgroundColor: theme.primaryColor }}
                />
              </div>
            </div>
            <div className={styles.themeName}>{theme.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
