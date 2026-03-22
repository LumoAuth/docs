# Device Authorization Grant (RFC 8628)

        
The [Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628)
            enables OAuth on devices with limited input capabilities such as smart TVs, gaming consoles,
            CLI tools, and IoT devices. Users authorize the device by entering a short code on a separate
            device with a full browser.

    
    
        
            Request Device Code
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/device_authorization \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=my-tv-app" \
  -d "scope=openid profile"
```

            
        
    

    
    

    
        ## How Device Authorization Works

        
1. **Request Codes** - Device requests a `device_code` and `user_code`
2. **Display** - Device shows the `user_code` and verification URL to the user
3. **Enter Code** - User visits the URL on their phone/computer and enters the code
4. **Authenticate** - User logs in and approves the authorization
5. **Poll** - Device polls the token endpoint until authorization completes
6. **Receive Tokens** - Access and refresh tokens are issued

        
        > [!NOTE]
> **Use Cases**

    
        
            Device Authorization Response
            
                
                    json
                    
                
                
```
{
  "device_code": "GmRhmhcxhwAzkoEqiMEg_DnyEysNkuNhszIySk9eS",
  "user_code": "WDJB-MJHT",
  "verification_uri": "https://app.lumoauth.dev/device",
  "verification_uri_complete": "https://app.lumoauth.dev/device?user_code=WDJB-MJHT",
  "expires_in": 600,
  "interval": 5
}
```

            
        
    

    
    

    
        ## Device Authorization Endpoint

        
            POST
            /t/\{tenant\}/api/v1/oauth/device_authorization
        
        
        
Request device and user codes to start the authorization flow.

        ### Request Parameters

        
            
                client_id required
                string
                
                    The client identifier issued to your application.
                
            
            
                scope optional
                string
                
                    Space-separated list of requested scopes. Defaults to client's allowed scopes if not provided.
                
            
        

        ### Response Fields

        
            
                device_code
                string
                
                    High-entropy verification code for device polling. Keep this secret.
                
            
            
                user_code
                string
                
                    Short, easy-to-type code for the user to enter. Format: `XXXX-XXXX`
                
            
            
                verification_uri
                string
                
                    URL where the user should go to enter the code.
                
            
            
                verification_uri_complete
                string
                
                    URL with the user_code pre-filled. Use this to generate QR codes.
                
            
            
                expires_in
                integer
                
                    Seconds until the codes expire. Default: 600 (10 minutes).
                
            
            
                interval
                integer
                
                    Minimum seconds between polling requests. Default: 5.
                
            
        
    
    
        
            Request
            
                
                    bash
                    
                
                
```
curl -X POST \
  https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/device_authorization \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=my-tv-app" \
  -d "scope=openid profile email"
```

            
        
        
            Response
            
                
                    json
                    200
                
                
```
{
  "device_code": "GmRhmhcxhwAzkoEqiMEg_DnyEysNkuNhszIySk9eS",
  "user_code": "WDJB-MJHT",
  "verification_uri": "https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/device",
  "verification_uri_complete": "https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/device?user_code=WDJB-MJHT",
  "expires_in": 600,
  "interval": 5
}
```

            
        
    

    
    

    
        ## Token Endpoint (Polling)

        
            POST
            /t/\{tenant\}/api/v1/oauth/token
        
        
        
Poll this endpoint with the `device_code` until the user completes authorization.
            Wait at least `interval` seconds between requests.

        ### Request Parameters

        
            
                grant_type required
                string
                
                    Must be `urn:ietf:params:oauth:grant-type:device_code`
                
            
            
                device_code required
                string
                
                    The `device_code` received from the device authorization response.
                
            
            
                client_id required
                string
                
                    The client identifier (required for public clients).
                
            
        
    
    
        
            Polling Request
            
                
                    bash
                    
                
                
```
curl -X POST \
  https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:device_code" \
  -d "device_code=GmRhmhcxhwAzkoEqiMEg_DnyEysNkuNhszIySk9eS" \
  -d "client_id=my-tv-app"
