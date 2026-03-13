# Token Introspection

        
Token introspection allows resource servers to validate access tokens and retrieve information about them.
            This is useful when you need to verify a token's validity or check its claims without decoding the JWT yourself.
            Implements [RFC 7662](https://www.rfc-editor.org/rfc/rfc7662).

    
    
        
            Introspect Token
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/introspect \
  -u "resource_server_id:resource_server_secret" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=eyJhbGciOiJSUzI1NiIsInR5cCI6..."
```

            
        
    

    
    

    
        ## Introspect Token

        
            POST
            /t/\{tenant\}/api/v1/oauth/introspect
        
        
        
Determine if a token is active and retrieve its metadata. Requires client authentication.

        ### Request Parameters

        
            
                
                    token
                    string
                    required
                
                The token to introspect
            
            
                
                    token_type_hint
                    string
                    optional
                
                Hint about token type: `access_token` or `refresh_token`
            
        
    
    
        
            Active Token Response
            
                
                    json
                    
                
                
```
{
  "active": true,
  "sub": "user_123",
  "username": "alice@example.com",
  "client_id": "mobile_app",
  "scope": "openid profile email",
  "token_type": "Bearer",
  "exp": 1706817600,
  "iat": 1706814000,
  "nbf": 1706814000,
  "iss": "https://app.lumoauth.dev/t/acme-corp",
  "aud": "mobile_app",
  "jti": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

            
        
    

    
    

    
        ## Response

        
        
            Active Token Response
            
                
                    active
                    
                        boolean
                        required
                        Whether the token is currently valid. `true` means the token is active and can be used.
                    
                
                
                    scope
                    
                        string
                        optional
                        Space-separated list of OAuth 2.0 scopes granted to this token
                    
                
                
                    client_id
                    
                        string
                        optional
                        Client identifier for the OAuth 2.0 client that requested this token
                    
                
                
                    username
                    
                        string
                        optional
                        Human-readable identifier for the resource owner who authorized this token
                    
                
                
                    token_type
                    
                        string
                        optional
                        Type of token (e.g., `Bearer`)
                    
                
                
                    exp
                    
                        integer
                        optional
                        Expiration time (Unix timestamp) - seconds since January 1, 1970 UTC
                    
                
                
                    iat
                    
                        integer
                        optional
                        Token issue time (Unix timestamp) - when this token was originally issued
                    
                
                
                    nbf
                    
                        integer
                        optional
                        Not before (Unix timestamp) - token is not valid before this time
                    
                
                
                    sub
                    
                        string
                        optional
                        Subject of the token - machine-readable identifier (usually user ID)
                    
                
                
                    aud
                    
                        string | string[]
                        optional
                        Audience - intended recipient(s) of this token
                    
                
                
                    iss
                    
                        string
                        optional
                        Issuer of this token - URL identifying the authorization server
                    
                
                
                    jti
                    
                        string
                        optional
                        JWT ID - unique identifier for this token
                    
                
            
        
        
        > [!WARNING]
> **Inactive Token Response**

    

    
    

    
        ## Security Considerations

        
        ### Authentication Required

        
Per RFC 7662 Section 2.1, the introspection endpoint requires authentication to prevent token scanning attacks.
            Supported authentication methods:

        
- **HTTP Basic Authentication:** Client ID and secret encoded in Authorization header
- **Form parameters:** `client_id` and `client_secret` in request body

        ### Token Validation Checks

        
The authorization server performs all applicable checks per RFC 7662 Section 4:

        
- **Expiration:** Validates the `exp` claim is in the future
- **Not-before:** Validates the `nbf` claim (if present) is in the past
- **Revocation:** Checks if token has been explicitly revoked
- **Signature:** For JWTs, validates the cryptographic signature
- **Tenant isolation:** Ensures token belongs to the correct tenant

        ### Caching Considerations

        
Resource servers may cache introspection responses to improve performance. Consider:

        
- **Revocation latency:** Cached responses delay revocation enforcement
- **Cache duration:** Balance performance vs. security based on your requirements
- **Sensitive operations:** Always introspect without caching for critical actions
- **Expiration:** Never cache beyond the token's `exp` time

    
    
        
            Authentication Examples
            
                
                    bash
                    
                
                
```
# HTTP Basic Authentication
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/introspect \
  -u "client_id:client_secret" \
  -d "token=eyJhbGciOiJSUzI1NiIsInR5cCI6..."

# Form parameters
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/introspect \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=eyJhbGciOiJSUzI1NiIsInR5cCI6..." \
  -d "client_id=resource_server" \
  -d "client_secret=secret123"
```

            
        
    

    
    

    
        ## Revoke Token

        
            POST
            /t/\{tenant\}/api/v1/oauth/revoke
        
        
        
Invalidate a token immediately. Per [RFC 7009](https://www.rfc-editor.org/rfc/rfc7009),
            the endpoint always returns success (200 OK), even if the token was already invalid.

        
        
            
                
                    token
                    string
                    required
                
                The token to revoke
            
            
                
                    token_type_hint
                    string
                    optional
                
                Hint: `access_token` or `refresh_token`
            
        
    
    
        
            Revoke Token
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/revoke \
  -u "client_id:client_secret" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=tGzv3JOkF0XG5Qx2TlKWIA" \
  -d "token_type_hint=refresh_token"
```
