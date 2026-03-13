# Resource Indicators (RFC 8707)

Explicitly signal which resource server(s) your application intends to access. Resource indicators 
    enable the authorization server to mint access tokens with proper audience restrictions, improving 
    security and enabling fine-grained access control.

:::note[Security Enhancement]
Resource indicators prevent token confusion attacks by binding access tokens
to specific resource servers, ensuring tokens can't be used at unintended APIs.
:::


## What is a Resource Indicator?

A resource indicator is an **absolute URI** that identifies a resource server:

```http
GET /t/acme-corp/api/v1/oauth/authorize
  ?response_type=code
  &client_id=your-client-id
  &redirect_uri=https://app.example.com/callback
  &scope=openid profile
  &resource=https://api.example.com
```

### Multiple Resources

Request access to multiple APIs by repeating the `resource` parameter:

```http
GET /t/acme-corp/api/v1/oauth/authorize
  ?response_type=code
  &client_id=your-client-id
  &redirect_uri=https://app.example.com/callback
  &scope=openid profile
  &resource=https://api1.example.com
  &resource=https://api2.example.com
  &resource=https://api3.example.com
```

### Validation

The authorization server validates each resource URI:

1. **Format validation** – Must be absolute URI without fragments
2. **Client authorization check** – Must be registered in client's allowed audience URIs
3. **Returns `invalid_target` error** if validation fails

:::warning[Client Registration Required]
Allowed resources must be configured on the OAuth client during registration.
Requesting an unregistered resource will result in an `invalid_target` error.
:::


## Token Endpoint

### Authorization Code Grant

When exchanging an authorization code for tokens, you can optionally specify a subset of the 
    originally authorized resources:

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "grant_type=authorization_code" \
  -d "code=AUTH_CODE" \
  -d "redirect_uri=https://app.example.com/callback" \
  -d "resource=https://api.example.com"
```

:::tip[Token Downscoping]
Resource indicators allow you to request tokens scoped to specific services,
reducing the blast radius if a token is compromised.
:::


### Refresh Token Grant

Refresh tokens are bound to the full set of resources from the original authorization. When using 
    a refresh token, you can request a subset:

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=REFRESH_TOKEN" \
  -d "resource=https://api1.example.com"
```

**Example workflow:**

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "grant_type=client_credentials" \
  -d "scope=api.read api.write" \
  -d "resource=https://api.example.com"
```

### Device Code Grant

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:device_code" \
  -d "device_code=DEVICE_CODE" \
  -d "resource=https://api.example.com"
```

### Token Exchange Grant (RFC 8693)

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:token-exchange" \
  -d "subject_token=SUBJECT_TOKEN" \
  -d "subject_token_type=urn:ietf:params:oauth:token-type:access_token" \
  -d "resource=https://api.example.com"
```

## JWT Audience Claim

When resource indicators are present, the JWT access token's `aud` claim reflects 
    the target resource(s):

### Single Resource

```json
{
  "iss": "https://app.lumoauth.dev",
  "sub": "user_123",
  "aud": "https://api.example.com",
  "exp": 1706817600,
  "iat": 1706814000,
  "client_id": "mobile_app",
  "scope": "openid profile"
}
```

### Multiple Resources

```json
{
  "iss": "https://app.lumoauth.dev",
  "sub": "user_123",
  "aud": [
    "https://api1.example.com",
    "https://api2.example.com",
    "https://api3.example.com"
  ],
  "exp": 1706817600,
  "iat": 1706814000,
  "client_id": "mobile_app",
  "scope": "openid profile"
}
```

### No Resources (Default)

```json
{
  "iss": "https://app.lumoauth.dev",
  "sub": "user_123",
  "aud": "mobile_app",
  "exp": 1706817600,
  "iat": 1706814000,
  "client_id": "mobile_app",
  "scope": "openid profile"
}
```

Without resource indicators, the `aud` defaults to the `client_id`.

## Pushed Authorization Request (PAR)

Resource indicators can be included in PAR requests (RFC 9126):

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/par \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "response_type=code" \
  -d "redirect_uri=https://app.example.com/callback" \
  -d "scope=openid profile" \
  -d "resource=https://api.example.com" \
  -d "resource=https://api2.example.com"
```

Resources are validated at PAR time and stored with the request. When using the returned 
    `request_uri`, the authorization endpoint automatically loads the resources.

## Token Introspection

The introspection endpoint returns the `aud` claim for resource-constrained tokens:

### Single Resource

```json
{
  "active": true,
  "scope": "openid profile",
  "client_id": "mobile_app",
  "aud": "https://api.example.com",
  "exp": 1706817600,
  "sub": "user_123"
}
```

### Multiple Resources

```json
{
  "active": true,
  "scope": "openid profile",
  "client_id": "mobile_app",
  "aud": [
    "https://api.example.com",
    "https://api2.example.com"
  ],
  "exp": 1706817600,
  "sub": "user_123"
}
```

