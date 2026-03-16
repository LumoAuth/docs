/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: 'doc',
      id: 'index',
      label: 'Introduction',
    },
    {
      type: 'doc',
      id: 'quickstart',
      label: 'Quickstart',
    },
    {
      type: 'doc',
      id: 'authentication',
      label: 'Authentication',
    },
    {
      type: 'doc',
      id: 'federation',
      label: 'Identity Federation',
    },
    // ── AI Agent Identity ──
    {
      type: 'category',
      label: 'AI Agent Identity',
      link: { type: 'doc', id: 'agents/index' },
      items: [
        {
          type: 'category',
          label: 'Agent Registry',
          link: { type: 'doc', id: 'agents/registry' },
          items: [
            { type: 'doc', id: 'agents/registry-langchain', label: 'LangChain / LangGraph' },
            { type: 'doc', id: 'agents/registry-crewai', label: 'CrewAI' },
            { type: 'doc', id: 'agents/registry-agno', label: 'Agno' },
            { type: 'doc', id: 'agents/registry-google-adk', label: 'Google ADK' },
            { type: 'doc', id: 'agents/registry-openai-agents', label: 'OpenAI Agents SDK' },
            { type: 'doc', id: 'agents/registry-msft', label: 'Microsoft Agent Framework' },
          ],
        },
        {
          type: 'category',
          label: 'AAuth Quick Start',
          link: { type: 'doc', id: 'agents/aauth-quickstart' },
          items: [
            { type: 'doc', id: 'agents/aauth-qs-python', label: 'Python SDK' },
            { type: 'doc', id: 'agents/aauth-qs-nodejs', label: 'JavaScript / Node.js' },
            { type: 'doc', id: 'agents/aauth-qs-langchain', label: 'LangChain / LangGraph' },
            { type: 'doc', id: 'agents/aauth-qs-crewai', label: 'CrewAI' },
            { type: 'doc', id: 'agents/aauth-qs-openai-agents', label: 'OpenAI Agents SDK' },
          ],
        },
        { type: 'doc', id: 'agents/aauth', label: 'AAuth Protocol' },
        { type: 'doc', id: 'agents/workload-federation', label: 'Workload Federation' },
        { type: 'doc', id: 'agents/ask-api', label: 'Ask API' },
        {
          type: 'category',
          label: 'JIT Permissions',
          link: { type: 'doc', id: 'agents/jit' },
          items: [
            { type: 'doc', id: 'agents/jit-langgraph', label: 'LangChain / LangGraph' },
            { type: 'doc', id: 'agents/jit-crewai', label: 'CrewAI' },
            { type: 'doc', id: 'agents/jit-openai-agents', label: 'OpenAI Agents SDK' },
            { type: 'doc', id: 'agents/jit-agno', label: 'Agno' },
            { type: 'doc', id: 'agents/jit-google-adk', label: 'Google ADK' },
          ],
        },
        { type: 'doc', id: 'agents/delegation', label: 'Chain of Agency' },
      ],
    },
    // ── MCP Servers ──
    {
      type: 'category',
      label: 'MCP Servers',
      link: { type: 'doc', id: 'mcp/index' },
      items: [
        { type: 'doc', id: 'mcp/registration', label: 'Server Registration' },
        { type: 'doc', id: 'mcp/resource-metadata', label: 'Resource Metadata' },
        { type: 'doc', id: 'mcp/authorization-flow', label: 'Authorization Flow' },
      ],
    },
    // ── Authorization API ──
    {
      type: 'category',
      label: 'Authorization API',
      link: { type: 'doc', id: 'authorization/index' },
      items: [
        { type: 'doc', id: 'authorization/check', label: 'Permission Checks' },
        { type: 'doc', id: 'authorization/zanzibar', label: 'Zanzibar / ReBAC' },
        { type: 'doc', id: 'authorization/abac', label: 'ABAC Policies' },
        { type: 'doc', id: 'authorization/permissions', label: 'List Permissions' },
      ],
    },
    // ── OAuth 2.0 API ──
    {
      type: 'category',
      label: 'OAuth 2.0 API',
      link: { type: 'doc', id: 'oauth/index' },
      items: [
        { type: 'doc', id: 'oauth/authorize', label: 'Authorization' },
        { type: 'doc', id: 'oauth/token', label: 'Token Endpoint' },
        { type: 'doc', id: 'oauth/introspect', label: 'Introspection' },
        { type: 'doc', id: 'oauth/userinfo', label: 'UserInfo' },
        { type: 'doc', id: 'oauth/register', label: 'Client Registration' },
        { type: 'doc', id: 'oauth/fapi', label: 'FAPI 2.0 Security' },
        { type: 'doc', id: 'oauth/ciba', label: 'CIBA' },
        { type: 'doc', id: 'oauth/device', label: 'Device Authorization' },
        { type: 'doc', id: 'oauth/resource-indicators', label: 'Resource Indicators' },
      ],
    },
    // ── SCIM 2.0 API ──
    {
      type: 'category',
      label: 'SCIM 2.0 API',
      link: { type: 'doc', id: 'scim/index' },
      items: [
        { type: 'doc', id: 'scim/users', label: 'Users' },
        { type: 'doc', id: 'scim/groups', label: 'Groups' },
        { type: 'doc', id: 'scim/discovery', label: 'Discovery' },
        { type: 'doc', id: 'scim/bulk', label: 'Bulk & Search' },
      ],
    },
    // ── SAML 2.0 API ──
    {
      type: 'category',
      label: 'SAML 2.0 API',
      link: { type: 'doc', id: 'saml/index' },
      items: [
        { type: 'doc', id: 'saml/sp', label: 'Service Provider' },
        { type: 'doc', id: 'saml/idp', label: 'Identity Provider' },
        { type: 'doc', id: 'saml/metadata', label: 'Metadata' },
      ],
    },
    // ── Admin API ──
    {
      type: 'category',
      label: 'Admin API',
      link: { type: 'doc', id: 'admin/index' },
      items: [
        { type: 'doc', id: 'admin/spec', label: 'OpenAPI Specification' },
      ],
    },
    // ── Reference ──
    {
      type: 'doc',
      id: 'errors',
      label: 'Error Codes',
    },
    // ── API Reference ──
    {
      type: 'category',
      label: 'API Reference',
      link: { type: 'doc', id: 'api-reference/index' },
      items: [
        { type: 'doc', id: 'api-reference/authentication', label: 'Authentication' },
        { type: 'doc', id: 'api-reference/errors', label: 'Errors' },
        { type: 'doc', id: 'api-reference/pagination', label: 'Pagination' },
        { type: 'doc', id: 'api-reference/rate-limits', label: 'Rate Limits' },
        // Core Resources
        { type: 'doc', id: 'api-reference/users', label: 'Users' },
        { type: 'doc', id: 'api-reference/roles', label: 'Roles' },
        { type: 'doc', id: 'api-reference/groups', label: 'Groups' },
        { type: 'doc', id: 'api-reference/permissions', label: 'Permissions' },
        // OAuth 2.0 / OIDC
        {
          type: 'category',
          label: 'OAuth 2.0',
          items: [
            { type: 'doc', id: 'api-reference/oauth/clients', label: 'OAuth Clients' },
            { type: 'doc', id: 'api-reference/oauth/authorize', label: 'Authorization' },
            { type: 'doc', id: 'api-reference/oauth/pkce', label: 'PKCE' },
            { type: 'doc', id: 'api-reference/oauth/token', label: 'Token Endpoint' },
            { type: 'doc', id: 'api-reference/oauth/introspect', label: 'Introspection' },
            { type: 'doc', id: 'api-reference/oauth/userinfo', label: 'UserInfo' },
            { type: 'doc', id: 'api-reference/oauth/logout', label: 'Logout' },
            { type: 'doc', id: 'api-reference/oauth/scopes', label: 'Scopes' },
            { type: 'doc', id: 'api-reference/oauth/register', label: 'Dynamic Registration' },
            { type: 'doc', id: 'api-reference/oauth/tokens', label: 'Token Management' },
            { type: 'doc', id: 'api-reference/oauth/par', label: 'PAR (Pushed Auth)' },
            { type: 'doc', id: 'api-reference/oauth/ciba', label: 'CIBA (Backchannel)' },
            { type: 'doc', id: 'api-reference/oauth/device', label: 'Device Authorization' },
            { type: 'doc', id: 'api-reference/oauth/fapi', label: 'FAPI 2.0 Security' },
            { type: 'doc', id: 'api-reference/oauth/security', label: 'Security Considerations' },
          ],
        },
        // Authorization
        {
          type: 'category',
          label: 'Authorization',
          link: { type: 'doc', id: 'api-reference/authorization/index' },
          items: [
            { type: 'doc', id: 'api-reference/authorization/check', label: 'Check Access' },
            { type: 'doc', id: 'api-reference/authorization/policies', label: 'Policies' },
            { type: 'doc', id: 'api-reference/authorization/attributes', label: 'Attributes' },
            { type: 'doc', id: 'api-reference/authorization/zanzibar', label: 'Zanzibar (ReBAC)' },
          ],
        },
        // AI Agents
        {
          type: 'category',
          label: 'AI Agents',
          link: { type: 'doc', id: 'api-reference/agents/index' },
          items: [
            { type: 'doc', id: 'api-reference/agents/ask', label: 'Agent Ask' },
            { type: 'doc', id: 'api-reference/agents/jit', label: 'JIT Permissions' },
          ],
        },
        // SCIM 2.0
        {
          type: 'category',
          label: 'SCIM 2.0',
          link: { type: 'doc', id: 'api-reference/scim/index' },
          items: [
            { type: 'doc', id: 'api-reference/scim/users', label: 'Users' },
            { type: 'doc', id: 'api-reference/scim/groups', label: 'Groups' },
            { type: 'doc', id: 'api-reference/scim/bulk', label: 'Bulk Operations' },
          ],
        },
        // Identity
        { type: 'doc', id: 'api-reference/sessions', label: 'Sessions' },
        { type: 'doc', id: 'api-reference/social-providers', label: 'Social Providers' },
        // Webhooks & Events
        { type: 'doc', id: 'api-reference/webhooks', label: 'Webhooks' },
        { type: 'doc', id: 'api-reference/audit-logs', label: 'Audit Logs' },
        // Settings
        { type: 'doc', id: 'api-reference/tenant', label: 'Tenant Settings' },
      ],
    },
  ],
};

module.exports = sidebars;
