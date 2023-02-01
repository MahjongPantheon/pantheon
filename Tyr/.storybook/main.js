const path = require('path');

module.exports = {
  stories: ['../app/**/*.stories.mdx', '../app/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-webpack5',
  },
  webpackFinal: (config) => {
    const resourcesRule = config.module.rules.find((rule) =>
      rule.test
        .toString()
        .includes(
          '/\\.(svg|ico|jpg|jpeg|png|apng|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\\?.*)?$/'
        )
    );
    if (resourcesRule) {
      resourcesRule.test =
        /\.(ico|jpg|jpeg|png|apng|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/;
    } else {
      throw new Error(`Default SVG loader won't work`);
    }

    config.module.rules.push({
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      oneOf: [
        {
          resourceQuery: /svgr/,
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                svgoConfig: {
                  plugins: [
                    {
                      name: 'removeViewBox',
                      active: false,
                    },
                  ],
                },
              },
            },
          ],
          type: 'javascript/auto',
        },
        {
          type: 'asset/resource',
        },
      ],
    });

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '#': path.resolve(__dirname, '../app'),
      '#config': path.resolve(__dirname, '../app/envConfig/environment.local.ts'),
    };

    config.resolve.extensions.push('.ts', '.tsx');

    return config;
  },
};
