// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'LumoAuth Documentation',
  tagline: 'The Identity Layer for the AI Era',


  url: 'https://docs.lumoauth.dev',
  baseUrl: '/',

  organizationName: 'lumoauth',
  projectName: 'lumoauth',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',

  clientModules: [
    require.resolve('./src/clientModules/clipboardPolyfill.js'),
  ],

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/lumoauth/lumoauth/tree/main/docs/',
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
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        style: 'dark',
        title: 'LumoAuth',
        logo: {
          alt: 'LumoAuth',
          src: 'img/lumo-logo.png',
          width: 32,
        },
        items: [
          {
            href: 'https://github.com/lumoauth/docs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `© ${new Date().getFullYear()} LumoAuth LLC. All rights reserved.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.vsDark,
        darkTheme: require('prism-react-renderer').themes.vsDark,
        additionalLanguages: ['bash', 'json', 'python', 'php', 'java'],
      },
      algolia: {
        appId: 'EI7JZQKLDP',
        apiKey: '8c98e0e14f49c548e4e7205372831740',
        indexName: 'LumoAuth Docs',
        contextualSearch: true,
	askAi: 'NsLBohC5VoIs',
      },
    }),
  plugins: [
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        siteTitle: 'LumoAuth Documentation',
        siteDescription: 'Simplified auth and authz for AI agents and apps',
        depth: 4,
        content: {
          includeBlog: true,
          includePages: true,
          enableLlmsFullTxt: true
        }
      }
    ],
    function ignoreVscodeWarnings() {
      return {
        name: 'ignore-vscode-languageserver-warnings',
        configureWebpack() {
          return {
            ignoreWarnings: [
              {
                module: /vscode-languageserver-types/,
                message: /Critical dependency/,
              },
            ],
          };
        },
      };
    },
  ],
};

module.exports = config;
