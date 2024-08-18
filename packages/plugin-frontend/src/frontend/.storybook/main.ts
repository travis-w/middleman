import type { StorybookConfig } from '@storybook/react-vite';

import { withoutVitePlugins } from '@storybook/builder-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../**/*.mdx', '../**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-dark-mode'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: 'vite.config.ts',
      }
    },
  },
  async viteFinal(config) {
    // Disable hijacker plugin for storybook
    config.plugins = await withoutVitePlugins(config.plugins, [
      "hijacker",
    ]);

    return config;
  }
};
export default config;
