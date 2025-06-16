import { PageDecorator } from '../../../../.storybook/PageDecorator';
import { Meta } from '@storybook/react-vite';
import { Settings } from './Settings';
import { themes } from '../../../services/themes';

export default {
  title: 'Pages / Settings',
  component: Settings,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ height: '500px' }}>
        <Settings {...args} />
      </div>
    );
  },
} satisfies Meta<typeof Settings>;

export const Default = {
  args: {
    player: {
      playerName: 'Player 1',
      id: 1,
      hasAvatar: false,
      lastUpdate: new Date().toString(),
    },
    supportedLanguages: ['en', 'ru', 'de', 'ko', 'cn', 'jp', 'ema'],
    currentLanguage: 'ema',
    supportedThemes: themes,
    currentTheme: 'day',
    singleDeviceMode: false,
    onLogout: () => {},
    onBackClick: () => {},
    onSingleDeviceModeChange: () => {},
    onLangChange: () => {},
    onThemeSelect: () => {},
    onEventSelect: () => {},
    onClickGotoPersonalArea: () => {},
  },
};
