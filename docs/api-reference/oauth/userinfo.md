# UserInfo Endpoint

        
The UserInfo endpoint returns claims about the authenticated end-user. It's part of the
            [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo)
            specification. The claims returned depend on the scopes granted to the access token.

    
    
        
            Request UserInfo
            
                
                    bash
                    
                
                
```
curl https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/userinfo \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

            
        
    

    
    

    
        ## Get User Info

        
            GET
            /t/\{tenant\}/api/v1/oauth/userinfo
        
        
            POST
            /t/\{tenant\}/api/v1/oauth/userinfo
        
        
        
Returns information about the user associated with the access token.
            The access token must be included in the Authorization header.

        
        > [!NOTE]
> **Required Scope**

    
        
            Response (profile + email scopes)
            
                
                    json
                    
                
                
```
{
  "sub": "user_123abc",
  "name": "Jane Smith",
  "given_name": "Jane",
  "family_name": "Smith",
  "email": "jane@example.com",
  "email_verified": true,
  "picture": "https://cdn.example.com/avatars/jane.jpg",
  "updated_at": 1706817600
}
```

            
        
    

    
    

    
        ## Scope-Based Claims

        
The claims returned depend on which scopes were requested during authorization:

        
        
| Scope | Claims Returned |
| --- | --- |
| `openid` | `sub` (always required) |
| `profile` | `name`, `given_name`, `family_name`, `picture`, `updated_at` |
| `email` | `email`, `email_verified` |
| `phone` | `phone_number`, `phone_number_verified` |
| `address` | `address` (structured object) |

    
    
        
            Python Example
            
                
                    python
                    
                
                
```
import requests

def get_user_info(access_token):
    """Fetch user profile from LumoAuth."""
    response = requests.get(
        "https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    if response.status_code == 200:
        user = response.json()
        print(f"Hello, {user['name']}!")
        return user
    else:
        raise Exception("Failed to fetch user info")
```

            
        
    

    
    

    
        ## Response Object

        
        
            UserInfo Claims
            
                
                    sub
                    
                        string
                        Subject identifier - unique user ID within the tenant
                    
                
                
                    name
                    
                        string
                        Full name (requires `profile` scope)
                    
                
                
                    given_name
                    
                        string
                        First name (requires `profile` scope)
                    
                
                
                    family_name
                    
                        string
                        Last name (requires `profile` scope)
                    
                
                
                    email
                    
                        string
                        Email address (requires `email` scope)
                    
                
                
                    email_verified
                    
                        boolean
                        Whether email is verified (requires `email` scope)
                    
                
                
                    picture
                    
                        string
                        Profile picture URL (requires `profile` scope)
                    
                
            
        
    
    
        
            Error Response
            
                
                    json
                    
                
                
```
// HTTP 401 - Invalid or expired token
{
  "error": "invalid_token",
  "error_description": "The access token is expired or invalid"
}
```
