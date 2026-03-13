# LumoAuth API Reference

The LumoAuth API is organized around REST. Our API has predictable resource-oriented URLs,
accepts JSON-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP
response codes, authentication, and verbs.

:::note[Just getting started?]
Check out the [Quickstart Guide](/quickstart) for a step-by-step introduction.
:::


## Base URL

All API requests should be made to:

```
https://app.lumoauth.dev/api/v1
```

For tenant-specific operations (most Admin API endpoints), requests include the tenant slug:

```
https://app.lumoauth.dev/t/{tenant_slug}/api/v1/admin/...
```

### Example Request

```bash
curl https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json"
```

## Authentication

The LumoAuth API uses **Bearer token authentication**. Include your access token
in the `Authorization` header of all requests:

```
Authorization: Bearer sk_live_xxxxxxxxxxxxx
```

Access tokens can be obtained via OAuth 2.0 flows. For server-to-server integrations,
use the **Client Credentials** grant type.

[Learn more about authentication →](/api-reference/authentication)

### Authenticated Request

```bash
curl https://app.lumoauth.dev/api/v1/userinfo \
  -H "Authorization: Bearer sk_live_xxxxx"
```

## Core Concepts

### Tenants

LumoAuth is a **multi-tenant** identity platform. Each tenant represents an
isolated environment with its own users, applications, and configuration. Tenants are
identified by a unique `slug` (e.g., `acme-corp`).

### Users

Users are the identities that authenticate with your applications. Each user belongs to
exactly one tenant and can have roles, groups, and custom attributes assigned to them.

### Roles & Permissions

**Roles** are collections of permissions that can be assigned to users or groups.
**Permissions** define specific actions that can be performed on resources.

### Groups

Groups provide a way to organize users and assign roles collectively. When a user is added
to a group, they inherit all roles assigned to that group.

### OAuth Clients

OAuth clients represent applications that can authenticate users. Each client has its own
client ID, secret, and configuration for redirect URIs and allowed scopes.

### Resource Hierarchy

```
// Organization Structure
Tenant (acme-corp)
├── Users
│   ├── john@acme.com
│   └── jane@acme.com
├── Groups
│   ├── engineering
│   └── sales
├── Roles
│   ├── admin
│   └── viewer
├── OAuth Clients
│   ├── web-app
│   └── mobile-app
└── Policies
    └── resource-access
```

## API Categories

| Category | Description |
| --- | --- |
| [Users](/api-reference/users) | Create, retrieve, update, and delete users. Manage user roles and groups. |
| [Roles](/api-reference/roles) | Define roles and their associated permissions. |
| [Groups](/api-reference/groups) | Organize users into groups and manage group membership. |
| [OAuth Clients](/api-reference/oauth/clients) | Manage OAuth 2.0 applications and their credentials. |
| [Authorization (ABAC)](/api-reference/authorization) | Attribute-based access control for fine-grained authorization. |
| [AI Agents](/api-reference/agents) | Manage machine identities for AI/ML workloads. |
| [Webhooks](/api-reference/webhooks) | Configure webhook endpoints for real-time event notifications. |
| [Audit Logs](/api-reference/audit-logs) | Access detailed logs of all actions in your tenant. |

### Quick Links

```
# User Management
GET    /admin/users
POST   /admin/users
GET    /admin/users/:id
PATCH  /admin/users/:id
DELETE /admin/users/:id

# Authorization
POST   /abac/check
POST   /abac/policies

# OAuth 2.0
POST   /oauth/token
GET    /oauth/authorize
POST   /oauth/introspect
```

## Request & Response Format

All request bodies should be JSON-encoded with `Content-Type: application/json`.
Responses are always JSON with appropriate HTTP status codes.

### Successful Response

```json
{
  "data": {
    "id": "usr_01h9xk5...",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "User retrieved successfully"
}
```

### Error Response

```json
{
  "error": true,
  "message": "User not found",
  "status": 404,
  "details": {
    "user_id": "usr_invalid"
  }
}
```
