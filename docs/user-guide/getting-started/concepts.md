# Core Concepts

Before diving into LumoAuth's features, it helps to understand the key concepts and how they relate to each other.

---

## Tenants

A **tenant** is an isolated environment within LumoAuth. Each tenant has its own:

- Users and user data
- Roles, permissions, and groups
- OAuth applications and clients
- Authentication settings (MFA, social login, SSO)
- Audit logs and compliance data
- Custom domains and branding

Tenants are identified by a **slug** - a URL-friendly identifier like `acme-corp`. All tenant-specific resources are accessed under the `/t/{tenantSlug}/` URL namespace.

### Tenant URL Structure

```
/t/{tenantSlug}/portal/                          → Tenant admin dashboard
/t/{tenantSlug}/portal/applications              → OAuth application management
/t/{tenantSlug}/portal/access-management/users   → User management
/t/{tenantSlug}/portal/access-management/roles   → Role management
/t/{tenantSlug}/portal/access-management/groups  → Group management
/t/{tenantSlug}/portal/configuration/            → Tenant settings
/t/{tenantSlug}/api/v1/oauth/authorize           → OAuth 2.0 authorize
/t/{tenantSlug}/api/v1/oauth/token               → OAuth 2.0 token
/t/{tenantSlug}/api/v1/scim2.0/Users             → SCIM provisioning
```

---

## Users

A **user** represents a person who can authenticate with LumoAuth. Users belong to a specific tenant and can have:

- **Credentials** - Email/password, social accounts, passkeys
- **Roles** - One or more roles that define their permissions
- **Groups** - Membership in groups that grant additional roles
- **MFA methods** - TOTP, SMS, email, or backup codes
- **Sessions** - Active login sessions across devices
- **Social accounts** - Linked identity provider accounts (Google, GitHub, etc.)

### User Lifecycle

```
Invited/Registered → Email Verified → Active → (Blocked/Deleted)
```

Users can self-register, be invited by an admin, or be provisioned automatically via SCIM or JIT (just-in-time) provisioning from an external identity provider.

---

## Roles & Permissions

LumoAuth uses **Role-Based Access Control (RBAC)** as its primary authorization model.

- **Permissions** define what actions can be performed on what resources (e.g., `user:read`, `tenant:manage`)
- **Roles** are collections of permissions assigned to users (e.g., `admin`, `editor`, `viewer`)
- **System roles** are predefined and cannot be deleted; custom roles can be created per tenant

### Example

```
Role: "Editor"
  Permissions:
    - article:read
    - article:write
    - article:publish
    - comment:read
    - comment:write
```

---

## Groups

**Groups** let you organize users and assign roles in bulk. When a user is added to a group, they inherit all roles assigned to that group.

```
Group: "Engineering Team"
  Roles: [Developer, Deployer]
  Members: [alice@example.com, bob@example.com]
```

---

## OAuth Applications (Clients)

An **OAuth application** (also called a client) represents an application that authenticates users through LumoAuth. Each application has:

- **Client ID** - Public identifier
- **Client Secret** - Confidential key (for server-side apps)
- **Redirect URIs** - Allowed callback URLs
- **Grant Types** - Which OAuth 2.0 flows are permitted
- **Scopes** - What data the application can access

### Application Types

| Type | Grant Types | Use Case |
|------|------------|----------|
| **Web Application** | Authorization Code | Server-rendered web apps |
| **Single-Page App (SPA)** | Authorization Code + PKCE | JavaScript frameworks (React, Vue, Angular) |
| **Native/Mobile App** | Authorization Code + PKCE | iOS, Android apps |
| **Machine-to-Machine** | Client Credentials | Backend services, APIs, cron jobs |
| **CLI/IoT Device** | Device Authorization | Command-line tools, smart TVs |
| **SAML Application** | SAML 2.0 Assertion | Enterprise SSO integration |

---

## Scopes & Claims

**Scopes** define what information an application can request from LumoAuth. Standard OIDC scopes include:

| Scope | Claims Returned |
|-------|----------------|
| `openid` | Subject identifier (`sub`) |
| `profile` | Name, nickname, picture, etc. |
| `email` | Email address, email verification status |
| `address` | Postal address |
| `phone` | Phone number |

