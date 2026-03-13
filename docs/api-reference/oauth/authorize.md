# Authorization Endpoint

                
Initiate OAuth 2.0 and OpenID Connect authentication flows.

            
        

        
The authorization endpoint is where users authenticate and grant permissions to your application.
            This is the starting point for the **Authorization Code** flow, the most secure way
            to authenticate users in web and mobile applications.

        > [!NOTE]
> **OAuth 2.1 Compliant**

    
        
            Authorization URL
            
                
                    url
                    
                
                
```
https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/authorize?
  response_type=code&
  client_id=your_client_id&
  redirect_uri=https://app.example.com/callback&
  scope=openid profile email&
  state=abc123xyz&
  code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK...&
  code_challenge_method=S256
```

            
        
    

    
    

    
        ## Authorization Request

        
            GET
            /t/\{tenant\}/api/v1/oauth/authorize
        
        
        
Redirect users to this endpoint to start authentication. After the user authenticates and consents, they will be redirected back to your application with an authorization code.

        ### Query Parameters

        
            
                
                    response_type
                    string
                    required
                
                Determines the authorization flow. Supported values:
                    
- `code` - Authorization Code flow (recommended)
- `token` - Implicit flow (access token only)
- `id_token` - OIDC Implicit (ID token only)
- `id_token token` - OIDC Implicit (both tokens)
- `code id_token` - Hybrid flow
- `code token` - Hybrid flow
- `code id_token token` - Hybrid flow (all)
- `none` - No tokens (session check only)

                    For multi-value types, order doesn't matter (e.g., `id_token code` = `code id_token`)
                
            
            
                
                    client_id
                    string
                    required
                
                Your application's client ID
            
            
                
                    redirect_uri
                    string
                    required
                
                URL to redirect back to after authentication. Must be pre-registered.
            
            
                
                    scope
                    string
                    required
                
                Space-separated list of scopes. Include `openid` for OIDC.
            
            
                
                    state
                    string
                    required
                
                Random string to prevent CSRF. You must verify this matches on callback.
            
            
                
                    code_challenge
                    string
                    required
                
                PKCE code challenge (base64url-encoded SHA256 hash of code_verifier)
            
            
                
                    code_challenge_method
                    string
                    required
                
                Must be `S256`
            
            
                
                    response_mode
                    string
                    optional
                
                How to return the authorization response:
                    
- `query` - Query string (default for `code`)
- `fragment` - URL fragment (default for token/id_token flows)
- `form_post` - Auto-submitting HTML form (enhanced security)

                    **Security:** `query` mode is not allowed when response includes tokens.
                
            
            
                
                    nonce
                    string
                    conditional
                
                Random value for replay protection. **Required** when `response_type` includes `id_token`.
            
            
                
                    prompt
                    string
                    optional
                
                Controls UI behavior: `none` (silent), `login` (force login), `consent` (force consent)
            
        
    
    
        
            Generate PKCE (JavaScript)
            
                
                    javascript
                    
                
                
```
// Generate a random code verifier
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

// Create code challenge from verifier
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

// Base64 URL encoding (no padding)
function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Usage
const codeVerifier = generateCodeVerifier();
const codeChallenge = await generateCodeChallenge(codeVerifier);
// Store codeVerifier securely for the token exchange
```

            
        
    

    
    

    
        ## Authorization Response

        
On success, the user is redirected to your `redirect_uri`. The response parameters depend on `response_type` and are encoded per `response_mode`.

        
        
            
                
                    code
                    string
                
                Authorization code (when `response_type` includes `code`). Expires in 10 minutes.
            
            
                
                    access_token
                    string
                
                Access token (when `response_type` includes `token`). Returned in fragment or form_post only.
            
            
                
                    id_token
                    string
                
                ID token (when `response_type` includes `id_token`). JWT containing user claims.
            
            
                
                    token_type
                    string
                
                `Bearer` (when access_token is returned)
            
            
                
                    expires_in
                    integer
                
                Token lifetime in seconds (when access_token is returned)
            
            
                
                    state
                    string
                
                The state parameter you provided (verify this!)
            
            
                
                    iss
                    string
                
                Issuer identifier (RFC 9207). Use to prevent mix-up attacks.
            
        
    
    
        
            Code Flow Response (query)
            
                
                    url
                    
                
                
```
https://app.example.com/callback?
  code=SplxlOBeZQQYbYS6WxSbIA&
  state=abc123xyz&
  iss=https://app.lumoauth.dev/t/acme-corp
```

            
        
        
            Implicit Flow Response (fragment)
            
                
                    url
                    
                
                
```
https://app.example.com/callback#
  access_token=eyJhbGciOiJSUzI1NiIs...&
  token_type=Bearer&
  expires_in=3600&
  id_token=eyJhbGciOiJSUzI1NiIs...&
  state=abc123xyz
```

            
        
    

    
    

    
        ## Error Response

        
On error, the user is redirected with error parameters:

        
        
| Error Code | Description |
| --- | --- |
| `invalid_request` | Missing or invalid parameters |
| `unauthorized_client` | Client not authorized for this grant type |
| `access_denied` | User denied the request |
| `invalid_scope` | Requested scope is invalid or not allowed |
| `server_error` | Unexpected server error |
| `unsupported_response_type` | The response_type is not supported |
| `login_required` | User not authenticated (prompt=none) |
| `consent_required` | User consent needed (prompt=none) |

    
    
        
            Error Callback
            
                
                    url
                    
                
                
```
https://app.example.com/callback?
  error=access_denied&
  error_description=User denied the request&
  state=abc123xyz
```

            
        
    

    
    

    
        ## PKCE Explained

        
**PKCE** (Proof Key for Code Exchange) protects against authorization code interception attacks.
            It's mandatory in OAuth 2.1 and required by LumoAuth for all clients.

        
        
1. **Generate** a random `code_verifier` (43-128 characters)
2. **Hash** it with SHA256 and base64url-encode to get `code_challenge`
3. **Send** the challenge in the authorization request
4. **Send** the original verifier when exchanging the code for tokens
