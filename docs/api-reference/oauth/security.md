# OAuth 2.0 Security Considerations

                
Comprehensive security implementation based on RFC 6819 threat model.

            
        

        
This document describes the security measures implemented in LumoAuth to protect against
            threats identified in [RFC 6819](https://www.rfc-editor.org/rfc/rfc6819)
            (OAuth 2.0 Threat Model and Security Considerations) and 
            [OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics).
            Understanding these protections helps you build secure applications using LumoAuth.

        
            
**Standards Compliance:** LumoAuth implements security measures from RFC 6749 (OAuth 2.0), 
            RFC 6819 (Security Considerations), RFC 7009 (Token Revocation), RFC 7636 (PKCE), OAuth 2.0 Security BCP, and FAPI 2.0 Security Profile.

        
    
    
        
            Security Features Summary
            
                
                    text
                
                
```
✓ TLS 1.2+ Required
✓ PKCE Mandatory (OAuth 2.1)
✓ Authorization Code Reuse Detection
✓ Refresh Token Rotation
✓ Short-Lived Access Tokens
✓ Client Authentication
✓ CSRF Protection (state parameter)
✓ Clickjacking Protection (X-Frame-Options)
✓ Rate Limiting
✓ Audit Logging
```

            
        
    

    
    

    
        ## OAuth 2.0 Security Best Current Practice

        
LumoAuth implements security best practices from the OAuth 2.0 Security Best Current Practice 
            specification (draft-ietf-oauth-security-topics), which updates and extends RFC 6819 with 
            modern threat mitigations and deployment patterns.

        ### Key BCP Requirements Implemented

        
        
| Requirement (BCP Section) | Implementation | Status |
| --- | --- | --- |
| §2.1 Exact Redirect URI Matching | Strict string comparison, no wildcards | ✓ Implemented |
| §2.1 No Open Redirectors | Clients & AS don't expose open redirects | ✓ Implemented |
| §2.1 CSRF Protection | State parameter or PKCE validation | ✓ Implemented |
| §2.1 Mix-Up Defense | iss parameter in authorization response | ✓ Implemented |
| §2.1.1 PKCE for Public Clients | Mandatory PKCE for public clients | ✓ Implemented |
| §2.1.1 S256 PKCE Method | S256 required for public clients | ✓ Implemented |
| §2.1.1 Authorization Code Injection | PKCE prevents code injection attacks | ✓ Implemented |
| §2.1.2 Implicit Grant Deprecation | Implicit grant discouraged, code flow preferred | ⚠ Advisory |
| §2.2.1 Sender-Constrained Tokens | DPoP (RFC 9449) and mTLS (RFC 8705) | ✓ Implemented |
| §2.2.2 Refresh Token Protection | Rotation or sender-constraining | ✓ Implemented |
| §2.3 Privilege Restriction | Audience & scope restrictions | ✓ Implemented |
| §2.4 Password Grant Prohibited | Resource owner password grant not supported | ✓ Implemented |
| §2.5 Client Authentication | Multiple methods including asymmetric | ✓ Implemented |
| §2.6 Authorization Server Metadata | RFC 8414 metadata at `/.well-known/oauth-authorization-server` | ✓ Implemented |
| §4.8 PKCE Downgrade Protection | Reject code_verifier without code_challenge | ✓ Implemented |
| §4.12 307 Redirect Protection | Use 303 redirects to prevent credential leakage | ✓ Implemented |
| §4.16 Clickjacking Protection | X-Frame-Options + CSP frame-ancestors | ✓ Implemented |

        ### HTTP Redirect URI Validation

        
Per BCP Section 2.1, authorization servers MUST NOT allow redirect URIs using HTTP, 
            except for native clients using loopback interface redirection (localhost). LumoAuth enforces:

        
- HTTPS required for all web clients
- HTTP allowed only for localhost (127.0.0.1, ::1) for native apps
- Exact string matching (no wildcards or patterns)
- Variable port numbers allowed for localhost per RFC 8252

    
    
        
            Valid Redirect URIs
            
                
                    text
                
                
```
# ✓ Valid for web clients
https://app.example.com/callback
https://app.example.com/oauth/redirect

# ✓ Valid for native clients
http://localhost:8080/callback
http://127.0.0.1/callback
myapp://callback  # Custom URI scheme

# ✗ Invalid - HTTP for web clients
http://app.example.com/callback

# ✗ Invalid - wildcards not allowed
https://*.example.com/callback
https://app.example.com/*
```

            
        
        
            PKCE Enforcement
            
                
                    javascript
                
                
```
// Public clients MUST use PKCE with S256
const verifier = generateCodeVerifier();
const challenge = await sha256(verifier);

// Authorization request
const authUrl = `/oauth/authorize?
  client_id=\${clientId}
  &response_type=code
  &redirect_uri=\${redirectUri}
  &code_challenge=\${challenge}
  &code_challenge_method=S256
  &state=\${state}`;

// Token exchange - MUST include verifier
const tokenResponse = await fetch('/oauth/token', {
  method: 'POST',
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: authCode,
    code_verifier: verifier,
    redirect_uri: redirectUri,
    client_id: clientId
  })
});
```

            
        
    

    
    

    
        ## Authorization Server Metadata

        
LumoAuth publishes OAuth 2.0 Authorization Server Metadata in compliance with 
            [RFC 8414](https://www.rfc-editor.org/rfc/rfc8414).
            This allows OAuth clients to dynamically discover the authorization server's endpoints and capabilities.

        ### Metadata Endpoint

        
The metadata is available at the well-known URI `/.well-known/oauth-authorization-server`
            relative to the authorization server's issuer identifier.

        
            
**Endpoint:** `GET /t/\{tenant\}/api/v1/.well-known/oauth-authorization-server`

            
**Content-Type:** `application/json`

        

        ### Key Metadata Fields

        
| Field | Description | Status |
| --- | --- | --- |
| `issuer` | Authorization server's issuer identifier URL | ✓ Required |
| `authorization_endpoint` | URL of the authorization endpoint | ✓ Required |
| `token_endpoint` | URL of the token endpoint | ✓ Required |
| `jwks_uri` | URL of the JSON Web Key Set | ✓ Implemented |
| `scopes_supported` | List of supported OAuth scopes | ✓ Implemented |
| `response_types_supported` | List of supported response types | ✓ Required |
| `grant_types_supported` | List of supported grant types | ✓ Implemented |
| `token_endpoint_auth_methods_supported` | Supported client authentication methods | ✓ Implemented |
| `revocation_endpoint` | URL of the token revocation endpoint | ✓ Implemented |
| `introspection_endpoint` | URL of the token introspection endpoint | ✓ Implemented |
| `code_challenge_methods_supported` | Supported PKCE code challenge methods | ✓ Implemented |

    
    
        
            Metadata Discovery Example
            
                
                    bash
                
                
```
# Discover authorization server metadata
curl -s https://app.lumoauth.dev/t/acme-corp/api/v1/.well-known/oauth-authorization-server | jq .
```

            
        

        
            Sample Metadata Response
            
                
                    json
                
                
```
{
  "issuer": "https://app.lumoauth.dev/t/acme",
  "authorization_endpoint": "https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/authorize",
  "token_endpoint": "https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token",
  "jwks_uri": "https://app.lumoauth.dev/t/acme-corp/api/v1/.well-known/jwks.json",
  "response_types_supported": ["code", "token", "id_token"],
  "scopes_supported": ["openid", "profile", "email"],
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "token_endpoint_auth_methods_supported": ["client_secret_basic", "private_key_jwt"],
  "revocation_endpoint": "https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/revoke",
  "introspection_endpoint": "https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/introspect",
  "code_challenge_methods_supported": ["S256", "plain"]
}
```

            
        
    

    
    

    
        ## Transport Layer Security

        
All OAuth endpoints require HTTPS with TLS 1.2 or higher. This protects against:

        
        
| Threat (RFC 6819) | Protection |
| --- | --- |
| §4.3.1 Eavesdropping Access Tokens | TLS encryption prevents interception |
| §4.3.3 Client Credential Disclosure | TLS protects credentials in transit |
| §4.6.1 Eavesdropping on Transport | End-to-end encryption |
| §4.6.2 Replay Attacks | TLS replay protection |

        ### HSTS Header

        
HTTP Strict Transport Security (HSTS) is enabled with a 1-year max-age to ensure 
            browsers always use HTTPS connections.

    
    
        
            Security Headers
            
                
                    http
                
                
```
# Response Security Headers
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: frame-ancestors 'none'
```

            
        
    

    
    

    
        ## Token Security

        
        ### Access Token Protection

        
Access tokens are protected through:

        
- **Short Lifetime:** Default 1 hour expiration (§5.1.5.3)
- **High Entropy:** 256-bit random tokens (§5.1.4.2.2)
- **Scope Limitation:** Tokens are scoped to specific permissions (§5.1.5.1)
- **Audience Binding:** JWT tokens include `aud` claim (§5.1.5.5)
- **Signed JWTs:** RS256/ES256 signatures prevent tampering (§5.1.5.9)

        ### Refresh Token Protection

        
Refresh tokens have additional protections:

        
- **Token Rotation:** New refresh token issued on each use (§5.2.2.3)
- **Client Binding:** Bound to specific client_id (§5.2.2.2)
- **Revocation Support:** Can be revoked via /oauth/revoke endpoint (§5.2.2.4)
- **Configurable Lifetime:** Default 30 days, customizable per client

    
    
        
            Token Lifetimes
            
                
                    json
                
                
```
{
  "token_lifetimes": {
    "access_token": "3600s (1 hour)",
    "refresh_token": "2592000s (30 days)",
    "authorization_code": "600s (10 min)",
    "authorization_code_fapi": "60s (1 min)"
  },
  "entropy": {
    "tokens": "256 bits",
    "client_secrets": "256 bits"
  }
}
```

            
        
    

    
    

    
        ## Authorization Code Security

        
        ### One-Time Use (§5.1.5.4)

        
Authorization codes are single-use tokens. Once exchanged for access tokens, they 
            are immediately revoked and cannot be used again.

        ### Reuse Detection & Cascade Revocation (§5.2.1.1)

        
If an attacker attempts to use an already-redeemed authorization code, LumoAuth detects 
            this as a potential attack and automatically revokes **all tokens** that were 
            issued based on that code. This protects against authorization code theft and replay attacks.

        
            
**Security Alert:** Authorization code reuse attempts trigger immediate 
            cascade token revocation and are logged as high-severity security events.

        

        ### Binding Protections

        
- **Client Binding:** Code is bound to the client that requested it (§5.2.4.4)
- **Redirect URI Binding:** Code is bound to the exact redirect_uri used (§5.2.4.5)
- **PKCE Binding:** Code is bound to the code_challenge for public clients

    
    
        
            Code Reuse Attack Detection
            
                
                    sequence
                
                
```
# Attack Scenario
1. User authorizes → Code issued
2. Attacker intercepts code
3. Legitimate client exchanges code → ✓ Tokens issued
4. Attacker attempts to use same code

# LumoAuth Response
→ Detects code was already used
→ Revokes ALL tokens from step 3
→ Returns "invalid_grant" error
→ Logs security event (severity: high)
```

            
        
        
            Error Response
            
                
                    json
                
                
```
{
  "error": "invalid_grant",
  "error_description": "Authorization code has already been used"
}
```

            
        
    

    
    

    
        ## Client Authentication

        
LumoAuth supports multiple client authentication methods to accommodate different 
            security requirements and client types.

        
        
| Method | Client Type | Security Level |
| --- | --- | --- |
| `client_secret_basic` | Confidential | Standard - HTTP Basic Auth |
| `client_secret_post` | Confidential | Standard - Form body |
| `private_key_jwt` | Confidential | High - Signed JWT assertion |
| `none` | Public | PKCE required |

        ### Client Secret Requirements (§5.1.4.2.2)

        
- Minimum 256 bits of entropy
- Cryptographically secure random generation
- Secrets are hashed before storage (§5.1.4.1.3)
- Support for secret rotation without downtime

    
    
        
            Client Authentication Examples
            
                
                    bash
                
                
```
# client_secret_basic (Recommended)
curl -X POST \
  -u "client_id:client_secret" \
  -d "grant_type=authorization_code" \
  -d "code=AUTH_CODE" \
  https://app.lumoauth.dev/oauth/token

# client_secret_post
curl -X POST \
  -d "client_id=your_client_id" \
  -d "client_secret=your_secret" \
  -d "grant_type=authorization_code" \
  https://app.lumoauth.dev/oauth/token

# private_key_jwt (FAPI)
curl -X POST \
  -d "client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer" \
  -d "client_assertion=eyJhbGci..." \
  https://app.lumoauth.dev/oauth/token
```

            
        
    

    
    

    
        ## PKCE Downgrade Attack Protection

        
OAuth 2.0 Security BCP Section 4.8 describes PKCE downgrade attacks where an attacker 
            removes the `code_challenge` from an authorization request to bypass PKCE protection.

        ### Attack Description

        
In a PKCE downgrade attack:

        
1. Legitimate client starts authorization with PKCE (`code_challenge=abc...`)
2. Attacker intercepts the request and removes the `code_challenge` parameter
3. Authorization server issues code without PKCE binding
4. Attacker captures the authorization code
5. Attacker redeems code at token endpoint without `code_verifier`

        ### Countermeasures Implemented

        
LumoAuth prevents PKCE downgrade attacks by enforcing strict validation rules:

        
- **Public Client Enforcement:** Public clients MUST use PKCE - requests without 
                `code_challenge` are rejected
- **Downgrade Detection:** If a `code_verifier` is presented at the token 
                endpoint but no `code_challenge` was stored, the request is rejected
- **S256 Requirement:** Public clients must use S256 method (not plain) to prevent 
                challenge value leakage
- **Audit Logging:** Downgrade attempts are logged as high-severity security events

        
            
**Implementation Note:** Authorization servers MUST ensure that if no 
            `code_challenge` was present in the authorization request, a `code_verifier` 
            in the token request is rejected. This bidirectional check is critical for downgrade protection.

        
    
    
        
            PKCE Downgrade Detection
            
                
                    sequence
                
                
```
# Scenario 1: Legitimate Flow
1. Client → AS: /authorize?code_challenge=xyz&...
2. AS stores: code_challenge=xyz
3. Client → AS: /token code_verifier=abc
4. AS verifies: S256(abc) == xyz ✓

# Scenario 2: Downgrade Attempt Blocked
1. Client → AS: /authorize?code_challenge=xyz
2. Attacker removes: code_challenge parameter
3. AS stores: code_challenge=null
4. Attacker → AS: /token (no code_verifier)
5. AS blocks: Public client requires PKCE ✗

# Scenario 3: Verifier Without Challenge Blocked
1. Client → AS: /authorize (no code_challenge)
2. AS stores: code_challenge=null
3. Attacker → AS: /token code_verifier=abc
4. AS blocks: code_verifier without code_challenge ✗
```

            
        
        
            Error Response
            
                
                    json
                
                
```
{
  "error": "invalid_grant",
  "error_description": "Invalid PKCE flow: code_verifier without code_challenge"
}
```

            
        
    

    
    

    
        ## CSRF Protection (§4.4.1.8)

        
The `state` parameter provides protection against Cross-Site Request Forgery attacks 
            on the authorization endpoint. Clients MUST generate a unique, unpredictable value and 
            verify it in the callback.

        ### State Parameter Requirements

        
- Cryptographically random, at least 128 bits
- Bound to the user's session
- Verified before processing the authorization response
- Single-use (consumed after verification)

        ### Attack Prevention

        
Without the state parameter, an attacker could trick a user into authorizing access to 
            the attacker's account, potentially leading to data being saved to the wrong account.

    
    
        
            State Parameter Usage
            
                
                    javascript
                
                
```
// Generate state and store in session
const state = crypto.randomBytes(32).toString('hex');
session.oauthState = state;

// Include in authorization request
const authUrl = `https://app.lumoauth.dev/oauth/authorize?
  client_id=\${clientId}
  &response_type=code
  &redirect_uri=\${redirectUri}
  &state=\${state}
  &scope=openid profile`;

// Verify in callback
if (req.query.state !== session.oauthState) {
  throw new Error('CSRF detected: state mismatch');
}
delete session.oauthState; // Single use
```

            
        
    

    
    

    
        ## Clickjacking Protection (§4.4.1.9)

        
Authorization pages are protected against clickjacking attacks using multiple layers of defense:

        
        
- **X-Frame-Options: DENY** - Prevents framing in all browsers (§5.2.2.6)
- **CSP frame-ancestors: 'none'** - Modern browsers enforce no framing
- **JavaScript frame-busting** - Fallback for legacy browsers

        ### Attack Description

        
In a clickjacking attack, a malicious site loads the authorization page in a transparent 
            iframe and overlays fake buttons. When users click what appears to be a button on the 
            malicious site, they're actually clicking the "Authorize" button on the hidden page.

    
    
        
            Frame Protection Headers
            
                
                    http
                
                
```
# All OAuth pages include:
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none'

# These headers ensure the authorization
# page cannot be embedded in iframes
```

            
        
    

    
    

    
        ## Redirect URI Validation (§5.2.3.5)

        
Strict redirect URI validation prevents open redirector attacks and authorization 
            code/token leakage to malicious sites.

        ### Validation Rules

        
| Rule | Description |
| --- | --- |
| Pre-registration Required | All redirect URIs must be registered at client creation |
| Exact Match (OAuth 2.1) | No wildcards or partial matching allowed |
| No Fragments | Fragment identifiers (#) are not allowed |
| HTTPS Required | HTTP only allowed for localhost development |
| Token Endpoint Binding | redirect_uri must match when exchanging code |

        ### Error Handling

        
If the redirect URI is invalid or doesn't match a registered URI, LumoAuth displays 
            an error page directly to the user rather than redirecting. This prevents the error 
            from being used as an open redirector.

    
    
        
            Redirect URI Examples
            
                
                    text
                
                
```
# ✓ Valid redirect URIs
https://app.example.com/callback
https://app.example.com/oauth/callback
http://localhost:3000/callback  # Dev only
myapp://callback  # Native apps

# ✗ Invalid redirect URIs
https://app.example.com/callback#state=abc
https://evil.com/callback
https://app.example.com/*
http://app.example.com/callback  # Production
```

            
        
    

    
    

    
        ## Rate Limiting (§5.1.4.2.3, §4.4.1.11)

        
Rate limiting protects against online guessing attacks, DoS attacks, and resource 
            exhaustion. Different limits apply to different endpoints based on risk.

        
        
| Endpoint | Limit | Window |
| --- | --- | --- |
| Authorization | 60 requests | 60 seconds |
| Token | 100 requests | 60 seconds |
| Introspection | 100 requests | 60 seconds |
| Login (per account) | 5 attempts | 15 min lockout |
| Login (per IP) | 20 attempts | 1 hour block |

    
    
        
            Rate Limit Response
            
                
                    http
                
                
```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1706817600

{
  "error": "too_many_requests",
  "error_description": "Rate limit exceeded"
}
```

            
        
    

    
    

    
        ## Security Audit Logging

        
Comprehensive audit logging enables detection and investigation of security incidents. 
            All security-relevant events are logged with sufficient detail for forensic analysis.

        ### Logged Events

        
- Authorization code issuance and exchange
- Token issuance, refresh, and revocation
- Authentication attempts (success and failure)
- Client authentication attempts
- Authorization code reuse detection
- PKCE verification failures
- Rate limit violations
- Suspicious activity patterns

        ### Log Fields

        
Each audit log entry includes: timestamp, event type, tenant, actor (user/client/agent), 
            target resource, IP address, user agent, and event-specific metadata.

    
    
        
            Security Event Log
            
                
                    json
                
                
```
{
  "event_type": "oauth.security.code_reuse_detected",
  "severity": "high",
  "timestamp": "2026-02-04T10:30:00Z",
  "tenant_id": "acme-corp",
  "client_id": "web-app",
  "user_id": "user_123",
  "ip_address": "203.0.113.42",
  "threat": "RFC6819_4.4.1.1",
  "action_taken": "cascade_token_revocation",
  "message": "Authorization code reuse attempt detected"
}
```

            
        
    

    
    

    
        ## RFC 6819 Threat Coverage

        
Summary of RFC 6819 threats and LumoAuth's countermeasures:

        
        
| Threat Category | RFC Section | Countermeasure |
| --- | --- | --- |
| Eavesdropping | §4.3.1, §4.6.1 | TLS required, short token lifetimes |
| Token Theft | §4.1.2, §4.1.3 | PKCE, DPoP, token binding |
| Code Interception | §4.4.1.1 | PKCE mandatory, short code lifetime |
| Code Reuse | §5.2.1.1 | One-time use, cascade revocation |
| CSRF | §4.4.1.8 | State parameter validation |
| Clickjacking | §4.4.1.9 | X-Frame-Options, CSP |
| Open Redirector | §4.2.4 | Strict redirect URI validation |
| Phishing | §4.2.1 | TLS verification, consent UI |
| Online Guessing | §4.4.1.3 | High entropy, rate limiting |
| Token Substitution | §4.4.2.6 | ID token validation, audience check |

    
    

    
    

    
        ## RFC 7009: Token Revocation

        
LumoAuth implements [RFC 7009](https://www.rfc-editor.org/rfc/rfc7009)
            (OAuth 2.0 Token Revocation), allowing clients to notify the authorization server when tokens
            are no longer needed. This enables proper cleanup of security credentials and improves end-user
            experience.

        ### Revocation Endpoint

        
The revocation endpoint accepts HTTP POST requests to revoke access tokens or refresh tokens.
            Clients must authenticate using the same method used to obtain the token.

        
            
**Endpoint:** `POST /t/\{tenant\}/api/v1/oauth/revoke`

            
**Authentication:** Client credentials (Basic Auth or POST body)

        

        ### Request Parameters

        
| Parameter | Required | Description |
| --- | --- | --- |
| `token` | Required | The token to be revoked (access or refresh token) |
| `token_type_hint` | Optional | Hint about token type: `access_token` or `refresh_token` |

        ### Cascade Revocation Behavior

        
When revoking tokens, LumoAuth implements the following cascade behavior per RFC 7009 §2.1:

        
- **Revoking Refresh Token:** When a refresh token is revoked, all access tokens
                issued from the same authorization grant are also revoked. This ensures that compromised
                refresh tokens cannot be used to maintain access.
- **Revoking Access Token:** When an access token is revoked, only that specific
                token becomes invalid. The refresh token and other access tokens remain valid.

        ### Success Response

        
Per RFC 7009 §2.2, the server returns HTTP 200 for both successful revocations and invalid tokens.
            This prevents attackers from discovering valid tokens through the revocation endpoint.

        
            
**Security Note:** Invalid tokens do not cause an error response since the client
            cannot handle such errors in a reasonable way. The purpose of revocation (invalidating the token)
            is already achieved if the token doesn't exist.

        

        ### Error Responses

        
The only error defined by RFC 7009 is `unsupported_token_type`, returned when the
            server doesn't support revoking a particular token type:

        
| Error Code | HTTP Status | Description |
| --- | --- | --- |
| `unsupported_token_type` | 400 | The authorization server does not support revocation of the presented token type |

        
            
**Implementation Note:** LumoAuth supports revocation of both `access_token`
            and `refresh_token` types, so this error is only returned for unrecognized token types.

        

        ### Use Cases

        
Common scenarios where clients should revoke tokens:

        
- **User Logout:** When a user explicitly logs out of your application
- **Session Switch:** When a user switches to a different account
- **App Uninstall:** When your application is uninstalled (if detectable)
- **Security Incident:** When a token is believed to be compromised
- **Consent Withdrawal:** When a user withdraws consent for your application

        ### Integration with Authorization Grant

        
LumoAuth tracks the relationship between tokens and their originating authorization code.
            This enables proper cascade revocation and maintains security even when tokens are issued
            at different times:

        
- All tokens (access and refresh) are linked to the authorization code that created them
- When a refresh token is revoked, all sibling access tokens are discovered via this link
- This implements RFC 7009 §2.1 requirement: "SHOULD also invalidate all access tokens based on the same authorization grant"

    
    
        
            Token Revocation Request
            
                
                    http
                
                
```
POST /t/acme-corp/api/v1/oauth/revoke HTTP/1.1
Host: app.lumoauth.dev
Content-Type: application/x-www-form-urlencoded
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW

token=45ghiukldjahdnhzdauz&token_type_hint=refresh_token
```

            

            Success Response (HTTP 200)
            
                
                    http
                
                
```
HTTP/1.1 200 OK
Cache-Control: no-store
Pragma: no-cache

{}
```

            

            Unsupported Token Type Error
            
                
                    json
                
                
```
{
  "error": "unsupported_token_type",
  "error_description": "The authorization server does not support the revocation of the presented token type."
}
```

            

            JavaScript Example
            
                
                    javascript
                
                
```
// Revoke a refresh token on logout
async function revokeToken(token, tokenType) {
  const response = await fetch(
    'https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/revoke',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(clientId + ':' + clientSecret)}`
      },
      body: new URLSearchParams({
        token: token,
        token_type_hint: tokenType
      })
    }
  );
  
  // RFC 7009: Always returns 200 for valid requests
  if (response.status === 200) {
    console.log('Token revoked successfully');
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}
```

            
        
    

    
    

    
        ## Client Security Best Practices

        
Recommendations for building secure OAuth clients (§5.3):

        
1. **Don't Store Secrets in Code** (§5.3.1)

                Never embed client secrets in source code, mobile apps, or client-side JavaScript.
2. **Use PKCE for All Clients**

                Even confidential clients benefit from PKCE's protection against code interception.
3. **Validate State Parameter** (§5.3.5)

                Always generate, store, and verify the state parameter to prevent CSRF.
4. **Store Tokens Securely** (§5.3.3)

                Use secure storage mechanisms (Keychain, Credential Manager) for refresh tokens.
5. **Minimize Token Scope** (§5.1.5.1)

                Request only the scopes your application actually needs.
6. **Handle Token Expiration**

                Implement proper refresh token flow rather than requesting new authorization.
7. **Verify ID Token Claims**

                Always validate issuer, audience, expiration, and nonce claims.

    
    
        
            Secure Client Implementation
            
                
                    javascript
                
                
```
// ✓ Generate PKCE parameters
const verifier = generateCodeVerifier();
const challenge = await generateCodeChallenge(verifier);

// ✓ Generate state for CSRF protection
const state = crypto.randomBytes(32).toString('hex');

// ✓ Store securely before redirect
secureStorage.set('pkce_verifier', verifier);
secureStorage.set('oauth_state', state);

// ✓ Request minimal scopes
const scope = 'openid profile'; // Only what's needed

// ✓ Verify state in callback
if (response.state !== secureStorage.get('oauth_state')) {
  throw new SecurityError('CSRF detected');
}
```

            
        
    

    
        
            [Previous
                FAPI 2.0 Security](/api-reference/oauth/fapi)
            [Next
                Dynamic Registration](/api-reference/oauth/register)
