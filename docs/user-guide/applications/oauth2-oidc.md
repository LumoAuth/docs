# OAuth 2.0 & OpenID Connect

LumoAuth implements OAuth 2.0 and OpenID Connect (OIDC) as its core authorization and authentication framework. This guide covers grant types, token management, OIDC features, and advanced protocol extensions.

---

## Supported Grant Types

| Grant Type | Use Case | RFC |
|------------|----------|-----|
| **Authorization Code** | Web apps, SPAs (with PKCE) | RFC 6749 |
| **Authorization Code + PKCE** | Public clients (SPAs, mobile) | RFC 7636 |
| **Client Credentials** | Machine-to-machine | RFC 6749 |
| **Refresh Token** | Renew expired access tokens | RFC 6749 |
| **Device Authorization** | CLI tools, smart TVs, IoT | RFC 8628 |
| **CIBA** | Decoupled authentication (call center, POS) | OIDC CIBA |

---

## Authorization Code Flow

The most common flow for web applications:

```
1. App redirects user to:
   /t/{tenantSlug}/api/v1/oauth/authorize
     ?response_type=code
     &client_id=YOUR_CLIENT_ID
     &redirect_uri=https://your-app.com/callback
     &scope=openid profile email
     &state=random_state

2. User authenticates (login page)

3. LumoAuth redirects back with authorization code:
   https://your-app.com/callback?code=AUTH_CODE&state=random_state

4. App exchanges code for tokens:
   POST /t/{tenantSlug}/api/v1/oauth/token
     grant_type=authorization_code
     &code=AUTH_CODE
     &redirect_uri=https://your-app.com/callback
     &client_id=YOUR_CLIENT_ID
     &client_secret=YOUR_CLIENT_SECRET
```

### With PKCE (for Public Clients)

Add PKCE parameters for SPAs and mobile apps:

```
Step 1: Generate code_verifier and code_challenge

Step 2: Include in authorization request:
  &code_challenge=CHALLENGE
  &code_challenge_method=S256

Step 3: Include in token request:
  &code_verifier=VERIFIER
```

---

## Client Credentials Flow

For machine-to-machine authentication (no user involved):

```bash
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/oauth/token \
  -d grant_type=client_credentials \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d scope="api:read api:write"
```

---

## Refresh Token Flow

Exchange a refresh token for a new access token:

```bash
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/oauth/token \
  -d grant_type=refresh_token \
  -d refresh_token=YOUR_REFRESH_TOKEN \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET
```

---

## OIDC Features

### Discovery

Every tenant exposes an OIDC discovery document:

```
GET /t/{tenantSlug}/.well-known/openid-configuration
```

Returns endpoints, supported scopes, signing algorithms, and more.

### ID Tokens

ID tokens are JWTs containing user identity claims:

```json
{
  "iss": "https://your-domain.com/t/acme-corp",
  "sub": "user-uuid",
  "aud": "client-id",
  "exp": 1706403600,
  "iat": 1706400000,
  "nonce": "random-nonce",
  "email": "alice@acme.com",
  "name": "Alice Smith",
  "email_verified": true
}
```

### UserInfo Endpoint

```bash
curl https://your-domain.com/t/{tenantSlug}/api/v1/oauth/userinfo \
  -H "Authorization: Bearer {access_token}"
```

### Standard Scopes

| Scope | Claims Included |
|-------|----------------|
| `openid` | `sub` |
| `profile` | `name`, `given_name`, `family_name`, `picture` |
| `email` | `email`, `email_verified` |
| `phone` | `phone_number`, `phone_number_verified` |
| `roles` | `roles` array |
| `permissions` | `permissions` array |

### JWKS Endpoint

Public keys for token verification:

```
GET /t/{tenantSlug}/.well-known/jwks.json
```

---

## Advanced Protocol Extensions

### DPoP (Demonstration of Proof-of-Possession) - RFC 9449

DPoP binds access tokens to the client's cryptographic key, preventing token theft:

```bash
# Include DPoP proof header in token request
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/oauth/token \
  -H "DPoP: eyJ..." \
  -d grant_type=authorization_code \
  -d code=AUTH_CODE \
  -d client_id=YOUR_CLIENT_ID
```

The resulting token is bound to the DPoP key and can only be used with a matching DPoP proof.

### PAR (Pushed Authorization Requests) - RFC 9126

Push authorization parameters to the server before redirecting the user:

```bash
# Push authorization request
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/oauth/par \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d response_type=code \
  -d redirect_uri=https://your-app.com/callback \
  -d scope="openid profile"

# Response: {"request_uri": "urn:ietf:params:oauth:request_uri:...", "expires_in": 60}

# Redirect user with the request_uri
/t/{tenantSlug}/api/v1/oauth/authorize?client_id=YOUR_CLIENT_ID&request_uri=urn:ietf:params:oauth:request_uri:...
```

### RAR (Rich Authorization Requests) - RFC 9396

Request fine-grained authorization with structured details:

```json
{
  "authorization_details": [
    {
      "type": "payment_initiation",
      "instructedAmount": {"currency": "EUR", "amount": "123.50"},
      "creditorName": "Merchant Inc.",
      "creditorAccount": {"iban": "DE02..."}
    }
  ]
}
```

### Dynamic Client Registration - RFC 7591

Register OAuth clients programmatically:

```bash
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/oauth/register \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "My App",
    "redirect_uris": ["https://my-app.com/callback"],
    "grant_types": ["authorization_code"],
    "response_types": ["code"],
    "token_endpoint_auth_method": "client_secret_post"
  }'
```

### CIBA (Client-Initiated Backchannel Authentication)

Initiate authentication from a backend service:

```bash
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/oauth/bc-authorize \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d scope="openid" \
  -d login_hint="alice@acme.com" \
  -d binding_message="Approve login from call center"
```

The user receives a push notification or out-of-band prompt to approve.

---

## Token Formats

| Token | Format | Description |
|-------|--------|-------------|
| **Access Token** | JWT (RFC 9068) | Contains claims, verifiable without server call |
| **Refresh Token** | Opaque | Must be exchanged at the token endpoint |
| **ID Token** | JWT | OIDC identity claims |
| **Authorization Code** | Opaque | Short-lived, single-use |

---

## Token Revocation

Revoke tokens that are no longer needed:

```bash
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/oauth/revoke \
  -d token=TOKEN_TO_REVOKE \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET
```

---

## Related Guides

- [Applications Overview](overview.md) - Register and manage applications
- [Device Flow](../authentication/device-flow.md) - Device Authorization grant
- [Signing Keys](signing-keys.md) - JWT signing key management
- [SAML Applications](saml.md) - SAML 2.0 integration
