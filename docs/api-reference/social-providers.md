# Social Providers

                
Configure social login providers like Google, GitHub, and Microsoft.

            
        

        
Social providers enable users to sign in using their existing accounts from popular services.
            Configure providers to allow seamless authentication without requiring users to create new passwords.

    
    
        
            Social Provider Object
            
                
                    json
                    
                
                
```
{
  "id": 5,
  "type": "google",
  "name": "Google",
  "clientId": "123456789.apps.googleusercontent.com",
  "isEnabled": true,
  "allowSignup": true,
  "autoLinkUsers": true,
  "scopes": ["email", "profile"]
}
```

            
        
    

    
    

    
        ## Supported Providers

        
        
| Provider | Type | Features |
| --- | --- | --- |
| **Google** | `google` | Email, profile, profile picture |
| **GitHub** | `github` | Email, username, repositories access |
| **Microsoft** | `microsoft` | Email, profile, Azure AD integration |
| **Apple** | `apple` | Email, name (Sign in with Apple) |
| **Facebook** | `facebook` | Email, profile, friends |
| **LinkedIn** | `linkedin` | Email, profile, work history |
| **Custom OIDC** | `oidc` | Any OpenID Connect provider |
| **SAML** | `saml` | Enterprise SSO via SAML 2.0 |

    
    

    
    

    
        ## The Social Provider Object

        
        
            Attributes
            
                
                    id
                    
                        integer
                        Unique identifier for the provider configuration
                    
                
                
                    type
                    
                        string
                        Provider type (google, github, microsoft, etc.)
                    
                
                
                    name
                    
                        string
                        Display name for the provider
                    
                
                
                    clientId
                    
                        string
                        OAuth client ID from the provider
                    
                
                
                    isEnabled
                    
                        boolean
                        Whether the provider is active
                    
                
                
                    allowSignup
                    
                        boolean
                        Whether new users can register via this provider
                    
                
                
                    autoLinkUsers
                    
                        boolean
                        Link to existing users with matching email
                    
                
                
                    scopes
                    
                        array
                        OAuth scopes to request from the provider
                    
                
            
        
    
    

    
    

    
        ## List Social Providers

        
            GET
            /t/\{tenant\}/api/v1/admin/social-providers
        
        
Returns all configured social providers for the tenant.

    
    

    
    

    
        ## Create Social Provider

        
            POST
            /t/\{tenant\}/api/v1/admin/social-providers
        
        
Configures a new social login provider.

        
        ### Request Body

        
            
                
                    type
                    string
                    required
                
                Provider type (google, github, microsoft, etc.)
            
            
                
                    clientId
                    string
                    required
                
                OAuth client ID from the provider's developer console
            
            
                
                    clientSecret
                    string
                    required
                
                OAuth client secret from the provider
            
            
                
                    name
                    string
                    optional
                
                Custom display name (defaults to provider name)
            
            
                
                    allowSignup
                    boolean
                    optional
                
                Allow new user registration (default: true)
            
        
    
    
        
            Configure Google
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/admin/social-providers \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "google",
    "clientId": "YOUR_GOOGLE_CLIENT_ID",
    "clientSecret": "YOUR_GOOGLE_CLIENT_SECRET"
  }'
```

            
        
        
        
            Configure GitHub
            
                
                    python
                    
                
                
```
import requests

response = requests.post(
    "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/social-providers",
    headers={"Authorization": "Bearer sk_live_xxxxx"},
    json={
        "type": "github",
        "clientId": "Iv1.abc123...",
        "clientSecret": "secret123...",
        "scopes": ["user:email", "read:user"]
    }
)
```

            
        
    

    
    

    
        ## Update Social Provider

        
            PUT
            /t/\{tenant\}/api/v1/admin/social-providers/\{provider_id\}
        
    
    

    
    

    
        ## Delete Social Provider

        
            DELETE
            /t/\{tenant\}/api/v1/admin/social-providers/\{provider_id\}
        
        
        > [!WARNING]
> **User Impact**

    

    
    

    
        ## Custom OIDC Provider

        
Connect any OpenID Connect compliant identity provider by specifying the issuer URL.
            LumoAuth will automatically discover the provider's configuration.

    
    
        
            Custom OIDC Provider
            
                
                    json
                    
                
                
```
{
  "type": "oidc",
  "name": "Corporate SSO",
  "clientId": "your-client-id",
  "clientSecret": "your-secret",
  "issuerUrl": "https://sso.company.com",
  "scopes": ["openid", "profile", "email"]
}
```
