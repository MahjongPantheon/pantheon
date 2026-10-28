import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../app/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@chromatic-com/storybook',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    // Storybook has no offline app lifecycle; do not precache its manager and previews.
    plugins: viteConfig.plugins
      ?.flat()
      .filter(
        (plugin) => !plugin || !('name' in plugin) || !plugin.name.startsWith('vite-plugin-pwa')
      ),
  }),
  core: {
    disableTelemetry: true,
  },
};
export default config;
