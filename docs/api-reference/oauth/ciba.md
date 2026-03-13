# CIBA (Backchannel Authentication)

        
CIBA ([Client-Initiated Backchannel Authentication](https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0.html))
            enables authentication flows where the user authenticates on a separate device from where the service runs.
            Perfect for call centers, IoT devices, or situations where the user can't interact directly with the application.

    
    
        
            Initiate Backchannel Auth
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/bc-authorize \
  -u "client_id:client_secret" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "scope=openid profile" \
  -d "login_hint=jane@example.com" \
  -d "binding_message=Approve login for Order #12345"
```

            
        
    

    
    

    
        ## How CIBA Works

        
1. **Initiate** - Your application sends a backchannel authentication request with user hint
2. **Notify** - LumoAuth sends a push notification to the user's registered device
3. **Approve** - User reviews and approves the request on their device
4. **Poll** - Your application polls the token endpoint until approval
5. **Receive** - Tokens are issued after user approval

        
        > [!NOTE]
> **Use Cases**

    
        
            Backchannel Response
            
                
                    json
                    
                
                
```
{
  "auth_req_id": "1c266114-a1be-4252-8ad1-04986c5b9ac1",
  "expires_in": 120,
  "interval": 5
}
```

            
        
    

    
    

    
        ## Backchannel Authentication Request

        
            POST
            /t/\{tenant\}/api/v1/oauth/bc-authorize
        
        
        
Initiate a backchannel authentication request.

        ### Request Parameters

        
            
                
                    scope
                    string
                    required
                
                Must include `openid`. Add other scopes as needed.
            
            
                
                    login_hint
                    string
                    conditional
                
                User identifier (email, phone, or username). One of `login_hint`, `login_hint_token`, or `id_token_hint` required.
            
            
                
                    binding_message
                    string
                    optional
                
                Human-readable message shown to user during approval (e.g., "Approve login for Order #12345")
            
            
                
                    requested_expiry
                    integer
                    optional
                
                Requested expiry time in seconds for the auth request (default: 120)
            
            
                
                    user_code
                    string
                    optional
                
                Code the user must enter to confirm (for additional security)
            
        
    
    
        
            Poll for Tokens
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -u "client_id:client_secret" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:openid:params:grant-type:ciba" \
  -d "auth_req_id=1c266114-a1be-4252-8ad1-04986c5b9ac1"
```

            
        
    

    
    

    
        ## Response

        
        
            Authentication Response
            
                
                    auth_req_id
                    
                        string
                        Unique ID to track this authentication request
                    
                
                
                    expires_in
                    
                        integer
                        Seconds until the request expires
                    
                
                
                    interval
                    
                        integer
                        Minimum seconds to wait between polling attempts
                    
                
            
        
    
    
        
            Pending Response
            
                
                    json
                    
                
                
```
// HTTP 400 - Keep polling
{
  "error": "authorization_pending",
  "error_description": "The authorization request is still pending"
}
```

            
        
    

    
    

    
        ## Polling for Tokens

        
After initiating the request, poll the token endpoint using the CIBA grant type:

        
        
            POST
            /t/\{tenant\}/api/v1/oauth/token
        
        
        
            
                
                    grant_type
                    string
                    required
                
                `urn:openid:params:grant-type:ciba`
            
            
                
                    auth_req_id
                    string
                    required
                
                The auth_req_id from the backchannel response
            
        
        
        ### Polling Responses

        
| Status | Error Code | Meaning |
| --- | --- | --- |
| 200 | - | User approved! Tokens returned. |
| 400 | `authorization_pending` | User hasn't responded yet. Keep polling. |
| 400 | `slow_down` | Polling too fast. Increase interval by 5 seconds. |
| 400 | `access_denied` | User denied the request. |
| 400 | `expired_token` | Request expired before user responded. |

    
    
        
            Success Response
            
                
                    json
                    
                
                
```
// HTTP 200 - User approved!
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "id_token": "eyJhbGciOiJSUzI1NiIs..."
}
```
