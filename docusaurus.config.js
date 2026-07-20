// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OLma 기술 문서',
  tagline: 'OLma 개발·운영 레퍼런스',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://olma-web.github.io',
  baseUrl: '/OLma-Docs/',

  organizationName: 'Olma-Web',
  projectName: 'OLma-Docs',

  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
  },

  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themes: ['@docusaurus/theme-mermaid'],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'OLma Docs',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'frontendSidebar',
            position: 'left',
            label: '프론트엔드',
          },
          {
            type: 'docSidebar',
            sidebarId: 'backendSidebar',
            position: 'left',
            label: '백엔드',
          },
          {
            type: 'docSidebar',
            sidebarId: 'apiSidebar',
            position: 'left',
            label: 'API',
          },
          {
            type: 'docSidebar',
            sidebarId: 'opsSidebar',
            position: 'left',
            label: '운영',
          },
          {
            href: 'https://olma-web.github.io/OLma-Docs/artifacts/openapi-2026-08-01.json',
            label: 'OpenAPI',
            position: 'right',
          },
          {
            href: 'https://github.com/Olma-Web/OLma-Docs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['java', 'yaml', 'bash'],
      },
      mermaid: {
        theme: {light: 'neutral', dark: 'dark'},
      },
    }),
};

export default config;
