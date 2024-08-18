import type { StorybookConfig } from '@storybook/react-vite';
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
    const processEnv = config?.define ? config.define['process.env'] : {};
  
    return mergeConfig(config, {
      define: {
        'process.env': {
          ...processEnv,
          STORYBOOK_ACTIVE: true
        }
      }
    });
  }
};
export default config;
