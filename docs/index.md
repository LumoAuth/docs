---
slug: /
---

# LumoAuth Docs

Welcome to the LumoAuth API documentation. LumoAuth is the **Identity Layer for the AI Era**.
We provide comprehensive identity, security, and access control for AI agents, while fully supporting traditional OAuth 2.0 apps.

:::note[Base URL]
All API endpoints are relative to your tenant's base URL:
`https://app.lumoauth.dev/t/\{tenantSlug\}/api/v1/`

Base hostname for EU is `https://eu.app.lumoauth.dev`
:::


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
