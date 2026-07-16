// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  mainSidebar: [
    'intro',
    'getting-started/local-development',
  ],
  frontendSidebar: [
    {
      type: 'category',
      label: '프론트엔드',
      items: [
        'frontend/overview',
        'frontend/routing',
        'frontend/api-integration',
        'frontend/auth-flow',
        'frontend/domain-flows',
      ],
    },
  ],
  backendSidebar: [
    {
      type: 'category',
      label: '백엔드',
      items: [
        'development/architecture-overview',
        'development/request-flow',
        'development/data-model',
        'development/domain-knowledge-guide',
      ],
    },
  ],
  apiSidebar: [
    {
      type: 'category',
      label: 'API 레퍼런스',
      items: ['api/common', 'api/domain-summary', 'api/rate-submission'],
    },
  ],
  opsSidebar: [
    {
      type: 'category',
      label: '운영',
      items: ['ops/deploy', 'ops/runtime-configuration', 'observability/logging'],
    },
  ],
};

export default sidebars;
