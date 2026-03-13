# FAPI 2.0 Security Profile

Enterprise-grade security for financial APIs, healthcare systems, and high-security applications.
    FAPI 2.0 adds extra protections on top of standard OAuth 2.0.

:::note[When to Use FAPI 2.0]
Use FAPI 2.0 for financial-grade APIs, open banking integrations, and any
application requiring the highest level of OAuth security.
:::


## What is FAPI 2.0?

**FAPI** stands for **Financial-grade API Security Profile**. 
    Think of it as *OAuth 2.0 with extra locks on the doors*. While regular OAuth is secure 
    for most applications, FAPI 2.0 adds additional protections against sophisticated attacks:

| Attack Type | FAPI Protection |
| --- | --- |
| **Token Theft** – Attacker steals access tokens | DPoP binds tokens to client keys – stolen tokens can't be reused |
| **Request Tampering** – Modifying auth requests | PAR sends requests through secure backend channel |
| **Replay Attacks** – Reusing old authentication data | Nonces and short-lived codes (60 seconds) prevent replay |
| **Code Interception** – Capturing authorization codes | PKCE S256 ensures only original client can use codes |

## Key Features

| Feature | What It Does |
| --- | --- |
| **PAR** (Pushed Authorization Requests) | Send auth parameters through a secure backend channel before redirecting the user |
| **DPoP** (Demonstrating Proof of Possession) | Cryptographically bind tokens to a client's key – prevents token theft |
| **MTLS** (Mutual TLS) | Client authenticates with a certificate for server-to-server communication |
| **private_key_jwt** | Sign authentication requests with a private key instead of using secrets |
| **Short Auth Codes** | Authorization codes expire in 60 seconds (vs. 10 minutes in standard OAuth) |

## How to Enable FAPI 2.0

Configure FAPI 2.0 settings in the Tenant Portal:

1. Navigate to **OAuth Clients** → Select your application
2. Click the **FAPI 2.0** tab
3. Choose a **Security Profile**:

| Profile | Security Level | Use Case |
| --- | --- | --- |
| `Disabled` | Standard OAuth | Regular web/mobile apps |
| `FAPI 2.0 Baseline` | High | Open Banking, PSD2 |
| `FAPI 2.0 Advanced` | Maximum | High-value financial services |

## PAR: Pushed Authorization Requests

Instead of putting all authorization parameters in the URL (where they could be seen or modified), 
    PAR lets you **push the request first** and get back a short reference to use.

    
        **POST** 
        `/t/\{tenantSlug\}/api/v1/oauth/par`
    

### Step 1: Push the Authorization Request

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/par \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "response_type=code" \
  -d "redirect_uri=https://myapp.com/callback" \
  -d "scope=openid profile email" \
  -d "code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM" \
  -d "code_challenge_method=S256"
```

### Response

```json
{
  "request_uri": "urn:ietf:params:oauth:request_uri:abc123xyz...",
  "expires_in": 600
}
```

### Step 2: Redirect with request_uri

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -H "DPoP: eyJhbGciOiJFUzI1NiIsInR5cCI6ImRwb3Arand0IiwiandrIjp7Li4ufX0..." \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_AUTH_CODE" \
  -d "code_verifier=YOUR_CODE_VERIFIER"
```

### Response with DPoP Token

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6...",
  "token_type": "DPoP",
  "expires_in": 3600,
  "scope": "openid profile email"
}
```

:::warning[token_type is "DPoP", not "Bearer"]
When using FAPI with DPoP, the token response returns `token_type: "DPoP"`
instead of `"Bearer"`. Use the DPoP proof mechanism when presenting the token.
:::


### DPoP Proof Structure

The DPoP proof is a JWT with these required fields:

| Field | Location | Description |
| --- | --- | --- |
| `typ` | Header | Must be `dpop+jwt` |
| `alg` | Header | Algorithm: `ES256`, `RS256`, or `PS256` |
| `jwk` | Header | Your public key (never include private key!) |
| `htm` | Payload | HTTP method (`POST`, `GET`) |
| `htu` | Payload | Full URL of the request |
| `iat` | Payload | Current timestamp (must be within 60 seconds) |
| `jti` | Payload | Unique identifier (at least 16 characters) |
| `ath` | Payload | Access token hash (only for resource requests) |

## Client Authentication Methods

FAPI 2.0 recommends stronger authentication methods than client secrets. 
    Configure your preferred method in the **FAPI 2.0** tab.

| Method | Security | How It Works |
| --- | --- | --- |
| `client_secret_basic` | Low | Password in HTTP Authorization header |
| `client_secret_post` | Low | Password in POST body |
| `private_key_jwt` | High ✓ | Sign a JWT with your private key |
| `tls_client_auth` | High ✓ | TLS certificate authentication |

### private_key_jwt Example

Instead of sending a client_secret, you create a signed JWT assertion:

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_AUTH_CODE" \
  -d "client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer" \
  -d "client_assertion=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

The client assertion must contain:

| Claim | Value |
| --- | --- |
| `iss` | Your client_id |
| `sub` | Your client_id (same as iss) |
| `aud` | Authorization server issuer URL |
| `exp` | Expiration (short – 60 seconds recommended) |
| `jti` | Unique identifier |

## Discovery Document

FAPI 2.0 capabilities are advertised in the OpenID Connect discovery document:

    
        **GET** 
        `/t/\{tenantSlug\}/api/v1/.well-known/openid-configuration`
    

```json
{
  "pushed_authorization_request_endpoint": "https://.../oauth/par",
  "require_pushed_authorization_requests": false,
  "dpop_signing_alg_values_supported": ["ES256", "RS256", "PS256"],
  "token_endpoint_auth_methods_supported": [
    "client_secret_basic",
    "private_key_jwt",
    "tls_client_auth"
  ],
  "authorization_response_iss_parameter_supported": true,
  "tls_client_certificate_bound_access_tokens": true
}
```

## Error Responses

| Error | Cause | Solution |
| --- | --- | --- |
| `invalid_request` + "PAR required" | Client has PAR enabled but didn't use it | Push request to /oauth/par first |
| `invalid_dpop_proof` | DPoP proof is malformed or expired | Check JWT format, timestamps, and signing |
| `use_dpop_nonce` | Server requires a nonce | Include the nonce from DPoP-Nonce header |
| `invalid_client` | private_key_jwt signature failed | Verify JWKS is published and keys match |

## Glossary

| Term | Meaning |
| --- | --- |
| **PAR** | Pushed Authorization Request – secure way to initiate OAuth flows |
| **DPoP** | Demonstrating Proof of Possession – binds tokens to client keys |
| **MTLS** | Mutual TLS – two-way certificate authentication |
| **JWK** | JSON Web Key – format for cryptographic keys |
| **JWKS** | JSON Web Key Set – collection of JWKs |
| **JKT** | JWK Thumbprint – hash of a public key for identification |
| **PKCE** | Proof Key for Code Exchange – protects authorization codes |

## Reference Specifications

- [FAPI 2.0 Security Profile](https://openid.net/specs/fapi-2_0-security-profile.html)
- [RFC 9126: Pushed Authorization Requests](https://datatracker.ietf.org/doc/html/rfc9126)
- [RFC 9449: DPoP](https://datatracker.ietf.org/doc/html/rfc9449)
- [RFC 8705: MTLS Token Binding](https://datatracker.ietf.org/doc/html/rfc8705)
- [RFC 7636: PKCE](https://datatracker.ietf.org/doc/html/rfc7636)
