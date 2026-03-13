# Dynamic Client Registration

        
Dynamic Client Registration allows applications to register themselves as OAuth clients without
            manual intervention. This is useful for platforms that need to automatically onboard new integrations.
            Implements [RFC 7591](https://www.rfc-editor.org/rfc/rfc7591).

        
        > [!WARNING]
> **Tenant Configuration Required**

    
        
            Register Client
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/connect/register \
  -H "Content-Type: application/json" \
  -d '{
    "redirect_uris": [
      "https://app.example.com/callback",
      "https://app.example.com/silent-callback"
    ],
    "client_name": "My Awesome App",
    "client_uri": "https://example.com",
    "application_type": "web",
    "grant_types": ["authorization_code", "refresh_token", "implicit"],
    "response_types": ["code", "code id_token"],
    "token_endpoint_auth_method": "client_secret_basic",
    "scope": "openid profile email"
  }'
```

            
        
    

    
    

    
        ## Register Client

        
            POST
            /t/\{tenant\}/api/v1/connect/register
        
        
        
Register a new OAuth client programmatically.

        ### Request Body

        
            
                
                    redirect_uris
                    array of strings
                    required
                
                List of allowed redirect URIs. Must be HTTPS (except localhost for development).
            
            
                
                    client_name
                    string
                    optional
                
                Human-readable name shown during authorization
            
            
                
                    client_uri
                    string
                    optional
                
                URL of the client's home page
            
            
                
                    logo_uri
                    string
                    optional
                
                URL of the client's logo
            
            
                
                    grant_types
                    array of strings
                    optional
                
                Grant types the client will use. Defaults to `["authorization_code"]`
            
            
                
                    response_types
                    array of strings
                    optional
                
                Response types the client will use. Defaults to `["code"]`. Supported values:
                    
- `code`, `token`, `id_token`, `none`
- `code id_token`, `code token`, `id_token token`
- `code id_token token`

                
            
            
                
                    application_type
                    string
                    optional
                
                Type of client: `web` (default) or `native`. Affects redirect_uri validation rules.
            
            
                
                    token_endpoint_auth_method
                    string
                    optional
                
                How the client authenticates: `client_secret_post`, `client_secret_basic`, `none`
            
            
                
                    scope
                    string
                    optional
                
                Space-separated list of scopes the client may request
            
            
                
                    frontchannel_logout_uri
                    string
                    optional
                
                URL that will cause the RP to log itself out when rendered in an iframe by the OP ([OIDC Front-Channel Logout 1.0](https://openid.net/specs/openid-connect-frontchannel-1_0.html)). Domain, port, and scheme must match a registered `redirect_uri`.
            
            
                
                    frontchannel_logout_session_required
                    boolean
                    optional
                
                If `true`, the OP must include `iss` and `sid` query parameters when rendering the `frontchannel_logout_uri`. Default: `false`
            
            
                
                    backchannel_logout_uri
                    string
                    optional
                
                URL for back-channel logout notifications ([OIDC Back-Channel Logout 1.0](https://openid.net/specs/openid-connect-backchannel-1_0.html)). Receives a Logout Token via HTTP POST. MUST be an absolute URI. SHOULD use HTTPS (HTTP allowed only for confidential clients). MUST NOT include a fragment. See [Logout documentation](/api-reference/oauth/logout) for details.
            
            
                
                    backchannel_logout_session_required
                    boolean
                    optional
                
                If `true`, the OP MUST include the `sid` (Session ID) claim in the Logout Token to identify the RP session with the OP. Default: `false`
            
            
                
                    post_logout_redirect_uris
                    array of strings
                    optional
                
                URIs to redirect after logout. Used with RP-Initiated Logout.
            
        
    
    
        
            Registration Response
            
                
                    json
                    
                
                
```
{
  "client_id": "a1b2c3d4e5f6g7h8i9j0",
  "client_secret": "super_secret_value_store_me_safely",
  "client_name": "My Awesome App",
  "redirect_uris": [
    "https://app.example.com/callback",
    "https://app.example.com/silent-callback"
  ],
  "application_type": "web",
  "grant_types": ["authorization_code", "refresh_token", "implicit"],
  "response_types": ["code", "code id_token"],
  "token_endpoint_auth_method": "client_secret_basic",
  "client_id_issued_at": 1706817600,
  "client_secret_expires_at": 0
}
```

            
        
    

    
    

    
        ## Response

        
        
            Registration Response
            
                
                    client_id
                    
                        string
                        Unique identifier for the registered client
                    
                
                
                    client_secret
                    
                        string
                        Client secret (only shown once - store securely!)
                    
                
                
                    client_id_issued_at
                    
                        integer
                        Unix timestamp when client was created
                    
                
                
                    client_secret_expires_at
                    
                        integer
                        When secret expires (0 = never)
                    
                
            
        
        
        > [!NOTE]
> **Store Credentials Securely**

    
        
            Error Response
            
                
                    json
                    
                
                
```
{
  "error": "invalid_redirect_uri",
  "error_description": "Redirect URIs must not contain fragments"
}
```
