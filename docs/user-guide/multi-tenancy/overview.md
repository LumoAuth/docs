# Multi-Tenancy

LumoAuth is built from the ground up as a multi-tenant identity platform. Every resource - users, applications, roles, configurations - is scoped to a tenant, providing complete data isolation while sharing a single deployment.

---

## What is Multi-Tenancy?

A **tenant** in LumoAuth represents an isolated identity domain. Each tenant has its own:

- Users and user profiles
- OAuth applications and API clients
- Roles, permissions, and access policies
- Authentication settings (MFA, social login, SSO)
- Branding and custom domains
- Audit logs and compliance data

Tenants are completely isolated from each other. A user in one tenant cannot access resources in another tenant.

---

## URL Structure

Every tenant is accessed through its unique slug in the URL:

```
https://your-domain.com/t/{tenantSlug}/...
```

| Path | Purpose |
|------|---------|
| `/t/{tenantSlug}/portal/` | Tenant admin portal dashboard |
| `/t/{tenantSlug}/portal/applications` | Manage OAuth applications |
| `/t/{tenantSlug}/portal/access-management/` | Users, roles, groups, permissions |
| `/t/{tenantSlug}/portal/configuration/` | Auth settings, social login, SAML, LDAP |
| `/t/{tenantSlug}/api/v1/` | Tenant API endpoints |
| `/t/{tenantSlug}/api/v1/oauth/authorize` | OAuth authorization endpoint |
| `/t/{tenantSlug}/api/v1/oauth/token` | Token endpoint |
| `/t/{tenantSlug}/.well-known/openid-configuration` | OIDC discovery |

With [custom domains](custom-domains.md), you can map `auth.yourdomain.com` to your tenant, removing the `/t/{tenantSlug}` prefix entirely.

---

## Use Cases

| Scenario | How Multi-Tenancy Helps |
|----------|------------------------|
| **SaaS Platform** | Each customer gets their own tenant with separate users and settings |
| **Enterprise Departments** | Each department maintains independent identity configurations |
| **Environments** | Separate tenants for dev, staging, and production |
| **White-Label Products** | Each brand operates under its own custom domain |

---

## Tenant Isolation

LumoAuth enforces tenant isolation at every layer:

| Layer | Isolation Mechanism |
|-------|-------------------|
| **Data** | All database queries are scoped to the current tenant |
| **Authentication** | Login sessions are tenant-specific |
| **API** | All API requests require tenant context |
| **Configuration** | Auth settings, MFA policies, social providers are per-tenant |
| **Audit Logs** | Logs are tenant-scoped and cannot be accessed cross-tenant |
| **Tokens** | Access tokens include tenant claims and are validated per-tenant |

---

## In This Section

| Guide | Description |
|-------|-------------|
| [Tenant Setup](tenant-setup.md) | Create, configure, and manage tenants |
| [Tenant Portal](tenant-portal.md) | Navigate the tenant admin portal |
| [Custom Domains](custom-domains.md) | Map your own domain to a tenant |
