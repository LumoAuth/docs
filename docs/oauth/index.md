# OAuth 2.0 API

LumoAuth implements OAuth 2.0 and OpenID Connect for secure authentication and authorization. 
    These endpoints allow your applications to authenticate users, obtain tokens, and access protected resources.

## Available Endpoints

    
        **GET** 
        `/t/\{tenantSlug\}/api/v1/oauth/authorize`
    
    
Start the OAuth flow. Redirects users to authenticate and grant permissions.
        [View details →](/oauth/authorize)

    
        **POST** 
        `/t/\{tenantSlug\}/api/v1/oauth/token`
    
    
Exchange authorization codes for tokens, refresh tokens, or use client credentials.
        [View details →](/oauth/token)

    
        **POST** 
        `/t/\{tenantSlug\}/api/v1/oauth/introspect`
    
    
Validate tokens and retrieve their metadata. Per RFC 7662.
        [View details →](/oauth/introspect)

    
        **GET** 
        **POST** 
        `/t/\{tenantSlug\}/api/v1/oauth/userinfo`
    
    
Retrieve information about the authenticated user or agent.
        [View details →](/oauth/userinfo)

    
        **POST** 
        `/t/\{tenantSlug\}/api/v1/connect/register`
    
    
Dynamically register new OAuth clients. Per RFC 7591.
        [View details →](/oauth/register)

## Supported Grant Types

LumoAuth supports multiple OAuth 2.0 grant types to accommodate different application architectures:

| Grant Type | Description | Use Case |
| --- | --- | --- |
| `authorization_code` | User-interactive flow with redirects | Web apps, SPAs, mobile apps |
| `client_credentials` | Machine-to-machine authentication | Backend services, APIs, cron jobs |
| `refresh_token` | Obtain new access tokens | Maintaining long-lived sessions |
| `urn:ietf:params:oauth:grant-type:token-exchange` | Exchange tokens (RFC 8693) | Service-to-service delegation, impersonation |

## Tenant-Scoped URLs

All OAuth endpoints are scoped to a specific tenant using the `\{tenantSlug\}` path parameter. 
    This ensures complete isolation between tenants – users, clients, and tokens from one tenant 
    cannot be used in another.

:::note[What is a Tenant?]
A tenant represents an isolated environment in LumoAuth. Each tenant has its own
users, applications, roles, and configuration. Identified by a unique slug (e.g., `acme-corp`).
:::


## Authentication Methods

When calling the token endpoint, you can authenticate your client using:

### HTTP Basic Authentication (Recommended)

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "grant_type=client_credentials"
```

### Request Body Parameters

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

## Response Format

Successful token responses follow the OAuth 2.0 specification:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "scope": "openid profile email",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