Custom scopes can be defined per tenant for API-specific access control.

---

## Tokens

LumoAuth issues several types of tokens:

| Token | Format | Purpose | Lifetime |
|-------|--------|---------|----------|
| **Access Token** | JWT | Authorize API requests | Short-lived (minutes to hours) |
| **ID Token** | JWT | Identify the authenticated user | Short-lived |
| **Refresh Token** | Opaque | Obtain new access tokens | Long-lived (days to months) |
| **Authorization Code** | Opaque | Exchange for tokens (one-time use) | Very short-lived (minutes) |
| **Device Code** | Opaque | Device flow polling | Minutes |

---

## Authentication Flows

LumoAuth supports these OAuth 2.0 / OIDC authentication flows:

| Flow | Best For | Description |
|------|----------|-------------|
| **Authorization Code** | Web apps | Redirect-based, most secure for server apps |
| **Authorization Code + PKCE** | SPAs, mobile | Same as above with code verifier for public clients |
| **Client Credentials** | M2M | Service-to-service without user context |
| **Device Authorization** | CLI, IoT | Displays a code for the user to enter on another device |
| **Refresh Token** | All | Exchange a refresh token for new access/ID tokens |
| **CIBA** | Decoupled | Backchannel authentication initiated by the client |

---

## Tenant Portal Sections

The tenant portal at `/t/{tenantSlug}/portal/` is organized into these sections:

### Dashboard
The main overview page with key metrics and recent activity.

### Applications (Developer)
- `/t/{tenantSlug}/portal/applications` - List and manage OAuth/SAML applications
- Create, edit, and delete OAuth clients
- Configure SAML service providers
- Manage per-app social login settings
- Rotate client secrets

### Access Management
- `/t/{tenantSlug}/portal/access-management/users` - User CRUD, search, invite
- `/t/{tenantSlug}/portal/access-management/roles` - Role definitions and permission assignment
- `/t/{tenantSlug}/portal/access-management/groups` - Group management
- `/t/{tenantSlug}/portal/access-management/permissions` - Permission definitions
- `/t/{tenantSlug}/portal/access-management/zanzibar` - Fine-grained access control
- `/t/{tenantSlug}/portal/access-management/abac` - Attribute-based policies
- `/t/{tenantSlug}/portal/access-management/policy-author` - AI-powered policy authoring
- `/t/{tenantSlug}/portal/access-management/permission-tester` - Real-time permission testing

### Configuration
- `/t/{tenantSlug}/portal/configuration/auth-settings` - Authentication methods, MFA, adaptive auth
- `/t/{tenantSlug}/portal/configuration/social-login` - Social identity provider setup
- `/t/{tenantSlug}/portal/configuration/saml-idp` - SAML IdP configuration
- `/t/{tenantSlug}/portal/configuration/oidc-idp` - External OIDC IdP configuration
- `/t/{tenantSlug}/portal/configuration/ldap` - LDAP/Active Directory setup
- `/t/{tenantSlug}/portal/configuration/email-templates` - Customize email notifications
- `/t/{tenantSlug}/portal/configuration/webhooks` - Webhook event subscriptions

### Security & Compliance
- `/t/{tenantSlug}/portal/signing-keys` - JWT signing key management and rotation
- `/t/{tenantSlug}/portal/custom-domains` - Branded login domain configuration
- `/t/{tenantSlug}/portal/audit-logs` - Immutable security audit trail
- `/t/{tenantSlug}/portal/gdpr` - GDPR data subject requests and privacy tools

### Observability
- `/t/{tenantSlug}/portal/observability` - Datadog and Axiom integration

### AI Agents
- `/t/{tenantSlug}/portal/ai-agents` - Autonomous agent management and MCP configuration

---

## Next Steps

- [Configure Your Tenant](first-tenant.md) - Hands-on setup of your tenant
- [Authentication Overview](../authentication/overview.md) - Learn about all auth methods
- [Access Control Overview](../access-control/overview.md) - Understand authorization models
