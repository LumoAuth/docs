# Token Endpoint

                
Exchange authorization codes for tokens and refresh expired tokens.

            
        

        
The token endpoint exchanges authorization codes for access tokens and ID tokens. It also handles
            refreshing expired tokens and issuing tokens for machine-to-machine authentication.

        ## Token Request

        
            POST
            /t/\{tenant\}/api/v1/oauth/token
        
        
        
Exchange an authorization code or refresh token for access tokens.

    
    
        
            Token Response
            
                
                    json
                    
                
                
```
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "tGzv3JOkF0XG5Qx2TlKWIA",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6...",
  "scope": "openid profile email"
}
```

            
        
    

    
    

    
        ## Authorization Code Grant

        
Exchange an authorization code for tokens. This is the most common grant for user authentication.

        
        
            
                
                    grant_type
                    string
                    required
                
                Must be `authorization_code`
            
            
                
                    code
                    string
                    required
                
                The authorization code received from the authorize endpoint
            
            
                
                    redirect_uri
                    string
                    required
                
                Must match the redirect_uri used in the authorization request
            
            
                
                    code_verifier
                    string
                    required
                
                PKCE code verifier that matches the code_challenge from authorization
            
            
                
                    client_id
                    string
                    required
                
                Your application's client ID
            
            
                
                    client_secret
                    string
                    conditional
                
                Required for confidential clients
            
        
    
    
        
            Authorization Code Exchange
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=SplxlOBeZQQYbYS6WxSbIA" \
  -d "redirect_uri=https://app.example.com/callback" \
  -d "code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1..." \
  -d "client_id=your_client_id" \
  -d "client_secret=your_client_secret"
```

            
        
    

    
    

    
        ## Refresh Token Grant

        
Get a new access token using a refresh token.

        
        
            
                
                    grant_type
                    string
                    required
                
                Must be `refresh_token`
            
            
                
                    refresh_token
                    string
                    required
                
                The refresh token from a previous token response
            
        
    
    
        
            Refresh Token
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=tGzv3JOkF0XG5Qx2TlKWIA" \
  -d "client_id=your_client_id" \
  -d "client_secret=your_client_secret"
```

            
        
    

    
    

    
        ## Client Credentials Grant

        
Machine-to-machine authentication without user involvement.

        
        
            
                
                    grant_type
                    string
                    required
                
                Must be `client_credentials`
            
            
                
                    scope
                    string
                    optional
                
                Space-separated list of requested scopes
            
        
    
    
        
            Client Credentials
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -u "client_id:client_secret" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "scope=admin:read admin:write"
```

            
        
    

    
    

    
        ## Token Exchange (RFC 8693)

        
Exchange one token type for another. Used for delegation and impersonation.

        
        
            
                
                    grant_type
                    string
                    required
                
                `urn:ietf:params:oauth:grant-type:token-exchange`
            
            
                
                    subject_token
                    string
                    required
                
                The token to exchange
            
            
                
                    subject_token_type
                    string
                    required
                
                `urn:ietf:params:oauth:token-type:access_token` or `urn:ietf:params:oauth:token-type:id_token`
            
        
    
    
        
    

    
    

    
        ## Token Response

        
        
            Response Attributes
            
                
                    access_token
                    
                        string
                        JWT access token for API authentication
                    
                
                
                    token_type
                    
                        string
                        Always `Bearer`
                    
                
                
                    expires_in
                    
                        integer
                        Seconds until the access token expires
                    
                
                
                    refresh_token
                    
                        string
                        Token to get new access tokens (if offline_access scope requested)
                    
                
                
                    id_token
                    
                        string
                        JWT containing user identity claims (if openid scope requested)
                    
                
                
                    scope
                    
                        string
                        Space-separated scopes granted
                    
                
            
        
    
    
        
            Token Response
            
                
                    json
                    
                
                
```
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "tGzv3JOkF0XG5Qx2TlKWIA",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6...",
  "scope": "openid profile email"
}
```
