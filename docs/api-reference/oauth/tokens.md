# OAuth Tokens

                
Access tokens and refresh tokens issued to OAuth clients.

            
        

        
OAuth tokens grant applications access to the API on behalf of users or themselves. Access tokens
            are short-lived and used for API requests. Refresh tokens are long-lived and used to obtain new
            access tokens without re-authentication.

    
    
        
            Token Response
            
                
                    json
                    
                
                
```
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "def50200abc...",
  "scope": "openid profile email"
}
```

            
        
    

    
    

    
        ## Token Types

        
        
| Type | Description | Default Lifetime |
| --- | --- | --- |
| `access_token` | Used in API request Authorization header | 1 hour |
| `refresh_token` | Used to obtain new access tokens | 30 days |
| `id_token` | JWT containing user identity claims (OpenID Connect) | 1 hour |

    
    

    
    

    
        ## JWT Access Token Format

        
LumoAuth issues access tokens in JWT format compliant with 
            [RFC 9068 (JWT Profile for OAuth 2.0 Access Tokens)](https://www.rfc-editor.org/rfc/rfc9068).
            This enables resource servers to validate tokens locally without contacting the authorization server.

        ### Header

        
            JWT Header
            
                
                    typ
                    
                        string
                        required
                        Token type: `at+jwt` per RFC 9068 Section 2.1
                    
                
                
                    alg
                    
                        string
                        required
                        Signing algorithm: `RS256` (default), `ES256`, or `PS256`
                    
                
                
                    kid
                    
                        string
                        required
                        Key ID for signature verification (matches JWKS)
                    
                
            
        

        ### Required Claims (RFC 9068 Section 2.2)

        
            Required JWT Claims
            
                
                    iss
                    
                        string
                        Issuer identifier URL
                    
                
                
                    exp
                    
                        integer
                        Expiration time (Unix timestamp)
                    
                
                
                    aud
                    
                        string
                        Intended audience (client_id or resource indicator)
                    
                
                
                    sub
                    
                        string
                        Subject identifier (user ID or client ID)
                    
                
                
                    client_id
                    
                        string
                        OAuth client that requested the token
                    
                
                
                    iat
                    
                        integer
                        Issued at time (Unix timestamp)
                    
                
                
                    jti
                    
                        string
                        Unique token identifier (UUID format)
                    
                
            
        

        ### Optional Claims

        
            Optional JWT Claims
            
                
                    scope
                    
                        string
                        Space-separated list of granted scopes
                    
                
                
                    auth_time
                    
                        integer
                        Time of user authentication (Unix timestamp)
                    
                
                
                    acr
                    
                        string
                        Authentication Context Class Reference
                    
                
                
                    amr
                    
                        string[]
                        Authentication Methods References (e.g., ["pwd", "mfa"])
                    
                
                
                    roles
                    
                        string[]
                        User roles per RFC 7643 (SCIM)
                    
                
                
                    groups
                    
                        string[]
                        User groups per RFC 7643 (SCIM)
                    
                
                
                    entitlements
                    
                        string[]
                        User entitlements per RFC 7643 (SCIM)
                    
                
                
                    cnf
                    
                        object
                        Confirmation claim for sender-constrained tokens (DPoP/MTLS)
                    
                
            
        
    
    
        
            JWT Access Token Example
            
                
                    Header
                    
                
                
```
{
  "typ": "at+jwt",
  "alg": "RS256",
  "kid": "lumo-rs256-key"
}
```

            
        

        
            JWT Payload
            
                
                    Claims
                    
                
                
```
{
  "iss": "https://app.lumoauth.dev",
  "sub": "user_12345",
  "aud": "https://api.example.com",
  "exp": 1706817600,
  "iat": 1706814000,
  "jti": "a1b2c3d4e5f67890abcdef12",
  "client_id": "mobile_app",
  "scope": "openid profile email",
  "auth_time": 1706813900,
  "acr": "urn:mace:incommon:iap:silver",
  "amr": ["pwd", "mfa"],
  "roles": ["admin", "editor"]
}
```

            
        
    

    
    

    
        ## Validating JWT Access Tokens

        
Per RFC 9068 Section 4, resource servers MUST validate JWT access tokens as follows:

        
1. **Verify the `typ` header** is `at+jwt` or `application/at+jwt`
2. **Decrypt** if the token is encrypted (JWE)
3. **Verify the `iss` claim** matches the expected authorization server
4. **Verify the `aud` claim** contains your resource server identifier
5. **Validate the signature** using keys from `/.well-known/jwks.json`
6. **Verify `exp`** is in the future (allow ≤5 min clock skew)
7. **Reject `alg: none`** tokens (unsigned JWTs)

        > [!WARNING]
> **Security: Prevent Token Confusion**

    
        
            Validation Example (Node.js)
            
                
                    javascript
                    
                
                
```
const { jwtVerify } = require('jose');

async function validateAccessToken(token) {
  // Check typ header first
  const [headerB64] = token.split('.');
  const header = JSON.parse(
    Buffer.from(headerB64, 'base64url')
  );
  
  if (header.typ !== 'at+jwt') {
    throw new Error('Invalid token type');
  }
  
  // Verify with JWKS
  const JWKS = createRemoteJWKSet(
    new URL('https://app.lumoauth.dev/.well-known/jwks.json')
  );
  
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: 'https://app.lumoauth.dev',
    audience: 'https://api.example.com'
  });
  
  return payload;
}
```

            
        
    

    
    

    
        ## Obtain Access Token

        
            POST
            /api/v1/oauth/token
        
        
Exchange credentials or authorization codes for access tokens.

        
        ### Authorization Code Grant

        
            
                
                    grant_type
                    string
                    required
                
                Must be `authorization_code`
            
            
                
                    code
                    string
                    required
                
                Authorization code from redirect
            
            
                
                    redirect_uri
                    string
                    required
                
                Must match the redirect URI used in authorization
            
            
                
                    client_id
                    string
                    required
                
                Your OAuth client ID
            
            
                
                    client_secret
                    string
                    conditional
                
                Required for confidential clients
            
            
                
                    code_verifier
                    string
                    conditional
                
                Required when PKCE was used in authorization
            
        
    
    
        
            Authorization Code Exchange
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/api/v1/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTH_CODE_HERE" \
  -d "redirect_uri=https://app.example.com/callback" \
  -d "client_id=your_client_id" \
  -d "client_secret=your_client_secret"
```

            
        
    

    
    

    
        ### Client Credentials Grant

        
            
                
                    grant_type
                    string
                    required
                
                Must be `client_credentials`
            
            
                
                    client_id
                    string
                    required
                
                Your OAuth client ID
            
            
                
                    client_secret
                    string
                    required
                
                Your OAuth client secret
            
            
                
                    scope
                    string
                    optional
                
                Space-separated list of scopes to request
            
        
    
    
        
            Client Credentials
            
                
                    python
                    
                
                
```
import requests

# Machine-to-machine authentication
response = requests.post(
    "https://app.lumoauth.dev/api/v1/oauth/token",
    data={
        "grant_type": "client_credentials",
        "client_id": "your_client_id",
        "client_secret": "your_client_secret",
        "scope": "admin.read admin.write"
    }
)

tokens = response.json()
access_token = tokens["access_token"]
```

            
        
    

    
    

    
        ## Refresh Access Token

        
            POST
            /api/v1/oauth/token
        
        
Use a refresh token to obtain a new access token.

        
        
            
                
                    grant_type
                    string
                    required
                
                Must be `refresh_token`
            
            
                
                    refresh_token
                    string
                    required
                
                The refresh token from a previous token response
            
            
                
                    client_id
                    string
                    required
                
                Your OAuth client ID
            
        
    
    
        
            Refresh Token
            
                
                    javascript
                    
                
                
```
async function refreshAccessToken(refreshToken) {
  const response = await fetch(
    'https://app.lumoauth.dev/api/v1/oauth/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: 'your_client_id'
      })
    }
  );
  return response.json();
}
```

            
        
    

    
    

    
        ## Revoke Token

        
            POST
            /api/v1/oauth/revoke
        
        
Revokes an access or refresh token. Use for logout or security purposes.

        
        
            
                
                    token
                    string
                    required
                
                The access token or refresh token to revoke
            
            
                
                    token_type_hint
                    string
                    optional
                
                Either `access_token` or `refresh_token`
            
        
    
    
        
            Revoke Token
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/api/v1/oauth/revoke \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=ACCESS_TOKEN_HERE" \
  -d "token_type_hint=access_token"
```

            
        
    

    
    

    
        ## Introspect Token

        
            POST
            /api/v1/oauth/introspect
        
        
Validate a token and retrieve its metadata. Used by resource servers.

    
    

    
    

    
        ## List Active Tokens (Admin)

        
            GET
            /t/\{tenant\}/api/v1/admin/tokens
        
        
Lists active tokens. Use filters to find tokens by user or client.

    
    

    
    

    
        ## Revoke User Tokens (Admin)

        
            DELETE
            /t/\{tenant\}/api/v1/admin/users/\{user_id\}/tokens
        
        
Revokes all tokens for a specific user. Forces re-authentication.
