# Token Introspection

Validate tokens and retrieve their metadata. This endpoint implements RFC 7662 and allows 
    resource servers to verify tokens and check for revocation.

    
        **POST** 
        `/t/\{tenantSlug\}/api/v1/oauth/introspect`
    

## When to Use Introspection

Token introspection is useful in several scenarios:

| Scenario | Recommendation |
| --- | --- |
| Opaque tokens | **Required** – Opaque tokens can only be validated via introspection |
| JWT tokens (normal validation) | Not needed – Validate signature and expiration locally for better performance |
| JWT tokens (check revocation) | **Recommended** – Call introspection for sensitive operations |
| Getting token metadata | Use introspection when you need scopes, user ID, or other claims |

:::tip[Performance Tip]
For high-throughput applications, batch multiple permission checks into a single
request using the batch check endpoint to reduce network overhead.
:::


## Request

| Parameter | Required | Description |
| --- | --- | --- |
| `token` | Yes | The token to validate |
| `token_type_hint` | No | `access_token` or `refresh_token` – speeds up lookup |

:::warning[Authentication Required]
All API endpoints require Bearer token authentication unless otherwise noted.
:::


### Example Request

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/introspect \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d "token_type_hint=access_token"
```

## Response

### Active Token

```json
{
  "active": true,
  "scope": "openid profile email",
  "client_id": "abc123def456",
  "username": "john@example.com",
  "token_type": "Bearer",
  "exp": 1704067200,
  "iat": 1704063600,
  "sub": "12345",
  "aud": "api.example.com",
  "iss": "https://app.lumoauth.dev"
}
```

### Inactive/Invalid Token

If the token is expired, revoked, malformed, or doesn't exist, the response is simply:

```json
{
  "active": false
}
```

:::note[Security Note]
Only call the introspection endpoint from your backend server. Never expose
your client credentials or call this endpoint from client-side code.
:::


## Response Fields

| Field | Type | Description |
| --- | --- | --- |
| `active` | boolean | **Always present.** Whether the token is currently valid. |
| `scope` | string | Space-separated list of granted scopes |
| `client_id` | string | Which client the token was issued to |
| `sub` | string | Subject – user ID or agent ID |
| `exp` | integer | Expiration timestamp (Unix epoch seconds) |
| `iat` | integer | Issued-at timestamp |
| `iss` | string | Issuer URL |
| `aud` | string | Intended audience |
