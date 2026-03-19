# Dynamic Client Registration

Programmatically register new OAuth clients. This endpoint implements RFC 7591 and allows 
    automated onboarding of applications.

    
        **POST** 
        `/t/\{tenantSlug\}/api/v1/connect/register`
    

:::warning[Configuration Required]
Dynamic Client Registration must be enabled in your tenant settings before
clients can self-register. Contact your tenant administrator.
:::


## When to Use This

Dynamic registration is useful for:

- **Marketplaces:** Third-party apps can register themselves
- **CI/CD:** Automatically provision clients during deployment
- **Mobile apps:** Register unique clients per device
- **Multi-tenant platforms:** Create clients programmatically

## Request

| Parameter | Required | Description |
| --- | --- | --- |
| `client_name` | No | Human-readable name for the application |
| `redirect_uris` | Yes | Array of allowed redirect URIs |
| `grant_types` | No | Array of grant types (default: `["authorization_code"]`) |
| `response_types` | No | Array of response types (default: `["code"]`) |
| `scope` | No | Space-separated list of requested scopes |
| `token_endpoint_auth_method` | No | `client_secret_basic`, `client_secret_post`, or `none` |

### Example Request

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/connect/register \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "My Mobile App",
    "redirect_uris": [
      "myapp://callback",
      "https://myapp.com/oauth/callback"
    ],
    "grant_types": ["authorization_code", "refresh_token"],
    "scope": "openid profile email"
  }'
```

## Response

```json
{
  "client_id": "dyn_abc123def456",
  "client_secret": "cs_live_xxxxxxxxxxxxxxxxxxxxxxxx",
  "client_id_issued_at": 1704063600,
  "client_secret_expires_at": 0,
  "client_name": "My Mobile App",
  "redirect_uris": [
    "myapp://callback",
    "https://myapp.com/oauth/callback"
  ],
  "grant_types": ["authorization_code", "refresh_token"],
  "response_types": ["code"],
  "scope": "openid profile email",
  "token_endpoint_auth_method": "client_secret_basic"
}
```

:::note[Store Your Secret]
The `client_secret` is only returned once during registration. Store it
securely - it cannot be retrieved later.
:::


## Response Fields

| Field | Description |
| --- | --- |
| `client_id` | The unique identifier for the new client |
| `client_secret` | The secret for confidential clients (null for public clients) |
| `client_id_issued_at` | Unix timestamp when the client was created |
| `client_secret_expires_at` | When the secret expires (0 = never) |
