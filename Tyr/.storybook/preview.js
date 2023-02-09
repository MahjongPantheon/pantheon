import '../app/styles/base.css';
import '../app/styles/themes.css';
import '../app/styles/variables.css';
import { I18nDecorator } from './decorators/I18nDecorator';
import { ThemeDecorator } from './decorators/ThemeDecorator';
import { CanvasDecorator } from './decorators/CanvasDecorator';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  layout: 'fullscreen',
};

export const decorators = [ThemeDecorator, I18nDecorator, CanvasDecorator];