## Resource Server Validation

:::warning[Critical Security Requirement]
Resource servers must validate the `aud` claim in access tokens matches
their own resource URI. Accepting tokens with incorrect audiences is a security vulnerability.
:::


### Example Validation (PHP)

```php
$jwt = decode($accessToken);
$expectedAudience = 'https://api.example.com';

if (is_string($jwt['aud'])) {
    if ($jwt['aud'] !== $expectedAudience) {
        throw new InvalidAudienceException();
    }
} elseif (is_array($jwt['aud'])) {
    if (!in_array($expectedAudience, $jwt['aud'])) {
        throw new InvalidAudienceException();
    }
} else {
    throw new InvalidAudienceException();
}
```

### Example Validation (Node.js)

```javascript
const jwt = decode(accessToken);
const expectedAudience = 'https://api.example.com';

const audiences = Array.isArray(jwt.aud) ? jwt.aud : [jwt.aud];

if (!audiences.includes(expectedAudience)) {
    throw new Error('Invalid audience');
}
```

## Client Configuration

### Tenant Portal

1. Navigate to **Applications**
2. Select your application
3. Go to **Configuration** tab
4. Scroll to **Resource Indicators / Audience URIs**
5. Add your allowed resource URIs (one per line)

### Dynamic Client Registration

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oidc/register \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "My Application",
    "redirect_uris": ["https://app.example.com/callback"],
    "grant_types": ["authorization_code", "refresh_token"],
    "audience_uris": [
      "https://api.example.com",
      "https://api2.example.com"
    ]
  }'
```

### Validation Modes

| Mode | Description | Example |
| --- | --- | --- |
| **Exact Match** | Resource must exactly match a registered URI | Registered: `https://api.example.com`                  ✓ Valid: `https://api.example.com`                  ✗ Invalid: `https://api.example.com/v2` |
| **Prefix Match** | Resource can be a path under a registered URI | Registered: `https://api.example.com`                  ✓ Valid: `https://api.example.com`                  ✓ Valid: `https://api.example.com/v2`                  ✓ Valid: `https://api.example.com/path/to/resource`                  ✗ Invalid: `https://api2.example.com` |

## Error Responses

### invalid_target Error

A new error code `invalid_target` is returned when:

- Resource URI is malformed
- Resource is not registered for the client
- Requested resources are not a subset of granted resources

```json
{
  "error": "invalid_target",
  "error_description": "Resource URI must be an absolute URI without fragment"
}
```

```json
{
  "error": "invalid_target",
  "error_description": "Resource 'https://api.example.com' is not registered for this client"
}
```

```json
{
  "error": "invalid_target",
  "error_description": "Requested resources must be a subset of granted resources"
}
```

## Discovery Metadata

The OIDC discovery document advertises RFC 8707 support:

```bash
curl https://app.lumoauth.dev/.well-known/openid-configuration
```

```json
{
  "issuer": "https://app.lumoauth.dev/t/acme",
  "authorization_endpoint": "...",
  "token_endpoint": "...",
  "resource_indicators_supported": true,
  ...
}
```

## Security Benefits

### Token Replay Prevention

Without resource indicators, a token stolen from one API can be replayed to access other APIs. 
    With resource indicators:

- Each token is bound to specific resource server(s) via `aud` claim
- Resource servers validate audience before accepting tokens
- Compromised API cannot use stolen tokens elsewhere

### Least Privilege

Request broad authorization once, then obtain narrow tokens for each API:

    
        text
    
    
```
User authorizes: [billing-api, users-api, analytics-api]

Token 1 (for billing): aud = "https://billing-api.example.com"
Token 2 (for users):  aud = "https://users-api.example.com"
Token 3 (for analytics): aud = "https://analytics-api.example.com"
```

### Centralized Governance

The authorization server controls which clients can access which resources:

- Pre-register allowed audience URIs per client
- Prevents unauthorized cross-API access
- Centralized audit trail

## Best Practices

| Practice | Recommendation |
| --- | --- |
| **Use HTTPS** | Always use `https://` URIs in production |
| **Validate audience** | Resource servers MUST check `aud` claim on every request |
| **Request minimal resources** | Only request access to APIs you need for current operation |
| **Use token downscoping** | Authorize broadly, request narrowly at token endpoint |
| **Register URIs carefully** | Only register legitimate resource servers in client config |

## References

- [RFC 8707: Resource Indicators for OAuth 2.0](https://www.rfc-editor.org/rfc/rfc8707)
- [RFC 9068: JWT Profile for OAuth 2.0 Access Tokens](https://www.rfc-editor.org/rfc/rfc9068)
- [RFC 7662: OAuth 2.0 Token Introspection](https://www.rfc-editor.org/rfc/rfc7662)
- [RFC 9126: OAuth 2.0 Pushed Authorization Requests](https://www.rfc-editor.org/rfc/rfc9126)
