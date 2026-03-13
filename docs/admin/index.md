# Tenant Admin API

Comprehensive programmatic access to all tenant administration functionality. 
    Automate user management, access control, OAuth client configuration, and more.

:::warning[Administrative Access Required]
You need a valid access token with admin privileges to use these endpoints.
Generate one via the OAuth Client Credentials flow.
:::


## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Base URL Structure](#base-url-structure)
- [Common Patterns](#common-patterns)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [API Reference](#api-reference)
  - [Users](#users)
  - [Roles](#roles)
  - [Groups](#groups)
  - [OAuth Clients](#oauth-clients)
  - [Webhooks](#webhooks)
  - [Audit Logs](#audit-logs)
  - [Social Providers](#social-providers)
  - [AI Agents](#ai-agents)
  - [Permissions & Scopes](#permissions--scopes)
  - [Settings](#settings)
  - [Analytics](#analytics)
  - [Sessions & Tokens](#sessions--tokens)
- [Quick Examples](#quick-examples)

## Getting Started

### Prerequisites

1. A LumoAuth tenant (identified by a slug, e.g., `acme-corp`)
2. An admin user with appropriate permissions
3. An access token obtained via OAuth 2.0

### Quick Start

    
```bash
# 1. Obtain an access token
curl -X POST 'https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password&username=admin@acme.com&password=secret&client_id=admin-cli'

# 2. Use the token to list users
curl 'https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users' \
  -H 'Authorization: Bearer '
```

## Authentication

All Admin API endpoints require authentication via API Key in the `X-API-Key` header.

    
```
X-API-Key: your_api_key_here
```

### Creating an API Key

1. Navigate to your tenant portal at `/t/{tenant-slug}/portal/settings/api-keys`
2. Click "Generate New API Key"
3. Select the appropriate scopes for your use case
4. Copy and securely store the generated API key

:::warning[Secure Your API Keys]
Store your client secrets and access tokens securely. Never commit them to source
control or expose them in client-side code.
:::


### Required Permissions

To access the Admin API, the authenticated user must:

1. Belong to the tenant being accessed
2. Have admin privileges (`isAdmin: true`) OR have appropriate admin permissions

## Base URL Structure

All Admin API endpoints follow this pattern:

    
```
/t/{tenantSlug}/api/v1/admin/{resource}
```

Where:

- `\{tenantSlug\}` is the unique identifier for your tenant
- `\{resource\}` is the resource type (users, roles, clients, etc.)

### Example Environments

| Environment | Base URL |
| --- | --- |
| Production | `https://app.lumoauth.dev/t/\{tenantSlug\}/api/v1/admin` |
| Staging | `https://api.staging.lumoauth.com/t/\{tenantSlug\}/api/v1/admin` |
| Local Dev | `http://localhost:8000/t/\{tenantSlug\}/api/v1/admin` |

## Common Patterns

### Pagination

All list endpoints support pagination:

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | integer | 1 | Page number (1-indexed) |
| `limit` | integer | 25 | Items per page (max: 100) |

**Response Format:**

    
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 25,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Filtering

Many endpoints support filtering via query parameters:

    
```bash
# Filter users by role and active status
GET /admin/users?role=admin&active=true

# Search across fields
GET /admin/users?search=john
```

### Sorting

List endpoints typically support sorting:

    
```bash
GET /admin/users?sortBy=createdAt&sortDir=DESC
```

### ID Lookup

Many endpoints accept either:

- Integer ID: `/admin/users/123`
- UUID: `/admin/users/01234567-89ab-cdef-0123-456789abcdef`
- Slug: `/admin/roles/admin`
- Email (for users): `/admin/users/john@example.com`

## Error Handling

All errors follow a consistent format:

    
```json
{
  "error": true,
  "message": "Human-readable error description",
  "status": 400,
  "details": {
    "missing_fields": ["email"],
    "invalid_values": {
      "status": "Must be one of: active, inactive, suspended"
    }
  }
}
```

### Common HTTP Status Codes

| Code | Description |
| --- | --- |
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Missing or invalid token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Resource already exists |
| `422` | Unprocessable Entity - Validation failed |
| `429` | Too Many Requests - Rate limited |
| `500` | Internal Server Error |

## Rate Limiting

The Admin API is rate limited to prevent abuse. Rate limit information is included in response headers:

| Header | Description |
| --- | --- |
| `X-RateLimit-Limit` | Maximum requests per window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when window resets |

When rate limited, you'll receive a `429 Too Many Requests` response.

## API Reference

## Available Resources

| Resource | Endpoint | Description |
| --- | --- | --- |
| **Users** | `/admin/users` | Create, update, search users. Reset passwords, manage MFA, block/unblock accounts |
| **Roles** | `/admin/roles` | Define and manage roles. Assign permissions, view role members |
| **Groups** | `/admin/groups` | Organize users into groups. Assign roles, manage memberships |
| **Permissions** | `/admin/permissions` | Create custom permissions and scopes for fine-grained access control |
| **OAuth Clients** | `/admin/clients` | Register OAuth 2.0 clients, configure grants and redirects, rotate secrets |
| **Webhooks** | `/admin/webhooks` | Subscribe to events, test endpoints, manage webhook secrets |
| **Social Providers** | `/admin/social-providers` | Configure social login (Google, GitHub, etc.) with client credentials |
| **AI Agents** | `/admin/agents` | Register AI agents, generate tokens, manage agent lifecycle |
| **Audit Logs** | `/admin/audit-logs` | Query audit events, export logs, view statistics |
| **Sessions** | `/admin/sessions` | View active sessions, revoke tokens, manage user sessions |
| **Settings** | `/admin/settings` | Configure tenant, authentication, branding, AI, and SCIM settings |
| **Analytics** | `/admin/analytics` | Dashboard metrics, login trends, user activity statistics |

### Users

Manage users within your tenant.

#### List Users

    
```
GET /admin/users
```

#### Create User

    
```http
POST /admin/users
Content-Type: application/json

{
  "email": "newuser@example.com",
  "username": "newuser",
  "name": "New User",
  "password": "SecurePassword123!",
  "isActive": true,
  "emailVerified": false,
  "roles": ["user", "editor"],
  "groups": ["engineering"]
}
```

#### Update User

    
```http
PUT /admin/users/{userId}
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": true,
  "emailVerified": true
}
```

#### Block/Unblock User

    
```
POST /admin/users/{userId}/block
POST /admin/users/{userId}/unblock
```

#### Set User Password

    
```http
PUT /admin/users/{userId}/password
Content-Type: application/json

{
  "password": "NewSecurePassword123!"
}
```

### Roles

Manage roles and their permissions.

#### Create Role

    
```http
POST /admin/roles
Content-Type: application/json

{
  "name": "Content Manager",
  "slug": "content-manager",
  "description": "Can manage content and publications",
  "permissions": ["content.read", "content.write", "content.publish"]
}
```

### Groups

Manage user groups.

#### Create Group

    
```http
POST /admin/groups
Content-Type: application/json

{
  "name": "Engineering Team",
  "slug": "engineering",
  "description": "All engineering staff",
  "roles": ["developer"]
}
```

### OAuth Clients

Manage OAuth 2.0 clients for your applications.

#### Create Client

    
```http
POST /admin/clients
Content-Type: application/json

{
  "name": "Mobile App",
  "redirectUris": [
    "myapp://callback",
    "https://myapp.example.com/callback"
  ],
  "allowedScopes": ["openid", "profile", "email", "offline_access"],
  "grantTypes": ["authorization_code", "refresh_token"],
  "isConfidential": false,
  "requiresPkce": true,
  "isActive": true
}
```

**Response:**

    
```json
{
  "data": {
    "id": 42,
    "clientId": "app_mobile_abc123",
    "secret": "secret_xyz789",
    "name": "Mobile App",
    "_note": "Store the secret securely. It will not be shown again."
  },
  "message": "OAuth client created successfully"
}
```

:::warning
:::


#### Rotate Client Secret

    
```
POST /admin/clients/{clientId}/rotate-secret
```

Generates a new client secret, immediately invalidating the old one.

    
```json
{
  "data": {
    "clientId": "app_mobile_abc123",
    "secret": "new_secret_def456",
    "_note": "Store the new secret securely. It will not be shown again."
  },
  "message": "Client secret rotated successfully"
}
```

### Webhooks

Configure webhooks to receive real-time event notifications.

#### List Available Events

    
```
GET /admin/webhooks/events
```

#### Create Webhook

    
```http
POST /admin/webhooks
Content-Type: application/json

{
  "url": "https://api.example.com/webhooks/lumoauth",
  "events": ["user.created", "user.login", "user.login.failed"],
  "type": "custom",
  "isActive": true
}
```

#### Test Webhook

    
```
POST /admin/webhooks/{webhookId}/test
```

#### Rotate Webhook Secret

    
```
POST /admin/webhooks/{webhookId}/rotate-secret
```

Generates a new webhook secret for signature verification.

    
```json
{
  "data": {
    "webhookId": 42,
    "secret": "whsec_new789xyz",
    "_note": "Store the new secret securely. It will not be shown again."
  },
  "message": "Webhook secret rotated successfully"
}
```

### Audit Logs

Access and export audit logs for compliance and monitoring.

#### List Audit Logs

    
```
GET /admin/audit-logs
```

#### Export Audit Logs

    
```
GET /admin/audit-logs/export?format=csv&from=2024-01-01T00:00:00Z&to=2024-01-31T23:59:59Z
```

Formats: `csv` (default), `json`. Export is limited to 10,000 records per request.

### Social Providers

Configure social login providers (Google, GitHub, Microsoft, etc.).

### AI Agents

Manage AI/machine agents for programmatic access.

### Permissions & Scopes

Manage custom permissions and OAuth scopes.

### Settings

Configure tenant-wide settings including authentication, branding, and more.

### Analytics

Access analytics and dashboard data.

### Sessions & Tokens

Manage active sessions and access tokens.

## Quick Examples

### Create a Complete User with Roles and Groups

    
```bash
curl -X POST "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@acme.com",
    "name": "Jane Developer",
    "password": "SecureP@ssword123",
    "roles": ["developer", "user"],
    "groups": ["engineering"],
    "emailVerified": true,
    "isActive": true
  }'
```

### Set Up a New OAuth Client

    
```bash
# Create the client
CLIENT=$(curl -X POST "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/clients" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Web App",
    "redirectUris": ["https://app.acme.com/callback"],
    "allowedScopes": ["openid", "profile", "email", "offline_access"],
    "grantTypes": ["authorization_code", "refresh_token"],
    "isConfidential": true,
    "requiresPkce": true
  }')

# Extract and save the credentials
echo $CLIENT | jq -r '.data.clientId' > client_id.txt
echo $CLIENT | jq -r '.data.secret' > client_secret.txt  # Store securely!
```

### Configure Webhooks for User Events

    
```bash
# Create webhook
curl -X POST "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/webhooks" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.acme.com/webhooks/auth",
    "events": ["user.created", "user.updated", "user.deleted", "user.login"],
    "isActive": true
  }'

# Test the webhook
curl -X POST "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/webhooks/1/test" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

:::note[Complete API Reference]
For the full interactive OpenAPI specification with all endpoints, request/response
schemas, and example payloads, see the [API Specification](/admin/spec) page.
:::

