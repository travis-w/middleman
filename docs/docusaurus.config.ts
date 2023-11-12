import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { themes } from 'prism-react-renderer';

const config: Config = {
  title: 'Hijacker',
  tagline: 'Dinosaurs are cool',
  url: 'https://hijacker.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  // organizationName: 'travis-w', // Usually your GitHub org/user name.
  // projectName: 'hijacker', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          editUrl:
            'https://github.com/travis-w/hijacker/tree/beta/docs/',
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/travis-w/hijacker/tree/beta/docs/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig:
    ({
      navbar: {
        title: 'Hijacker',
        logo: {
          alt: 'Hijacker Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'introduction',
            position: 'left',
            label: 'Docs',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/travis-w/hijacker',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Introduction',
                to: '/docs/introduction',
              },
              {
                label: 'Getting Started',
                to: '/docs/category/getting-started',
              },
              {
                label: 'Plugins',
                to: '/docs/plugins',
              }
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              }
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/travis-w/hijacker',
              },
            ],
          },
        ],
        // copyright: `Copyright © ${new Date().getFullYear()} Travis Weidenbenner. Built with Docusaurus.`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
      },
    }),
};

export default config;