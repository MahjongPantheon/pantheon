import { Meta } from '@storybook/react';
import { ThemeSelector } from './ThemeSelector';
import { themes } from '../../../services/themes';
import { PageDecorator } from '../../../../.storybook/PageDecorator';
import { useState } from 'react';

export default {
  title: 'Molecules / ThemeSelector',
  component: ThemeSelector,
  decorators: [PageDecorator],
  render: (args) => {
    const [currentTheme, setCurrentTheme] = useState('day');
    return (
      <div style={{ display: 'flex', gap: '10px' }}>
        <ThemeSelector {...args} currentTheme={currentTheme} onThemeSelect={setCurrentTheme} />
      </div>
    );
  },
} satisfies Meta<typeof ThemeSelector>;

export const Default = {
  args: {
    supportedThemes: themes,
    currentTheme: 'day',
    onThemeSelect: () => {},
  },
};
