---
slug: /
---

# LumoAuth Docs

Welcome to the LumoAuth documentation. LumoAuth is the **Identity Layer for the AI Era**.
We provide comprehensive identity, security, and access control for AI agents, while fully supporting traditional OAuth 2.0 apps.

:::note[Base URL]
API endpoints are relative to your tenant's base URL:
`https://app.lumoauth.dev/t/\{tenantSlug\}/api/v1/`

Base hostname for EU is `https://eu.app.lumoauth.dev`
:::

## New to LumoAuth?

Start with the **User Guide** to understand the platform and get up and running:

- [**What is LumoAuth?**](/user-guide/getting-started/overview) - Platform overview, features, and architecture
- [**Quick Start**](/user-guide/getting-started/quick-start) - Sign up and get started in minutes
- [**Core Concepts**](/user-guide/getting-started/concepts) - Tenants, users, roles, OAuth clients, and how they fit together
- [**Configure Your Tenant**](/user-guide/getting-started/first-tenant) - Set up authentication and register your first application

## User Guide Highlights

| Section | Description |
| --- | --- |
| [**Authentication**](/user-guide/authentication/overview) | Email/password, social login, MFA, adaptive MFA, passkeys, enterprise SSO, device flow |
| [**Multi-Tenancy**](/user-guide/multi-tenancy/overview) | Tenant setup, portal navigation, custom domains |
| [**Access Control**](/user-guide/access-control/overview) | RBAC, groups, ABAC, Zanzibar, AI policy authoring |
| [**User Management**](/user-guide/user-management/overview) | Invitations, sessions, account self-service |
| [**Applications**](/user-guide/applications/overview) | OAuth 2.0/OIDC, SAML, signing keys |
| [**Compliance**](/user-guide/compliance/gdpr) | GDPR, audit logs |
| [**Integrations**](/user-guide/integrations/webhooks) | Webhooks, SCIM 2.0, email templates |
| [**Security**](/user-guide/security/overview) | Attack protection, rate limiting, best practices |
| [**AI Agents & MCP**](/user-guide/ai-agents/overview) | Agent identity, workload identity, MCP server integration |

## Core Concepts

LumoAuth is built to handle the complex agency of AI models while maintaining strict security boundaries.

- [**AI Agent Identity**](/agents): First-class identity for AI agents. Workload identity federation, autonomous delegation, and capability scoping.
- [**Authorization API**](/authorization): Fine-grained permission checks using RBAC, ABAC, and Google Zanzibar-style relationship-based access control.
- [**OAuth 2.0 & OIDC**](/oauth): Industry-standard OAuth 2.0 and OpenID Connect for web and mobile apps, plus SAML and social login integrations.

## Platform Capabilities

- **AI Agent Identity:** Workload identity federation for autonomous agents with scoped capabilities and delegation
- **The Ask API:** Natural language-friendly authorization optimized for LLM reasoning loops
- **Zanzibar ReBAC:** Google-style relationship-based access control for fine-grained permissions
- **Token Exchange:** RFC 8693 delegation enabling agents to act on behalf of users
- **Multi-Tenant Architecture:** Complete isolation of users, roles, and configurations per tenant
- **Tenant Admin API:** Comprehensive RESTful API for programmatic management of all tenant resources
- **OAuth 2.0 & OIDC:** Full implementation for traditional web and mobile app authentication
- **Enterprise SSO:** SAML, social login, and external identity provider integrations

## Authentication vs Authorization

Before diving in, it's important to understand the difference between these two concepts:

| Authentication (AuthN) | Authorization (AuthZ) |
| --- | --- |
| "Who are you?" | "What can you do?" |
| Verifies identity using credentials | Checks permissions for actions |
| OAuth 2.0, OIDC, Social Login | RBAC, ABAC, Zanzibar |
| Results in access tokens | Results in allow/deny decisions |

## Getting Help

If you run into issues or have questions:

- Check the [Error Codes](/errors) reference for troubleshooting
- Review the [Quickstart Guide](/quickstart) for a step-by-step tutorial
- Each endpoint page includes detailed examples and common use cases