```

            
        
    

    
    

    
        ## Polling Responses

        
        ### Authorization Pending

        
User has not yet completed authorization. Continue polling.

        ### Slow Down

        
Polling too frequently. Add 5 seconds to your interval and continue.

        > [!WARNING]
> **Important**

        
            Slow Down
            
                
                    json
                    400
                
                
```
{
  "error": "slow_down",
  "error_description": "Polling too frequently. Please wait 10 seconds between requests."
}
```

            
        
        
            Access Denied
            
                
                    json
                    400
                
                
```
{
  "error": "access_denied",
  "error_description": "The user denied the authorization request"
}
```

            
        
        
            Expired Token
            
                
                    json
                    400
                
                
```
{
  "error": "expired_token",
  "error_description": "The device code has expired"
}
```

            
        
    

    
    

    
        ## Success Response

        
When the user approves the authorization, the token endpoint returns an access token.

        ### Response Fields

        
            
                access_token
                string
                
                    The access token for API requests.
                
            
            
                token_type
                string
                
                    Token type, typically `Bearer` or `DPoP`.
                
            
            
                expires_in
                integer
                
                    Token lifetime in seconds.
                
            
            
                refresh_token
                string
                
                    Token for obtaining new access tokens.
                
            
            
                scope
                string
                
                    Granted scopes (space-separated).
                
            
        
    
    
        
            Token Response
            
                
                    json
                    200
                
                
```
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "8xLOxBtZp8...",
  "scope": "openid profile email"
}
```

            
        
    

    
    

    
        ## User Code Format

        
User codes follow RFC 8628 Section 6.1 recommendations:

        
        
- **Charset:** Base-20 using consonants only (BCDFGHJKLMNPQRSTVWXZ)
- **Format:** `XXXX-XXXX` (8 characters with dash)
- **Case insensitive:** Users can enter in any case

        > [!NOTE]
> **Why Consonants Only?**

    
        
            Display to User
            
                
                    text
                
                
```
To sign in, visit:
https://app.lumoauth.dev/device

Enter code:  WDJB-MJHT

Code expires in 10 minutes
```

            
        
    

    
    

    
        ## Complete Implementation

        
A complete Python implementation showing the full device authorization flow.

        ### Implementation Steps

        
1. Request device and user codes
2. Display instructions to the user
3. Poll the token endpoint with exponential backoff
4. Handle all error responses appropriately
5. Store tokens securely when received

    
    
        
            Python Example
            
                
                    python
                    
                
                
```
import requests
import time

AUTH_SERVER = "https://app.lumoauth.dev/t/acme-corp"
CLIENT_ID = "my-tv-app"

def device_authorization_flow():
    # Step 1: Request device and user codes
    resp = requests.post(f"{AUTH_SERVER}/oauth/device_authorization", data={
        "client_id": CLIENT_ID,
        "scope": "openid profile email"
    })
    auth_data = resp.json()
    
    # Step 2: Display instructions to user
    print(f"Visit: {auth_data['verification_uri']}")
    print(f"Enter code: {auth_data['user_code']}")
    
    # Step 3: Poll for authorization
    device_code = auth_data['device_code']
    interval = auth_data['interval']
    
    while True:
        time.sleep(interval)
        
        token_resp = requests.post(f"{AUTH_SERVER}/oauth/token", data={
            "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
            "device_code": device_code,
            "client_id": CLIENT_ID
        })
        
        if token_resp.status_code == 200:
            return token_resp.json()  # Success!
        
        error = token_resp.json().get("error")
        
        if error == "authorization_pending":
            continue  # Keep polling
        elif error == "slow_down":
            interval += 5  # Increase interval
        else:
            raise Exception(f"Error: {error}")
```

            
        
    

    
    

    
        ## Error Codes Reference

        
| Error Code | HTTP | Description | Action |
| --- | --- | --- | --- |
| `authorization_pending` | 400 | User hasn't completed authorization | Keep polling |
| `slow_down` | 400 | Polling too frequently | Add 5s to interval |
| `access_denied` | 400 | User denied the request | Stop, show error |
| `expired_token` | 400 | Device code expired | Restart flow |
| `invalid_request` | 400 | Missing required parameter | Check request |
| `invalid_client` | 401 | Unknown client_id | Verify registration |
| `invalid_grant` | 400 | Invalid device_code | Restart flow |

    
    
        
            Discovery Metadata
            
                
                    json
                
                
```
// From /.well-known/openid-configuration
{
  "device_authorization_endpoint": 
    "https://app.lumoauth.dev/.../oauth/device_authorization",
  "grant_types_supported": [
    "authorization_code",
    "refresh_token",
    "urn:ietf:params:oauth:grant-type:device_code"
  ]
}
```
