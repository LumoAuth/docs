# Pushed Authorization Requests

        
PAR ([RFC 9126](https://www.rfc-editor.org/rfc/rfc9126)) allows clients to push
            authorization request parameters directly to the authorization server before redirecting the user.
            This provides better security by keeping sensitive parameters off the URL and enabling request object encryption.

        
        > [!NOTE]
> **Required for FAPI 2.0**

    
        
            Step 1: Push Authorization Request
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/par \
  -u "client_id:client_secret" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "response_type=code" \
  -d "redirect_uri=https://app.example.com/callback" \
  -d "scope=openid profile email" \
  -d "code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK..." \
  -d "code_challenge_method=S256" \
  -d "state=abc123"
```

            
        
    

    
    

    
        ## How PAR Works

        
1. **Push** - Your server sends authorization parameters to the PAR endpoint
2. **Receive** - LumoAuth returns a `request_uri` (valid for 600 seconds)
3. **Redirect** - Redirect user to authorize with just `client_id` and `request_uri`
4. **Exchange** - Continue with normal authorization code flow

    
    
        
            Benefits of PAR
            
                
                    text
                
                
```
✓ Parameters not exposed in browser URL/history
✓ Request integrity protected by client authentication
✓ Supports larger request payloads
✓ Enables request object encryption
✓ Required for FAPI 2.0 compliance
```

            
        
    

    
    

    
        ## PAR Endpoint

        
            POST
            /t/\{tenant\}/api/v1/oauth/par
        
        
        
Push authorization request parameters and receive a request_uri.

        ### Request Parameters

        
            
                
                    response_type
                    string
                    required
                
                Must be `code`
            
            
                
                    client_id
                    string
                    required
                
                Your client ID
            
            
                
                    redirect_uri
                    string
                    required
                
                Redirect URI (must be registered)
            
            
                
                    scope
                    string
                    optional
                
                Space-separated scopes to request
            
            
                
                    code_challenge
                    string
                    required
                
                PKCE code challenge
            
            
                
                    code_challenge_method
                    string
                    required
                
                Must be `S256`
            
            
                
                    state
                    string
                    optional
                
                CSRF protection value
            
            
                
                    nonce
                    string
                    optional
                
                Replay protection value
            
        
    
    
        
            PAR Response
            
                
                    json
                    
                
                
```
{
  "request_uri": "urn:ietf:params:oauth:request_uri:6esc_11ACC5bwc014ltc14eY22c",
  "expires_in": 600
}
```

            
        
    

    
    

    
        ## PAR Response

        
        
            Response Attributes
            
                
                    request_uri
                    
                        string
                        URI to use in the authorization request (starts with `urn:ietf:params:oauth:request_uri:`)
                    
                
                
                    expires_in
                    
                        integer
                        Seconds until the request_uri expires (default: 600)
                    
                
            
        
    
    
        
            Step 2: Redirect User
            
                
                    url
                    
                
                
```
https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/authorize?
  client_id=your_client_id&
  request_uri=urn:ietf:params:oauth:request_uri:6esc_11ACC5bwc014ltc14eY22c
```

            
        
    

    
    

    
        ## Using the Request URI

        
After receiving the request_uri, redirect the user to the authorization endpoint with minimal parameters:

        
        
            
                
                    client_id
                    string
                    required
                
                Your client ID (must match the PAR request)
            
            
                
                    request_uri
                    string
                    required
                
                The request_uri from the PAR response
